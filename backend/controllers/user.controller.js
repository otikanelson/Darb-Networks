const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (only if credentials are available)
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️ Cloudinary credentials not configured — image uploads will fail');
}

// Use memory storage — no disk writes (required for Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
});

// Get user profile
exports.getProfile = (req, res) => {
  const userId = req.userId;
  
  User.findByPk(userId, {
    attributes: { exclude: ['password'] } // Don't send password
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      console.log('Profile image URL from database:', user.profileImageUrl);

      res.status(200).send({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          userType: user.userType,
          companyName: user.companyName,
          phoneNumber: user.phoneNumber,
          address: user.address,
          bvn: user.bvn,
          cacNumber: user.cacNumber,
          accountNumber: user.accountNumber,
          bankName: user.bankName,
          profileImageUrl: user.profileImageUrl,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    })
    .catch(err => {
      console.error("Get profile error:", err);
      res.status(500).send({ 
        message: "Error retrieving user profile.",
        error: err.message 
      });
    });
};

// Update user profile
exports.updateProfile = (req, res) => {
  const userId = req.userId;
  
  // Define which fields can be updated
  const allowedFields = [
    'fullName',
    'userType', 
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
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          userType: updatedUser.userType,
          companyName: updatedUser.companyName,
          phoneNumber: updatedUser.phoneNumber,
          address: updatedUser.address,
          bvn: updatedUser.bvn,
          cacNumber: updatedUser.cacNumber,
          accountNumber: updatedUser.accountNumber,
          bankName: updatedUser.bankName,
          profileImageUrl: updatedUser.profileImageUrl,
          isActive: updatedUser.isActive,
          isVerified: updatedUser.isVerified,
          updatedAt: updatedUser.updatedAt
        }
      });
    })
    .catch(err => {
      console.error("Update profile error:", err);
      res.status(500).send({
        success: false,
        message: "Error updating profile.",
        error: err.message
      });
    });
};

// Update email (requires special handling)
exports.updateEmail = (req, res) => {
  const userId = req.userId;
  const { newEmail, currentPassword } = req.body;
  
  if (!newEmail || !currentPassword) {
    return res.status(400).send({
      success: false,
      message: "New email and current password are required."
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
  
  User.findByPk(userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found."
        });
      }
      
      // Verify current password
      const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({
          success: false,
          message: "Current password is incorrect."
        });
      }
      
      // Check if new email already exists
      return User.findOne({ where: { email: newEmail } });
    })
    .then(existingUser => {
      if (existingUser) {
        return res.status(400).send({
          success: false,
          message: "Email already in use."
        });
      }
      
      // Update email and set isVerified to false
      return User.update(
        { 
          email: newEmail,
          isVerified: false  // Require re-verification
        },
        { where: { id: userId } }
      );
    })
    .then(() => {
      res.status(200).send({
        success: true,
        message: "Email updated successfully. Please verify your new email address."
      });
    })
    .catch(err => {
      console.error("Update email error:", err);
      res.status(500).send({
        success: false,
        message: "Error updating email.",
        error: err.message
      });
    });
};

// Update password
exports.updatePassword = (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).send({
      success: false,
      message: "Current password and new password are required."
    });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).send({
      success: false,
      message: "New password must be at least 6 characters long."
    });
  }

  User.findByPk(userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found."
        });
      }

      const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({
          success: false,
          message: "Current password is incorrect."
        });
      }

      const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
      return User.update(
        { password: hashedNewPassword },
        { where: { id: userId } }
      );
    })
    .then(() => {
      res.status(200).send({
        success: true,
        message: "Password updated successfully."
      });
    })
    .catch(err => {
      console.error("Update password error:", err);
      res.status(500).send({
        success: false,
        message: "Error updating password.",
        error: err.message
      });
    });
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

      if (!cloudinaryConfigured) {
        return res.status(500).send({ success: false, message: "Image upload service not configured." });
      }

      // Upload buffer directly to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'darb/profiles', resource_type: 'image' },
          (error, result) => { if (error) reject(error); else resolve(result); }
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
      console.error("Upload profile image error:", error);
      res.status(500).send({ success: false, message: "Error updating profile image.", error: error.message });
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
    if (cloudinaryConfigured && user.profileImageUrl && user.profileImageUrl.includes('cloudinary.com')) {
      const publicId = user.profileImageUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await User.update({ profileImageUrl: null }, { where: { id: userId } });
    res.status(200).send({ success: true, message: "Profile image deleted successfully." });
  } catch (err) {
    console.error("Delete profile image error:", err);
    res.status(500).send({ success: false, message: "Error deleting profile image.", error: err.message });
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
  
  // User type validation - UPDATE THIS PART
  if (data.userType !== undefined) {
    if (!['founder', 'investor', 'admin'].includes(data.userType)) {
      errors.push("User type must be 'founder', 'investor', or 'admin'.");
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