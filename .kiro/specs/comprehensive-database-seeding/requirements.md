# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive database seeding system for the Darb Network crowdfunding platform. The system will populate the database with realistic test data including users, campaigns, collaborators, milestones, and investments to support development, testing, and demonstration purposes.

## Glossary

- **Seeding_System**: The database seeding script that populates test data
- **Database**: The MySQL database for the Darb Network platform
- **Campaign**: A crowdfunding project created by founders to raise funds
- **User**: A registered account with roles: admin, founder, or investor
- **Collaborator**: A team member associated with a campaign
- **Milestone**: A funding goal or project phase within a campaign
- **Investment**: A financial contribution from an investor to a campaign
- **Stock_Image**: Pre-defined placeholder images used for profiles and campaigns
- **Business_Plan**: Detailed description of campaign strategy and execution
- **Featured_Campaign**: A campaign marked for prominent display on the platform
- **Draft_Campaign**: A campaign not yet published or submitted for review
- **Progress_Level**: The percentage of funding goal achieved by a campaign
- **Idempotent_Operation**: An operation that produces the same result when executed multiple times

## Requirements

### Requirement 1: Data Cleanup

**User Story:** As a developer, I want to clean existing campaign data before seeding, so that I can run the script multiple times without data conflicts.

#### Acceptance Criteria

1. WHEN the Seeding_System executes, THE Seeding_System SHALL delete all existing campaigns from the Database
2. WHEN campaigns are deleted, THE Database SHALL cascade delete all related campaign_images records
3. WHEN campaigns are deleted, THE Database SHALL cascade delete all related campaign_milestones records
4. WHEN campaigns are deleted, THE Database SHALL cascade delete all related campaign_collaborators records
5. WHEN campaigns are deleted, THE Database SHALL cascade delete all related investments records
6. THE Seeding_System SHALL log the number of deleted records to the console
7. WHEN the cleanup completes, THE Seeding_System SHALL display a success message

### Requirement 2: User Creation

**User Story:** As a developer, I want to create diverse test users, so that I can test different user roles and permissions.

#### Acceptance Criteria

1. THE Seeding_System SHALL create between 5 and 8 new users in the Database
2. WHEN creating users, THE Seeding_System SHALL assign each user one of three roles: admin, founder, or investor
3. WHEN creating users, THE Seeding_System SHALL assign at least one user the admin role
4. WHEN creating users, THE Seeding_System SHALL assign at least two users the founder role
5. WHEN creating users, THE Seeding_System SHALL assign at least two users the investor role
6. WHEN creating a user, THE Seeding_System SHALL assign a unique Stock_Image URL to the profileImageUrl field
7. WHEN creating a user, THE Seeding_System SHALL generate a valid email address in the format [name]@example.com
8. WHEN creating a user, THE Seeding_System SHALL set a hashed password using bcrypt with salt rounds of 10
9. WHEN creating a user, THE Seeding_System SHALL set fullName, companyName, and bio fields with realistic values
10. THE Seeding_System SHALL log each created user's email and role to the console

### Requirement 3: Campaign Creation with Varied Content

**User Story:** As a developer, I want to create campaigns with diverse content lengths and types, so that I can test UI rendering and data handling across different scenarios.

#### Acceptance Criteria

1. THE Seeding_System SHALL create exactly 40 new campaigns in the Database
2. WHEN creating campaigns, THE Seeding_System SHALL assign at least 10 campaigns a Business_Plan with more than 1000 characters
3. WHEN creating campaigns, THE Seeding_System SHALL randomize content length for description, problem_statement, solution, and business_plan fields
4. WHEN creating campaigns, THE Seeding_System SHALL assign each campaign a category from the set: Clean Energy, Agriculture, Healthcare, Education, Technology, Fashion, Real Estate, Logistics, Fintech, Manufacturing
5. WHEN creating campaigns, THE Seeding_System SHALL assign each campaign a location from Nigerian cities
6. WHEN creating campaigns, THE Seeding_System SHALL set target_amount between 5,000,000 and 100,000,000 Naira
7. WHEN creating campaigns, THE Seeding_System SHALL set minimum_investment between 50,000 and 500,000 Naira
8. WHEN creating campaigns, THE Seeding_System SHALL assign each campaign to a random founder user
9. THE Seeding_System SHALL log the number of campaigns created to the console

### Requirement 4: Campaign Media and Video URLs

**User Story:** As a developer, I want campaigns to have varied media content, so that I can test image galleries and video player functionality.

#### Acceptance Criteria

1. WHEN creating campaigns, THE Seeding_System SHALL assign a main_image_url to each campaign
2. WHEN creating campaigns, THE Seeding_System SHALL assign video_url to at least 10 campaigns
3. WHEN assigning video_url, THE Seeding_System SHALL use valid YouTube or Vimeo URL formats
4. WHEN creating campaigns, THE Seeding_System SHALL create between 2 and 5 campaign_images records per campaign
5. WHEN creating campaign_images, THE Seeding_System SHALL assign Stock_Image URLs from Unsplash or similar services
6. WHEN creating campaign_images, THE Seeding_System SHALL set image_type to one of: gallery, thumbnail, or banner
7. WHEN creating campaign_images, THE Seeding_System SHALL set order_index sequentially starting from 0

### Requirement 5: Campaign Status Variety

**User Story:** As a developer, I want campaigns with different statuses and features, so that I can test filtering, sorting, and dashboard displays.

#### Acceptance Criteria

1. WHEN creating campaigns, THE Seeding_System SHALL mark between 5 and 10 campaigns as Featured_Campaign by setting is_featured to TRUE
2. WHEN creating campaigns, THE Seeding_System SHALL mark between 3 and 7 campaigns as Draft_Campaign by setting status to 'draft'
3. WHEN creating campaigns, THE Seeding_System SHALL set status to 'approved' for campaigns that are not drafts
4. WHEN creating campaigns, THE Seeding_System SHALL mark between 2 and 3 campaigns as completed by setting status to 'completed'
5. WHEN marking a campaign as completed, THE Seeding_System SHALL set current_amount greater than or equal to target_amount
6. WHEN creating campaigns, THE Seeding_System SHALL set start_date to a date within the past 90 days
7. WHEN creating campaigns, THE Seeding_System SHALL set end_date to a date between 30 and 180 days from start_date
8. THE Seeding_System SHALL log the count of featured, draft, and completed campaigns to the console

### Requirement 6: Campaign Progress Levels

**User Story:** As a developer, I want campaigns with varied funding progress, so that I can test progress bars and funding calculations.

#### Acceptance Criteria

1. WHEN creating campaigns, THE Seeding_System SHALL set current_amount to a random percentage of target_amount
2. WHEN setting current_amount, THE Seeding_System SHALL use Progress_Level values between 0% and 150%
3. WHEN setting current_amount, THE Seeding_System SHALL ensure at least 5 campaigns have Progress_Level between 0% and 25%
4. WHEN setting current_amount, THE Seeding_System SHALL ensure at least 5 campaigns have Progress_Level between 25% and 75%
5. WHEN setting current_amount, THE Seeding_System SHALL ensure at least 5 campaigns have Progress_Level between 75% and 100%
6. WHEN setting current_amount, THE Seeding_System SHALL ensure at least 3 campaigns have Progress_Level greater than 100%
7. WHEN setting current_amount, THE Seeding_System SHALL set investor_count proportional to the Progress_Level

### Requirement 7: Milestone Creation

**User Story:** As a developer, I want campaigns to have milestones with images, so that I can test milestone displays and progress tracking.

#### Acceptance Criteria

1. WHEN creating campaigns, THE Seeding_System SHALL create between 2 and 4 milestones per campaign
2. WHEN creating milestones, THE Seeding_System SHALL set title, description, and target_amount fields
3. WHEN creating milestones, THE Seeding_System SHALL set order_index sequentially starting from 1
4. WHEN creating milestones, THE Seeding_System SHALL assign Stock_Image URLs to at least 50% of milestones
5. WHEN creating milestones, THE Seeding_System SHALL set status to one of: pending, active, completed, or failed
6. WHEN creating milestones, THE Seeding_System SHALL set target_date to a future date within 12 months
7. WHEN creating milestones, THE Seeding_System SHALL ensure the sum of milestone target_amount values does not exceed campaign target_amount

### Requirement 8: Collaborator Relationships

**User Story:** As a developer, I want campaigns to have collaborators from the user pool, so that I can test team displays and user relationships.

#### Acceptance Criteria

1. WHEN creating campaigns, THE Seeding_System SHALL create between 1 and 4 collaborators per campaign
2. WHEN creating collaborators, THE Seeding_System SHALL assign some collaborators from existing User records
3. WHEN assigning a User as a collaborator, THE Seeding_System SHALL use the User's fullName, profileImageUrl, and bio
4. WHEN creating collaborators, THE Seeding_System SHALL set role to positions like: CEO, CTO, CFO, COO, Marketing Director, or Technical Lead
5. WHEN creating collaborators, THE Seeding_System SHALL set description with professional background information
6. WHEN creating collaborators, THE Seeding_System SHALL set order_index sequentially starting from 1
7. THE Seeding_System SHALL ensure at least 10 campaigns have collaborators that are existing User records
8. THE Seeding_System SHALL log the number of collaborator relationships created to the console

### Requirement 9: Investment Creation

**User Story:** As a developer, I want realistic investment records, so that I can test investment tracking and financial calculations.

#### Acceptance Criteria

1. WHEN creating campaigns with Progress_Level greater than 0%, THE Seeding_System SHALL create investment records
2. WHEN creating investments, THE Seeding_System SHALL assign investor_id from users with userType 'investor'
3. WHEN creating investments, THE Seeding_System SHALL set amount between minimum_investment and maximum_investment
4. WHEN creating investments, THE Seeding_System SHALL set payment_status to 'completed'
5. WHEN creating investments, THE Seeding_System SHALL generate a unique payment_reference in the format 'SEED-[timestamp]-[random]'
6. WHEN creating investments, THE Seeding_System SHALL set payment_gateway to one of: paystack, flutterwave, or bank_transfer
7. WHEN creating investments, THE Seeding_System SHALL calculate platform_fee as 2.5% of amount
8. WHEN creating investments, THE Seeding_System SHALL set net_amount as amount minus platform_fee
9. WHEN creating investments, THE Seeding_System SHALL ensure the sum of investment amounts equals campaign current_amount
10. THE Seeding_System SHALL log the total number of investments created to the console

### Requirement 10: Idempotent Execution

**User Story:** As a developer, I want to run the seeding script multiple times safely, so that I can reset test data without manual database cleanup.

#### Acceptance Criteria

1. THE Seeding_System SHALL be an Idempotent_Operation that produces consistent results on repeated execution
2. WHEN the Seeding_System executes multiple times, THE Seeding_System SHALL delete existing data before creating new data
3. WHEN the Seeding_System encounters database errors, THE Seeding_System SHALL log the error message and exit with status code 1
4. WHEN the Seeding_System completes successfully, THE Seeding_System SHALL exit with status code 0
5. THE Seeding_System SHALL use database transactions to ensure data consistency
6. WHEN a transaction fails, THE Seeding_System SHALL rollback all changes made in that transaction

### Requirement 11: Console Output and Logging

**User Story:** As a developer, I want clear console output during seeding, so that I can monitor progress and debug issues.

#### Acceptance Criteria

1. WHEN the Seeding_System starts, THE Seeding_System SHALL display a startup message with timestamp
2. WHEN the Seeding_System connects to the Database, THE Seeding_System SHALL display a connection success message
3. WHEN the Seeding_System creates data, THE Seeding_System SHALL display progress messages for each data type
4. WHEN the Seeding_System completes, THE Seeding_System SHALL display a summary with counts of all created records
5. THE Seeding_System SHALL display the summary in a formatted table or structured layout
6. WHEN the Seeding_System encounters errors, THE Seeding_System SHALL display error messages with context
7. WHEN the Seeding_System closes the database connection, THE Seeding_System SHALL display a disconnection message

### Requirement 12: Database Connection Configuration

**User Story:** As a developer, I want the seeding script to use environment variables for database connection, so that I can run it in different environments.

#### Acceptance Criteria

1. THE Seeding_System SHALL read database connection parameters from environment variables
2. THE Seeding_System SHALL use DB_HOST for the database host address
3. THE Seeding_System SHALL use DB_PORT for the database port with default value 3306
4. THE Seeding_System SHALL use DB_USER for the database username
5. THE Seeding_System SHALL use DB_PASSWORD for the database password
6. THE Seeding_System SHALL use DB_NAME for the database name
7. WHEN DB_SSL environment variable is 'true', THE Seeding_System SHALL enable SSL connection with rejectUnauthorized set to false
8. WHEN database connection fails, THE Seeding_System SHALL display the connection error and exit with status code 1
