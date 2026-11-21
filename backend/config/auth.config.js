require('dotenv').config();

// Validate JWT_SECRET at startup
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  console.error(
    '\n❌ FATAL: JWT_SECRET is missing or too short.\n' +
    'JWT_SECRET must be at least 32 characters long.\n' +
    'Generate a new secret:\n' +
    '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
    'Then set it in your environment (Vercel, .env, etc.)\n'
  );
  process.exit(1);
}

module.exports = {
  secret: jwtSecret,
  expiresIn: 86400 // 24 hours
};