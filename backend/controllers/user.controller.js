const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
    console.log('📁 Upload destination:', uploadDir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      console.log('📂 Creating directory:', uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📄 Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
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
      
      console.log('🔄 Image upload request for user ID:', userId);
      console.log('📄 File info:', req.file);
      
      if (!req.file) {
        return res.status(400).send({
          success: false,
          message: "No image file provided."
        });
      }
      
      // Create URL for the uploaded image
      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      console.log('🔗 Generated image URL:', imageUrl);
      
      // Update user's profile image URL in database with explicit logging
      console.log('💾 Updating database for user:', userId);
      console.log('💾 Setting profileImageUrl to:', imageUrl);
      
      const [affectedRows] = await User.update(
        { profileImageUrl: imageUrl },
        { 
          where: { id: userId },
          logging: console.log // This will show the actual SQL query
        }
      );
      
      console.log('📊 Database update affected rows:', affectedRows);
      
      if (affectedRows === 0) {
        console.error('❌ No rows updated - user not found');
        return res.status(404).send({
          success: false,
          message: "User not found."
        });
      }
      
      // Verify the update worked by fetching the user
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      console.log('✅ User after update:', {
        id: updatedUser.id,
        email: updatedUser.email,
        profileImageUrl: updatedUser.profileImageUrl
      });
      
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
            profileImageUrl: updatedUser.profileImageUrl
          }
        }
      });
      
    } catch (error) {
      console.error("❌ Update profile image error:", error);
      if (req.file && req.file.path) {
        try {
          const fs = require('fs');
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      res.status(500).send({
        success: false,
        message: "Error updating profile image.",
        error: error.message
      });
    }
  }
];

// Delete profile image
exports.deleteProfileImage = (req, res) => {
  const userId = req.userId;
  
  User.findByPk(userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found."
        });
      }
      
      // Delete file from filesystem if it exists
      if (user.profileImageUrl) {
        const filePath = path.join(__dirname, '..', user.profileImageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Remove image URL from database
      return User.update(
        { profileImageUrl: null },
        { where: { id: userId } }
      );
    })
    .then(() => {
      res.status(200).send({
        success: true,
        message: "Profile image deleted successfully."
      });
    })
    .catch(err => {
      console.error("Delete profile image error:", err);
      res.status(500).send({
        success: false,
        message: "Error deleting profile image.",
        error: err.message
      });
    });
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