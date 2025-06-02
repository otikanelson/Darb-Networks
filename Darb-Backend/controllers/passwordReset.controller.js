const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Email configuration (you'll need to configure this with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).send({
        message: "Email is required"
      });
    }

    // Check if user exists and is active
    const user = await User.findOne({ 
      where: { 
        email: email,
        isActive: true  // Only allow reset for active users
      } 
    });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).send({
        message: "If an account with that email exists, we've sent a password reset link."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    await db.sequelize.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      {
        replacements: [email, resetToken, expiresAt],
        type: db.sequelize.QueryTypes.INSERT
      }
    );

    // Send email (for now, we'll just log it)
    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password?token=${resetToken}`;
    
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    
    // TODO: Send actual email
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'Password Reset Request',
    //   html: `Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.`
    // });

    res.status(200).send({
      message: "If an account with that email exists, we've sent a password reset link."
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).send({
      message: "Error processing password reset request."
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).send({
        message: "Token and new password are required"
      });
    }

    // Find valid, unused token
    const [resetRecord] = await db.sequelize.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      {
        replacements: [token],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!resetRecord) {
      return res.status(400).send({
        message: "Invalid or expired reset token"
      });
    }

    // Find user and verify they're active
    const user = await User.findOne({ 
      where: { 
        email: resetRecord.email,
        isActive: true  // Only allow reset for active users
      } 
    });
    
    if (!user) {
      return res.status(404).send({
        message: "User not found or account is inactive"
      });
    }

    // Update password
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await User.update(
      { password: hashedPassword },
      { where: { email: resetRecord.email } }
    );

    // Mark token as used
    await db.sequelize.query(
      'UPDATE password_resets SET used = TRUE WHERE token = ?',
      {
        replacements: [token],
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    res.status(200).send({
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).send({
      message: "Error resetting password."
    });
  }
};

// Cleanup expired tokens (optional utility function)
exports.cleanupExpiredTokens = async () => {
  try {
    await db.sequelize.query(
      'DELETE FROM password_resets WHERE expires_at < NOW()',
      { type: db.sequelize.QueryTypes.DELETE }
    );
    console.log('Expired password reset tokens cleaned up');
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};