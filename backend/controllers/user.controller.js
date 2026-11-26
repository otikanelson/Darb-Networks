const db = require("../models");
const User = db.user;
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { sendError } = require("../utils/http");
const { formatSafeUserData, maskBVN, maskAccountNumber } = require("../utils/dataProtection");
const { getAuth } = require("../config/firebase");

// Helper function to check and configure Cloudinary at runtime
const ensureCloudinaryConfigured = () => {
  const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (isConfigured) {
    // Configure Cloudinary each time to ensure fresh config
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  return isConfigured;
};

// Use memory storage — no disk writes (required for Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
});

/**
 * STEP 5: Firebase Auth - Get user profile
 * 
 * Returns user's profile data from MySQL
 * Authentication verified by firebaseAuth.verifyFirebaseToken middleware
 * req.userId and req.firebaseUid already set by middleware
 */
exports.getProfile = (req, res) => {
  const userId = req.userId;

  User.findByPk(userId, {
    attributes: { exclude: ['password'] } // Don't send password
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      res.status(200).send({
        success: true,
        data: formatSafeUserData(user)
      });
    })
    .catch(err => {
      return sendError(res, 500, "Error retrieving user profile.", err);
    });
};

/**
 * STEP 5: Firebase Auth - Update user profile
 * 
 * Updates user profile fields (fullName, companyName, phoneNumber, address, BVN, etc.)
 * Note: userType is NOT updated via this endpoint (set manually in DB only)
 * Authentication verified by firebaseAuth.verifyFirebaseToken middleware
 * req.userId already set by middleware
 */
exports.updateProfile = (req, res) => {
  const userId = req.userId;

  // Define which fields can be updated
  const allowedFields = [
    'fullName',
    'companyName',
    'phoneNumber',
    'address',
    'bvn',
    'cacNumber',
    'accountNumber',
    'bankName'
  ];

  // Build update object with only allowed fields that are present
  const updateData = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Validation
  const errors = validateProfileData(updateData);
  if (errors.length > 0) {
    return res.status(400).send({
      success: false,
      message: "Validation failed",
      errors: errors
    });
  }

  // Update user
  User.update(updateData, {
    where: { id: userId }
  })
    .then(([affectedRows]) => {
      if (affectedRows === 0) {
        return res.status(404).send({
          success: false,
          message: "User not found or no changes made."
        });
      }

      // Fetch updated user data
      return User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
    })
    .then(updatedUser => {
      res.status(200).send({
        success: true,
        message: "Profile updated successfully.",
        data: formatSafeUserData(updatedUser)
      });
    })
    .catch(err => {
      return sendError(res, 500, "Error updating profile.", err);
    });
};

/**
 * STEP 5: Firebase Auth - Update Email
 * 
 * NEW FLOW:
 * 1. User requests email change via /api/users/email
 * 2. Backend sends email change request to Firebase (admin SDK)
 * 3. Firebase sends verification email to NEW email
 * 4. User verifies via Firebase email link
 * 5. Firebase updates user's email
 * 6. Frontend calls /api/auth/verify-email to sync MySQL
 * 
 * Note: Password verification is handled by Firebase, not backend
 */
exports.updateEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const firebaseUid = req.firebaseUid;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).send({
        success: false,
        message: "New email is required."
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).send({
        success: false,
        message: "Invalid email format."
      });
    }

    // Check if new email already exists in MySQL
    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).send({
        success: false,
        message: "Email already in use."
      });
    }

    // Update email in Firebase
    const auth = getAuth();
    await auth.updateUser(firebaseUid, { email: newEmail });

    // Update email in MySQL (Firebase will mark email as unverified)
    // Set isEmailVerified to false since new email needs verification
    await User.update(
      {
        email: newEmail,
        isEmailVerified: false
      },
      { where: { id: userId } }
    );

    res.status(200).send({
      success: true,
      message: "Email updated successfully. Please verify your new email address via the verification link sent by Firebase.",
      data: {
        email: newEmail,
        isEmailVerified: false
      }
    });
  } catch (error) {
    console.error("Error updating email:", error.message);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).send({
        success: false,
        message: "Email already in use."
      });
    }
    return sendError(res, 500, "Error updating email.", error);
  }
};

/**
 * STEP 5: Firebase Auth - Update Password
 * 
 * NEW FLOW:
 * 1. User requests password change via /api/users/password
 * 2. Backend sends password reset request to Firebase (admin SDK)
 * 3. Firebase sends "reset password" email to user
 * 4. User clicks link in email and sets new password in Firebase UI
 * 5. Firebase updates password in Firebase Auth
 * 
 * Note: Password change happens entirely in Firebase, not backend
 * This endpoint initiates the process by sending reset email
 */
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const userEmail = req.userEmail;

    if (!userEmail) {
      return res.status(400).send({
        success: false,
        message: "User email not found."
      });
    }

    // Send password reset email via Firebase
    const auth = getAuth();
    await auth.generatePasswordResetLink(userEmail);

    res.status(200).send({
      success: true,
      message: "Password reset email sent successfully. Please check your email and follow the link to set a new password.",
      data: {
        email: userEmail
      }
    });
  } catch (error) {
    console.error("Error initiating password reset:", error.message);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).send({
        success: false,
        message: "User not found."
      });
    }
    return sendError(res, 500, "Error initiating password reset.", error);
  }
};

// Upload profile image
exports.uploadProfileImage = [
  upload.single('profileImage'),
  async (req, res) => {
    try {
      const userId = req.userId;

      if (!req.file) {
        return res.status(400).send({ success: false, message: "No image file provided." });
      }

      // Check Cloudinary configuration at runtime
      const cloudinaryConfigured = ensureCloudinaryConfigured();

      if (!cloudinaryConfigured) {
        console.error('❌ Image upload service not configured');
        return res.status(500).send({
          success: false,
          message: "Image upload service not configured. Please contact support."
        });
      }

      // Upload buffer directly to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'darb/profiles', resource_type: 'image' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });

      const imageUrl = uploadResult.secure_url;

      const [affectedRows] = await User.update(
        { profileImageUrl: imageUrl },
        { where: { id: userId } }
      );

      if (affectedRows === 0) {
        return res.status(404).send({ success: false, message: "User not found." });
      }

      const updatedUser = await User.findByPk(userId, { attributes: { exclude: ['password'] } });

      res.status(200).send({
        success: true,
        message: "Profile image updated successfully.",
        data: {
          profileImageUrl: imageUrl,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            userType: updatedUser.userType,
            profileImageUrl: updatedUser.profileImageUrl,
          },
        },
      });
    } catch (error) {
      console.error("❌ Upload profile image error:", error);
      res.status(500).send({
        success: false,
        message: "Error updating profile image."
      });
    }
  },
];

// Delete profile image
exports.deleteProfileImage = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).send({ success: false, message: "User not found." });

    // Delete from Cloudinary if configured and it's a cloudinary URL
    const cloudinaryConfigured = ensureCloudinaryConfigured();
    if (cloudinaryConfigured && user.profileImageUrl && user.profileImageUrl.includes('cloudinary.com')) {
      const publicId = user.profileImageUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId).catch(() => { });
    }

    await User.update({ profileImageUrl: null }, { where: { id: userId } });
    res.status(200).send({ success: true, message: "Profile image deleted successfully." });
  } catch (err) {
    return sendError(res, 500, "Error deleting profile image.", err);
  }
};

// Validation helper function
function validateProfileData(data) {
  const errors = [];

  // Full name validation
  if (data.fullName !== undefined) {
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.push("Full name must be at least 2 characters long.");
    }
    if (data.fullName.length > 100) {
      errors.push("Full name cannot exceed 100 characters.");
    }
  }

  // Phone number validation
  if (data.phoneNumber !== undefined && data.phoneNumber) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      errors.push("Invalid phone number format.");
    }
  }

  // BVN validation (Nigerian Bank Verification Number)
  if (data.bvn !== undefined && data.bvn) {
    if (!/^\d{11}$/.test(data.bvn)) {
      errors.push("BVN must be exactly 11 digits.");
    }
  }

  // CAC Number validation
  if (data.cacNumber !== undefined && data.cacNumber) {
    if (data.cacNumber.length > 50) {
      errors.push("CAC Number cannot exceed 50 characters.");
    }
  }

  // Account number validation
  if (data.accountNumber !== undefined && data.accountNumber) {
    if (!/^\d{10}$/.test(data.accountNumber)) {
      errors.push("Account number must be exactly 10 digits.");
    }
  }

  return errors;
}

module.exports = {
  getProfile: exports.getProfile,
  updateProfile: exports.updateProfile,
  updateEmail: exports.updateEmail,
  updatePassword: exports.updatePassword,
  uploadProfileImage: exports.uploadProfileImage,
  deleteProfileImage: exports.deleteProfileImage
};