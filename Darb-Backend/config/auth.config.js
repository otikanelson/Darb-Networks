require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || "darb-network-secret-key",
  expiresIn: 86400 // 24 hours
};