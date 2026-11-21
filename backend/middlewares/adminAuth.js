const db = require("../models");
const User = db.user;

// Verify admin role
exports.verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).send({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    if (user.userType !== 'admin') {
      console.log("❌ Admin access denied for user:", userId);
      return res.status(403).send({
        success: false,
        message: "Admin access required"
      });
    }

    // Admin users should always have access regardless of isActive status

    next();
  } catch (error) {
    console.error('❌ Admin verification error:', error.message);
    res.status(500).send({
      success: false,
      message: "Error verifying admin status"
    });
  }
};