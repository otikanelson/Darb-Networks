require('dotenv').config();

// Validate JWT_SECRET at startup
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  const errorMessage =
    'FATAL: JWT_SECRET is missing or too short. ' +
    'JWT_SECRET must be at least 32 characters long. ' +
    'Generate a new secret: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))" ' +
    'Then set it in your environment (Vercel, .env, etc.)';

  console.error('\n❌ ' + errorMessage + '\n');
  throw new Error(errorMessage);
}

module.exports = {
  secret: jwtSecret,
  expiresIn: 86400 // 24 hours
};