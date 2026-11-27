'use strict';

/**
 * Migration: NULL deprecated personal data fields
 * 
 * This migration marks the following fields as deprecated by setting them to NULL:
 * - bvn (Bank Verification Number)
 * - nin (National Identification Number)
 * - accountNumber
 * - bankName
 * - address
 * 
 * These fields are no longer collected from new users and are marked for future removal.
 * See STEP 7 in project notes.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET 
        bvn = NULL,
        nin = NULL,
        accountNumber = NULL,
        bankName = NULL,
        address = NULL
      WHERE bvn IS NOT NULL OR nin IS NOT NULL OR accountNumber IS NOT NULL OR bankName IS NOT NULL OR address IS NOT NULL;
    `);
    
    console.log('✓ Deprecated personal data fields set to NULL');
  },

  down: async (queryInterface, Sequelize) => {
    // No down migration - this is a data cleanup, not a schema change
    console.log('⚠ Down migration not available for data cleanup');
  }
};
