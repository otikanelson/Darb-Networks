/**
 * Mask a BVN (Bank Verification Number) for display
 * Shows only the last 4 digits, hides the rest
 * @param {string} bvn - Full BVN to mask
 * @returns {string} Masked BVN (e.g., "*******1234")
 */
function maskBVN(bvn) {
  if (!bvn) return null;
  const bvnStr = String(bvn).trim();
  if (bvnStr.length < 4) return null; // Invalid BVN
  return '*'.repeat(Math.max(bvnStr.length - 4, 7)) + bvnStr.slice(-4);
}

/**
 * Mask an account number for display
 * Shows only the last 4 digits, hides the rest
 * @param {string} accountNumber - Full account number to mask
 * @returns {string} Masked account number (e.g., "****5678")
 */
function maskAccountNumber(accountNumber) {
  if (!accountNumber) return null;
  const acctStr = String(accountNumber).trim();
  if (acctStr.length < 4) return null; // Invalid account number
  return '*'.repeat(Math.max(acctStr.length - 4, 4)) + acctStr.slice(-4);
}

/**
 * Format user data for safe API responses
 * Masks sensitive fields (BVN, account number)
 * @param {Object} user - User object from database
 * @returns {Object} User object with masked sensitive data
 */
function formatSafeUserData(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    userType: user.userType,
    companyName: user.companyName,
    phoneNumber: user.phoneNumber,
    address: user.address,
    bvn: maskBVN(user.bvn),
    hasBvn: !!user.bvn,
    cacNumber: user.cacNumber,
    accountNumber: maskAccountNumber(user.accountNumber),
    hasAccountNumber: !!user.accountNumber,
    bankName: user.bankName,
    profileImageUrl: user.profileImageUrl,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * TODO: Encryption at rest for sensitive data
 * 
 * Current approach: Mask BVN and account numbers in API responses
 * Future approach: Encrypt BVN and account numbers in the database using AES-256-GCM
 * 
 * Implementation plan:
 * 1. Create utility functions in this file:
 *    - encryptField(value, encryptionKey) -> encrypted value
 *    - decryptField(encryptedValue, encryptionKey) -> original value
 * 
 * 2. Environment variables:
 *    - ENCRYPTION_KEY: 32-byte key (base64 encoded) for AES-256
 *    - Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 * 
 * 3. Database migration:
 *    - Add new columns: bvn_encrypted, account_number_encrypted (LONGBLOB)
 *    - Keep old columns for backward compatibility
 *    - Migrate existing data with a script
 * 
 * 4. Model hooks (Sequelize):
 *    - beforeSave: encrypt BVN and account number
 *    - afterFind: decrypt BVN and account number
 *    - This keeps the rest of the application code unchanged
 * 
 * Benefits:
 *    - Even if database is compromised, sensitive data is protected
 *    - Keys are never stored in the database
 *    - Full control over encryption/decryption process
 * 
 * Security notes:
 *    - Use AES-256-GCM (provides both encryption and authentication)
 *    - Store encryption key in environment variables, never in code
 *    - Consider key rotation strategy
 *    - Log decryption attempts for audit
 */

module.exports = {
  maskBVN,
  maskAccountNumber,
  formatSafeUserData
};
