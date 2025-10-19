const db = require("../models");
const User = db.user;

// Verify admin role
exports.verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    console.log("🔐 Admin verification for user ID:", userId);
    
    if (!userId) {
      console.log("❌ No user ID provided");
      return res.status(401).send({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    console.log("👤 User found:", {
      id: user.id,
      email: user.email,
      userType: user.userType,
      isActive: user.isActive
    });

    if (user.userType !== 'admin') {
      console.log("❌ User is not admin:", user.userType);
      return res.status(403).send({
        success: false,
        message: "Admin access required"
      });
    }

    // Admin users should always have access regardless of isActive status
    console.log("✅ Admin verification successful");
    
    next();
  } catch (error) {
    console.error('❌ Admin verification error:', error);
    res.status(500).send({
      success: false,
      message: "Error verifying admin status"
    });
  }
};