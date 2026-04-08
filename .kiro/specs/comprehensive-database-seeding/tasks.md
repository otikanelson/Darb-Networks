# Implementation Plan: Comprehensive Database Seeding

## Overview

This implementation plan breaks down the comprehensive database seeding system into discrete coding tasks. The system follows a sequential pipeline architecture with modular components for data generation, database operations, and error handling. The implementation will create a new seeding script that generates realistic test data including users, campaigns, media, milestones, collaborators, and investments.

## Tasks

- [x] 1. Set up project structure and core utilities
  - Create `backend/seed-database.js` as the main entry point
  - Create `backend/utils/random-helpers.js` for random data generation utilities
  - Create `backend/utils/content-generators.js` for text content generation
  - Set up imports for mysql2/promise, bcrypt, and dotenv
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 1.1 Write unit tests for random helpers
  - Test randomElement, randomInt, randomFloat, randomDate, randomBoolean functions
  - Test edge cases for boundary values
  - _Requirements: 12.1_

- [x] 2. Implement database connection module
  - [x] 2.1 Create connectToDatabase function
    - Read environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL)
    - Create MySQL connection with SSL support
    - Return connection object or throw error
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_
  
  - [x] 2.2 Write property test for database connection
    - **Property: Connection Configuration Validity**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**
  
  - [x] 2.3 Write unit tests for connection error handling
    - Test connection failure scenarios
    - Test SSL configuration
    - _Requirements: 12.8_

- [x] 3. Implement cleanup module
  - [x] 3.1 Create cleanupExistingData function
    - Delete all campaigns (cascades to related tables)
    - Count deleted records for each table
    - Return CleanupStats object
    - Log deletion statistics
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 3.2 Write unit tests for cleanup module
    - Test cascade deletion behavior
    - Test cleanup statistics tracking
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Implement random helpers and content generators
  - [x] 4.1 Create random helper functions
    - Implement randomElement(array)
    - Implement randomInt(min, max)
    - Implement randomFloat(min, max)
    - Implement randomDate(start, end)
    - Implement randomBoolean(probability)
    - _Requirements: 3.3, 5.6, 5.7, 6.1, 6.2_
  
  - [x] 4.2 Create content generator functions
    - Implement generateBusinessPlan(length) with varied lengths
    - Implement generateDescription(length) with varied lengths
    - Implement generateProblemStatement() with varied lengths
    - Implement generateSolution() with varied lengths
    - Use realistic business content templates
    - _Requirements: 3.2, 3.3_

- [x] 5. Implement user generator module
  - [x] 5.1 Create generateUser function
    - Generate email in format [name]@example.com
    - Hash password with bcrypt (10 salt rounds)
    - Assign unique stock profile image URLs
    - Generate realistic Nigerian names
    - Set userType (admin, founder, investor)
    - Generate bio (100-300 characters)
    - Set isActive and isVerified to true
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 2.8, 2.9_
  
  - [x] 5.2 Create createUsers function
    - Generate 5-8 users with role distribution
    - Ensure at least 1 admin, 2 founders, 2 investors
    - Insert users into database in single transaction
    - Return created user records with IDs
    - Log each user's email and role
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.10_
  
  - [x] 5.3 Write property test for user creation completeness
    - **Property 1: User Creation Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
  
  - [x] 5.4 Write property test for user data validity
    - **Property 2: User Data Validity**
    - **Validates: Requirements 2.6, 2.7, 2.8**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement campaign generator module
  - [x] 7.1 Create generateCampaign function
    - Generate title (30-80 characters)
    - Generate description with varied length (200-1000 characters)
    - Assign category from predefined list
    - Assign Nigerian city location
    - Set target_amount (5M-100M Naira)
    - Set minimum_investment (50K-500K Naira)
    - Set maximum_investment (10% of target)
    - Generate problem_statement, solution, business_plan with varied lengths
    - Assign main_image_url
    - Set status (draft, approved, completed)
    - Set is_featured flag
    - Calculate start_date and end_date
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 5.1, 5.2, 5.3, 5.4, 5.6, 5.7_
  
  - [x] 7.2 Create createCampaigns function
    - Generate exactly 40 campaigns
    - Ensure at least 10 have business_plan > 1000 characters
    - Ensure 5-10 are featured
    - Ensure 3-7 are drafts
    - Ensure 2-3 are completed
    - Assign random founders
    - Insert campaigns in batch transactions (10 per transaction)
    - Log campaign creation count
    - _Requirements: 3.1, 3.2, 3.8, 3.9, 5.1, 5.2, 5.3, 5.4, 5.8_
  
  - [x] 7.3 Write property test for campaign count exactness
    - **Property 3: Campaign Count Exactness**
    - **Validates: Requirements 3.1**
  
  - [x] 7.4 Write property test for long business plan distribution
    - **Property 4: Long Business Plan Distribution**
    - **Validates: Requirements 3.2**
  
  - [x] 7.5 Write property test for campaign content variety
    - **Property 5: Campaign Content Variety**
    - **Validates: Requirements 3.3**
  
  - [x] 7.6 Write property test for campaign field validity
    - **Property 6: Campaign Field Validity**
    - **Validates: Requirements 3.4, 3.5, 3.6, 3.7, 3.8**
  
  - [x] 7.7 Write property test for campaign status distribution
    - **Property 10: Campaign Status Distribution**
    - **Validates: Requirements 5.1, 5.2, 5.4**
  
  - [x] 7.8 Write property test for campaign date validity
    - **Property 13: Campaign Date Validity**
    - **Validates: Requirements 5.6, 5.7**

- [x] 8. Implement campaign progress and funding logic
  - [x] 8.1 Add progress calculation to campaign generator
    - Calculate current_amount based on progress level (0%-150%)
    - Ensure at least 5 campaigns in each progress range (0-25%, 25-75%, 75-100%)
    - Ensure at least 3 campaigns with progress > 100%
    - Set investor_count proportional to progress
    - Mark completed campaigns with current_amount >= target_amount
    - _Requirements: 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 8.2 Write property test for progress level range
    - **Property 14: Campaign Progress Level Range**
    - **Validates: Requirements 6.1, 6.2**
  
  - [x] 8.3 Write property test for progress level distribution
    - **Property 15: Progress Level Distribution**
    - **Validates: Requirements 6.3, 6.4, 6.5, 6.6**
  
  - [x] 8.4 Write property test for investor count proportionality
    - **Property 16: Investor Count Proportionality**
    - **Validates: Requirements 6.7**
  
  - [x] 8.5 Write property test for completed campaign funding
    - **Property 12: Completed Campaign Funding**
    - **Validates: Requirements 5.5**

- [x] 9. Implement media generator module
  - [x] 9.1 Create generateStockImageUrl function
    - Generate Unsplash URLs based on category
    - Return unique image URLs
    - _Requirements: 4.1, 4.5_
  
  - [x] 9.2 Create generateVideoUrl function
    - Generate valid YouTube/Vimeo URLs
    - Return varied video URLs
    - _Requirements: 4.2, 4.3_
  
  - [x] 9.3 Create createCampaignImages function
    - Create 2-5 images per campaign
    - Assign stock image URLs
    - Set image_type (gallery, thumbnail, banner)
    - Set sequential order_index starting from 0
    - Add video_url to at least 10 campaigns
    - Insert images into database
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 9.4 Write property test for campaign media completeness
    - **Property 7: Campaign Media Completeness**
    - **Validates: Requirements 4.1**
  
  - [x] 9.5 Write property test for video URL distribution
    - **Property 8: Video URL Distribution and Format**
    - **Validates: Requirements 4.2, 4.3**
  
  - [x] 9.6 Write property test for campaign images validity
    - **Property 9: Campaign Images Count and Validity**
    - **Validates: Requirements 4.4, 4.5, 4.6, 4.7**

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement milestone generator module
  - [x] 11.1 Create generateMilestone function
    - Generate title (30-100 characters)
    - Generate description (200-500 characters)
    - Calculate proportional target_amount
    - Generate deliverables (comma-separated list)
    - Generate timeline (e.g., "6 months", "Q2 2024")
    - Generate success_metrics
    - Set status (pending, active, completed, failed)
    - Set future target_date within 12 months
    - Assign image_url to 50% of milestones
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_
  
  - [x] 11.2 Create createMilestones function
    - Create 2-4 milestones per campaign
    - Ensure sum of target_amounts <= campaign target_amount
    - Set sequential order_index starting from 1
    - Insert milestones into database
    - _Requirements: 7.1, 7.2, 7.3, 7.7_
  
  - [x] 11.3 Write property test for milestone count
    - **Property 17: Milestone Count Per Campaign**
    - **Validates: Requirements 7.1**
  
  - [x] 11.4 Write property test for milestone required fields
    - **Property 18: Milestone Required Fields**
    - **Validates: Requirements 7.2**
  
  - [x] 11.5 Write property test for milestone order sequential
    - **Property 19: Milestone Order Sequential**
    - **Validates: Requirements 7.3**
  
  - [x] 11.6 Write property test for milestone image distribution
    - **Property 20: Milestone Image Distribution**
    - **Validates: Requirements 7.4**
  
  - [x] 11.7 Write property test for milestone target amount sum
    - **Property 23: Milestone Target Amount Sum**
    - **Validates: Requirements 7.7**

- [x] 12. Implement collaborator generator module
  - [x] 12.1 Create generateCollaborator function
    - Generate name (use user fullName if linked)
    - Assign professional role (CEO, CTO, CFO, etc.)
    - Generate professional description (150-400 characters)
    - Use user profile data when linking to existing users
    - Assign profile_image_url
    - Set optional email, phoneNumber, linkedin_url
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 12.2 Create createCollaborators function
    - Create 1-4 collaborators per campaign
    - Link at least 10 campaigns to existing users
    - Set sequential order_index starting from 1
    - Insert collaborators into database
    - Log collaborator relationship count
    - _Requirements: 8.1, 8.2, 8.6, 8.7, 8.8_
  
  - [x] 12.3 Write property test for collaborator count
    - **Property 24: Collaborator Count Per Campaign**
    - **Validates: Requirements 8.1**
  
  - [x] 12.4 Write property test for user-linked collaborator consistency
    - **Property 25: User-Linked Collaborator Data Consistency**
    - **Validates: Requirements 8.2, 8.3**
  
  - [x] 12.5 Write property test for collaborator role validity
    - **Property 26: Collaborator Role Validity**
    - **Validates: Requirements 8.4**
  
  - [x] 12.6 Write property test for user-linked collaborator distribution
    - **Property 28: User-Linked Collaborator Distribution**
    - **Validates: Requirements 8.7**

- [x] 13. Implement investment generator module
  - [x] 13.1 Create generateInvestments function
    - Generate investments for campaigns with progress > 0%
    - Assign to random investor users
    - Set amount between minimum and maximum investment
    - Ensure sum of investments equals campaign current_amount
    - Generate unique payment_reference (SEED-[timestamp]-[random])
    - Set payment_status to 'completed'
    - Assign random payment_gateway
    - Calculate platform_fee (2.5% of amount)
    - Calculate net_amount (amount - platform_fee)
    - Set investment_date within campaign duration
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_
  
  - [x] 13.2 Create createInvestments function
    - Create investments for all funded campaigns
    - Insert investments into database
    - Log total investment count
    - _Requirements: 9.1, 9.10_
  
  - [x] 13.3 Write property test for investment creation for funded campaigns
    - **Property 29: Investment Creation for Funded Campaigns**
    - **Validates: Requirements 9.1**
  
  - [x] 13.4 Write property test for investment investor validity
    - **Property 30: Investment Investor Validity**
    - **Validates: Requirements 9.2**
  
  - [x] 13.5 Write property test for investment amount range
    - **Property 31: Investment Amount Range**
    - **Validates: Requirements 9.3**
  
  - [x] 13.6 Write property test for investment payment reference format
    - **Property 33: Investment Payment Reference Format**
    - **Validates: Requirements 9.5**
  
  - [x] 13.7 Write property test for investment fee calculations
    - **Property 35: Investment Fee Calculations**
    - **Validates: Requirements 9.7, 9.8**
  
  - [x] 13.8 Write property test for investment sum equals campaign amount
    - **Property 36: Investment Sum Equals Campaign Amount**
    - **Validates: Requirements 9.9**

- [x] 14. Implement logging and summary module
  - [x] 14.1 Create logging functions
    - Implement logProgress(phase, message) for phase logging
    - Implement logError(phase, error) for error logging
    - Display startup message with timestamp
    - Display connection success message
    - Display progress messages for each phase
    - _Requirements: 11.1, 11.2, 11.3, 11.6_
  
  - [x] 14.2 Create displaySummary function
    - Calculate SeedingSummary statistics
    - Display formatted summary table
    - Show counts for all created records
    - Show total investment amount
    - Show execution time
    - _Requirements: 11.4, 11.5_
  
  - [x] 14.3 Write unit tests for logging output
    - Test console output formatting
    - Test summary table structure
    - _Requirements: 11.4, 11.5_

- [x] 15. Implement main orchestrator and error handling
  - [x] 15.1 Create seedDatabase main function
    - Orchestrate all phases in sequence
    - Track execution time
    - Handle errors with fail-fast approach
    - Use transactions for data consistency
    - Rollback on transaction failures
    - Exit with appropriate status codes
    - Close database connection in finally block
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.7_
  
  - [x] 15.2 Implement error handling strategy
    - Handle configuration errors
    - Handle connection errors
    - Handle constraint violations (ER_DUP_ENTRY, ER_NO_REFERENCED_ROW)
    - Implement rollback on failures
    - Display user-friendly error messages
    - _Requirements: 10.3, 10.6, 12.8_
  
  - [x] 15.3 Write unit tests for error handling
    - Test connection failure scenarios
    - Test constraint violation handling
    - Test rollback behavior
    - _Requirements: 10.3, 10.6_

- [x] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Integration and final wiring
  - [x] 17.1 Wire all modules together in seed-database.js
    - Import all generator modules
    - Call phases in correct sequence
    - Pass data between phases correctly
    - Ensure proper error propagation
    - _Requirements: 10.1, 10.2_
  
  - [x] 17.2 Add script entry to package.json
    - Add "seed:database" script command
    - Document usage in comments
    - _Requirements: 10.1_
  
  - [x] 17.3 Write integration test for complete pipeline
    - Test full seeding execution
    - Verify all record counts
    - Verify data relationships
    - _Requirements: 10.1, 10.2_
  
  - [x] 17.4 Write property test for idempotent execution
    - **Property 37: Idempotent Execution**
    - **Validates: Requirements 10.1, 10.2**

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses JavaScript (Node.js) with mysql2/promise and bcrypt
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation throughout implementation
- The system follows a sequential pipeline architecture with modular components
- Error handling uses a fail-fast approach with transaction rollbacks
- All data generation uses realistic Nigerian business context
