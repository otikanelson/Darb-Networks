# Design Document: Comprehensive Database Seeding

## Overview

This design document specifies the technical architecture and implementation approach for a comprehensive database seeding system for the Darb Network crowdfunding platform. The system will populate the database with realistic test data to support development, testing, and demonstration purposes.

### Purpose

The seeding system serves multiple purposes:
- Provide realistic test data for frontend development and UI testing
- Enable end-to-end testing of business workflows
- Support demonstration and stakeholder presentations
- Allow developers to reset the database to a known state
- Test edge cases and various data scenarios

### Key Design Goals

1. **Idempotency**: The script can be run multiple times safely, always producing consistent results
2. **Realism**: Generated data should closely resemble production data patterns
3. **Variety**: Data should cover diverse scenarios including edge cases
4. **Performance**: Seeding should complete in reasonable time (under 30 seconds)
5. **Maintainability**: Code should be modular and easy to extend
6. **Observability**: Clear logging to track progress and debug issues

### Scope

The seeding system will:
- Clean existing campaign-related data
- Create 5-8 users with different roles
- Generate 40 campaigns with varied characteristics
- Add media (images, videos) to campaigns and milestones
- Create milestones for each campaign
- Establish collaborator relationships
- Generate investment records
- Provide detailed console logging

The system will NOT:
- Modify user authentication tokens or sessions
- Send emails or notifications
- Trigger payment gateway integrations
- Modify system settings or configuration

## Architecture

### High-Level Architecture

The seeding system follows a sequential pipeline architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Seeding Pipeline                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Initialize                                                │
│     ├─ Load environment configuration                        │
│     ├─ Establish database connection                         │
│     └─ Validate connection                                   │
│                                                               │
│  2. Cleanup Phase                                             │
│     ├─ Delete existing campaigns (cascades to related data)  │
│     └─ Log deletion counts                                   │
│                                                               │
│  3. User Creation Phase                                       │
│     ├─ Generate 5-8 users with varied roles                  │
│     ├─ Hash passwords with bcrypt                            │
│     └─ Assign stock profile images                           │
│                                                               │
│  4. Campaign Creation Phase                                   │
│     ├─ Generate 40 campaigns with varied content             │
│     ├─ Assign random founders                                │
│     ├─ Set varied statuses and features                      │
│     └─ Calculate progress levels                             │
│                                                               │
│  5. Media Creation Phase                                      │
│     ├─ Add campaign images (2-5 per campaign)                │
│     ├─ Assign video URLs to subset of campaigns              │
│     └─ Add milestone images                                  │
│                                                               │
│  6. Milestone Creation Phase                                  │
│     ├─ Create 2-4 milestones per campaign                    │
│     ├─ Ensure target amounts sum correctly                   │
│     └─ Set varied statuses                                   │
│                                                               │
│  7. Collaborator Creation Phase                               │
│     ├─ Create 1-4 collaborators per campaign                 │
│     ├─ Link some to existing users                           │
│     └─ Generate professional descriptions                    │
│                                                               │
│  8. Investment Creation Phase                                 │
│     ├─ Generate investments for funded campaigns             │
│     ├─ Ensure amounts match campaign current_amount          │
│     └─ Assign to investor users                              │
│                                                               │
│  9. Summary & Cleanup                                         │
│     ├─ Display formatted summary                             │
│     └─ Close database connection                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

The system is organized into modular components:

```javascript
// Main orchestrator
seedDatabase()
  ├─ connectToDatabase()
  ├─ cleanupExistingData()
  ├─ createUsers()
  ├─ createCampaigns()
  ├─ createCampaignImages()
  ├─ createMilestones()
  ├─ createCollaborators()
  ├─ createInvestments()
  └─ displaySummary()

// Data generation utilities
DataGenerators
  ├─ generateUser()
  ├─ generateCampaign()
  ├─ generateMilestone()
  ├─ generateCollaborator()
  ├─ generateInvestment()
  └─ generateStockImageUrl()

// Random data helpers
RandomHelpers
  ├─ randomElement(array)
  ├─ randomInt(min, max)
  ├─ randomFloat(min, max)
  ├─ randomDate(start, end)
  └─ randomBoolean(probability)

// Content generators
ContentGenerators
  ├─ generateBusinessPlan(length)
  ├─ generateDescription(length)
  ├─ generateProblemStatement()
  └─ generateSolution()
```

### Database Transaction Strategy

The seeding system uses a mixed transaction approach:

1. **Cleanup Phase**: Single transaction to ensure atomic deletion
2. **User Creation**: Single transaction for all users
3. **Campaign Creation**: Batch transactions (10 campaigns per transaction)
4. **Related Data**: Individual transactions per campaign to isolate failures

This approach balances performance with error isolation.

### Error Handling Strategy

The system implements a fail-fast approach:
- Database connection errors: Exit immediately with status code 1
- Cleanup errors: Exit immediately (cannot proceed with dirty data)
- Creation errors: Log error, rollback transaction, exit with status code 1
- Validation errors: Log warning, skip invalid data, continue

## Components and Interfaces

### Database Connection Module

```javascript
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: {
    rejectUnauthorized: boolean;
  };
}

async function connectToDatabase(config: DatabaseConfig): Promise<Connection>
```

Responsibilities:
- Read environment variables
- Establish MySQL connection with proper configuration
- Enable SSL if required
- Return connection object or throw error

### Cleanup Module

```javascript
async function cleanupExistingData(connection: Connection): Promise<CleanupStats>

interface CleanupStats {
  campaignsDeleted: number;
  imagesDeleted: number;
  milestonesDeleted: number;
  collaboratorsDeleted: number;
  investmentsDeleted: number;
}
```

Responsibilities:
- Delete all campaigns (cascades to related tables)
- Count deleted records
- Log deletion statistics
- Handle foreign key constraints properly

### User Generator Module

```javascript
interface UserData {
  email: string;
  password: string;  // bcrypt hashed
  fullName: string;
  userType: 'admin' | 'founder' | 'investor';
  companyName?: string;
  phoneNumber?: string;
  profileImageUrl: string;
  bio: string;
  isActive: boolean;
  isVerified: boolean;
}

async function createUsers(
  connection: Connection,
  count: number
): Promise<User[]>

function generateUser(role: string, index: number): UserData
```

Responsibilities:
- Generate 5-8 users with varied roles
- Ensure at least 1 admin, 2 founders, 2 investors
- Hash passwords using bcrypt (10 salt rounds)
- Assign unique stock profile images
- Generate realistic names, emails, and bios
- Insert users into database
- Return created user records with IDs

### Campaign Generator Module

```javascript
interface CampaignData {
  title: string;
  description: string;
  category: string;
  location: string;
  target_amount: number;
  current_amount: number;
  minimum_investment: number;
  maximum_investment: number;
  problem_statement: string;
  solution: string;
  business_plan: string;
  main_image_url: string;
  video_url?: string;
  status: 'draft' | 'approved' | 'completed';
  is_featured: boolean;
  investor_count: number;
  start_date: Date;
  end_date: Date;
  founder_id: number;
}

async function createCampaigns(
  connection: Connection,
  founders: User[],
  count: number
): Promise<Campaign[]>

function generateCampaign(
  founder: User,
  index: number,
  options: CampaignOptions
): CampaignData
```

Responsibilities:
- Generate 40 campaigns with varied characteristics
- Ensure at least 10 have long business plans (>1000 chars)
- Randomize content lengths for all text fields
- Assign categories from predefined list
- Set target amounts between 5M and 100M Naira
- Calculate current amounts based on progress levels
- Mark 5-10 as featured
- Mark 3-7 as drafts
- Mark 2-3 as completed
- Assign random founders
- Set realistic date ranges
- Insert campaigns into database

### Media Generator Module

```javascript
interface CampaignImageData {
  campaign_id: number;
  image_url: string;
  image_type: 'gallery' | 'thumbnail' | 'banner';
  caption?: string;
  order_index: number;
  filename: string;
}

async function createCampaignImages(
  connection: Connection,
  campaigns: Campaign[]
): Promise<void>

function generateStockImageUrl(category: string, index: number): string
function generateVideoUrl(index: number): string
```

Responsibilities:
- Create 2-5 images per campaign
- Assign stock image URLs from Unsplash
- Set appropriate image types
- Assign sequential order indices
- Add video URLs to at least 10 campaigns
- Use valid YouTube/Vimeo URL formats

### Milestone Generator Module

```javascript
interface MilestoneData {
  campaign_id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deliverables: string;
  timeline: string;
  success_metrics: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  order_index: number;
  target_date: Date;
  image_url?: string;
  video_url?: string;
}

async function createMilestones(
  connection: Connection,
  campaigns: Campaign[]
): Promise<void>

function generateMilestone(
  campaign: Campaign,
  index: number,
  totalMilestones: number
): MilestoneData
```

Responsibilities:
- Create 2-4 milestones per campaign
- Ensure sum of target amounts ≤ campaign target amount
- Distribute amounts proportionally
- Set varied statuses
- Assign stock images to 50% of milestones
- Set future target dates within 12 months
- Generate realistic deliverables and metrics

### Collaborator Generator Module

```javascript
interface CollaboratorData {
  campaign_id: number;
  name: string;
  role: string;
  description: string;
  email?: string;
  phoneNumber?: string;
  profile_image_url: string;
  linkedin_url?: string;
  order_index: number;
}

async function createCollaborators(
  connection: Connection,
  campaigns: Campaign[],
  users: User[]
): Promise<void>

function generateCollaborator(
  campaign: Campaign,
  index: number,
  user?: User
): CollaboratorData
```

Responsibilities:
- Create 1-4 collaborators per campaign
- Link at least 10 campaigns to existing users
- Assign professional roles (CEO, CTO, CFO, etc.)
- Generate professional background descriptions
- Use user profile data when linking to existing users
- Assign sequential order indices

### Investment Generator Module

```javascript
interface InvestmentData {
  campaign_id: number;
  investor_id: number;
  amount: number;
  investment_type: 'campaign';
  payment_reference: string;
  payment_status: 'completed';
  payment_gateway: 'paystack' | 'flutterwave' | 'bank_transfer';
  transaction_fee: number;
  platform_fee: number;
  net_amount: number;
  investment_date: Date;
  payment_confirmed_at: Date;
}

async function createInvestments(
  connection: Connection,
  campaigns: Campaign[],
  investors: User[]
): Promise<void>

function generateInvestments(
  campaign: Campaign,
  investors: User[]
): InvestmentData[]
```

Responsibilities:
- Create investments for campaigns with progress > 0%
- Ensure sum of investments equals campaign current_amount
- Assign to random investor users
- Set amounts between minimum and maximum investment
- Generate unique payment references (SEED-[timestamp]-[random])
- Calculate platform fees (2.5% of amount)
- Calculate net amounts
- Set payment status to 'completed'
- Assign random payment gateways

### Logging Module

```javascript
interface SeedingSummary {
  usersCreated: number;
  campaignsCreated: number;
  featuredCampaigns: number;
  draftCampaigns: number;
  completedCampaigns: number;
  imagesCreated: number;
  milestonesCreated: number;
  collaboratorsCreated: number;
  investmentsCreated: number;
  totalInvestmentAmount: number;
  executionTime: number;
}

function displaySummary(summary: SeedingSummary): void
function logProgress(phase: string, message: string): void
function logError(phase: string, error: Error): void
```

Responsibilities:
- Display startup message with timestamp
- Log progress for each phase
- Display formatted summary table
- Log error messages with context
- Track execution time

## Data Models

### User Model

```javascript
{
  id: number,                    // Auto-increment primary key
  email: string,                 // Format: [name]@example.com
  password: string,              // bcrypt hash with 10 salt rounds
  fullName: string,              // Realistic Nigerian names
  userType: enum,                // 'admin' | 'founder' | 'investor'
  companyName: string | null,    // For founders
  phoneNumber: string | null,    // Nigerian format: +234...
  profileImageUrl: string,       // Stock image URL
  bio: string,                   // 100-300 character bio
  isActive: boolean,             // Always true for seeded users
  isVerified: boolean,           // Always true for seeded users
  createdAt: timestamp,          // Current timestamp
  updatedAt: timestamp           // Current timestamp
}
```

### Campaign Model

```javascript
{
  id: number,                    // Auto-increment primary key
  title: string,                 // 30-80 characters
  description: string,           // 200-1000 characters
  category: string,              // From predefined list
  location: string,              // Nigerian cities
  target_amount: decimal,        // 5,000,000 - 100,000,000
  current_amount: decimal,       // 0% - 150% of target
  minimum_investment: decimal,   // 50,000 - 500,000
  maximum_investment: decimal,   // 10% of target_amount
  problem_statement: string,     // 300-800 characters
  solution: string,              // 300-800 characters
  business_plan: string,         // 500-3000 characters (10+ with >1000)
  main_image_url: string,        // Stock image URL
  video_url: string | null,      // YouTube/Vimeo URL (10+ campaigns)
  status: enum,                  // 'draft' | 'approved' | 'completed'
  is_featured: boolean,          // 5-10 campaigns
  investor_count: number,        // Proportional to progress
  start_date: timestamp,         // Within past 90 days
  end_date: timestamp,           // 30-180 days from start
  founder_id: number,            // Foreign key to users
  createdAt: timestamp,          // Current timestamp
  updatedAt: timestamp           // Current timestamp
}
```

### Campaign Image Model

```javascript
{
  id: number,                    // Auto-increment primary key
  campaign_id: number,           // Foreign key to campaigns
  image_url: string,             // Stock image URL
  image_type: enum,              // 'gallery' | 'thumbnail' | 'banner'
  caption: string | null,        // Optional description
  order_index: number,           // 0-based sequential
  filename: string,              // Extracted from URL
  createdAt: timestamp           // Current timestamp
}
```

### Milestone Model

```javascript
{
  id: number,                    // Auto-increment primary key
  campaign_id: number,           // Foreign key to campaigns
  title: string,                 // 30-100 characters
  description: string,           // 200-500 characters
  target_amount: decimal,        // Proportional to campaign target
  current_amount: decimal,       // 0.00 for seeded data
  deliverables: string,          // Comma-separated list
  timeline: string,              // e.g., "6 months", "Q2 2024"
  success_metrics: string,       // Measurable outcomes
  status: enum,                  // 'pending' | 'active' | 'completed' | 'failed'
  order_index: number,           // 1-based sequential
  target_date: timestamp,        // Within 12 months
  image_url: string | null,      // Stock image (50% of milestones)
  video_url: string | null,      // Optional
  createdAt: timestamp,          // Current timestamp
  updatedAt: timestamp           // Current timestamp
}
```

### Collaborator Model

```javascript
{
  id: number,                    // Auto-increment primary key
  campaign_id: number,           // Foreign key to campaigns
  name: string,                  // Full name
  role: string,                  // CEO, CTO, CFO, etc.
  description: string,           // 150-400 character background
  email: string | null,          // Optional contact
  phoneNumber: string | null,    // Optional contact
  profile_image_url: string,     // Stock image or user profile
  linkedin_url: string | null,   // Optional
  order_index: number,           // 1-based sequential
  createdAt: timestamp,          // Current timestamp
  updatedAt: timestamp           // Current timestamp
}
```

### Investment Model

```javascript
{
  id: number,                    // Auto-increment primary key
  campaign_id: number,           // Foreign key to campaigns
  investor_id: number,           // Foreign key to users
  amount: decimal,               // Between min and max investment
  investment_type: enum,         // 'campaign'
  payment_reference: string,     // SEED-[timestamp]-[random]
  payment_status: enum,          // 'completed'
  payment_gateway: enum,         // 'paystack' | 'flutterwave' | 'bank_transfer'
  transaction_fee: decimal,      // 0.00 for seeded data
  platform_fee: decimal,         // 2.5% of amount
  net_amount: decimal,           // amount - platform_fee
  investment_date: timestamp,    // Random within campaign duration
  payment_confirmed_at: timestamp, // Same as investment_date
  createdAt: timestamp,          // Current timestamp
  updatedAt: timestamp           // Current timestamp
}
```

### Data Constraints and Validation

1. **User Constraints**:
   - Email must be unique
   - Password must be bcrypt hashed
   - At least 1 admin, 2 founders, 2 investors

2. **Campaign Constraints**:
   - target_amount >= minimum_investment
   - current_amount <= target_amount * 1.5 (allow 150% funding)
   - end_date > start_date
   - At least 10 campaigns with business_plan > 1000 characters
   - 5-10 featured campaigns
   - 3-7 draft campaigns
   - 2-3 completed campaigns

3. **Milestone Constraints**:
   - Sum of milestone target_amounts <= campaign target_amount
   - order_index must be sequential starting from 1
   - target_date must be in the future

4. **Investment Constraints**:
   - Sum of investment amounts = campaign current_amount
   - amount >= campaign minimum_investment
   - amount <= campaign maximum_investment
   - payment_reference must be unique

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following redundancies and consolidations:

**Redundancies Identified:**
1. Properties 2.3, 2.4, 2.5 (role distribution) can be combined with 2.1 (user count) into a single comprehensive property about user creation
2. Properties 3.4, 3.5 (category and location validation) can be combined into a single property about campaign field validity
3. Properties 5.1, 5.2, 5.4 (featured, draft, completed counts) can be combined into a single property about campaign status distribution
4. Properties 6.3, 6.4, 6.5, 6.6 (progress level distributions) can be combined into a single property about progress level variety
5. Properties 9.7 and 9.8 (platform fee and net amount calculations) can be combined into a single property about investment fee calculations
6. Many console logging properties (1.6, 1.7, 2.10, 3.9, 5.8, 8.8, 9.10, 11.1-11.7) are examples of the same behavior and don't need separate properties

**Properties to Keep:**
- Core data creation properties (counts, ranges, validity)
- Data relationship properties (foreign keys, sums, proportions)
- Idempotency property
- Critical calculation properties (fees, amounts)

### Property 1: User Creation Completeness

*For any* execution of the seeding system, the created users SHALL number between 5 and 8, include at least 1 admin, at least 2 founders, and at least 2 investors, with all users having valid roles from the set {admin, founder, investor}.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 2: User Data Validity

*For any* user created by the seeding system, the user SHALL have a unique profile image URL, a valid email in the format [name]@example.com, and a password that is a valid bcrypt hash.

**Validates: Requirements 2.6, 2.7, 2.8**

### Property 3: Campaign Count Exactness

*For any* execution of the seeding system, exactly 40 campaigns SHALL be created in the database.

**Validates: Requirements 3.1**

### Property 4: Long Business Plan Distribution

*For any* execution of the seeding system, at least 10 campaigns SHALL have a business_plan field with more than 1000 characters.

**Validates: Requirements 3.2**

### Property 5: Campaign Content Variety

*For any* execution of the seeding system, the campaigns SHALL have varied content lengths for description, problem_statement, solution, and business_plan fields, meaning not all campaigns have the same length for these fields.

**Validates: Requirements 3.3**

### Property 6: Campaign Field Validity

*For any* campaign created by the seeding system, the campaign SHALL have a category from the valid set, a non-empty location, a target_amount between 5,000,000 and 100,000,000, a minimum_investment between 50,000 and 500,000, and a valid founder_id referencing an existing user.

**Validates: Requirements 3.4, 3.5, 3.6, 3.7, 3.8**

### Property 7: Campaign Media Completeness

*For any* campaign created by the seeding system, the campaign SHALL have a non-empty main_image_url.

**Validates: Requirements 4.1**

### Property 8: Video URL Distribution and Format

*For any* execution of the seeding system, at least 10 campaigns SHALL have video URLs, and all campaigns with video URLs SHALL have URLs matching valid YouTube or Vimeo URL formats.

**Validates: Requirements 4.2, 4.3**

### Property 9: Campaign Images Count and Validity

*For any* campaign created by the seeding system, the campaign SHALL have between 2 and 5 campaign_images records, each with a valid image_url, an image_type from the set {gallery, thumbnail, banner}, and sequential order_index values starting from 0.

**Validates: Requirements 4.4, 4.5, 4.6, 4.7**

### Property 10: Campaign Status Distribution

*For any* execution of the seeding system, between 5 and 10 campaigns SHALL be marked as featured, between 3 and 7 SHALL have status 'draft', and between 2 and 3 SHALL have status 'completed'.

**Validates: Requirements 5.1, 5.2, 5.4**

### Property 11: Non-Draft Campaign Status

*For any* campaign created by the seeding system that is not a draft and not completed, the campaign SHALL have status 'approved'.

**Validates: Requirements 5.3**

### Property 12: Completed Campaign Funding

*For any* campaign created by the seeding system with status 'completed', the campaign's current_amount SHALL be greater than or equal to its target_amount.

**Validates: Requirements 5.5**

### Property 13: Campaign Date Validity

*For any* campaign created by the seeding system, the start_date SHALL be within the past 90 days, and the end_date SHALL be between 30 and 180 days after the start_date.

**Validates: Requirements 5.6, 5.7**

### Property 14: Campaign Progress Level Range

*For any* campaign created by the seeding system, the progress level (current_amount / target_amount * 100) SHALL be between 0% and 150%.

**Validates: Requirements 6.1, 6.2**

### Property 15: Progress Level Distribution

*For any* execution of the seeding system, at least 5 campaigns SHALL have progress between 0-25%, at least 5 SHALL have progress between 25-75%, at least 5 SHALL have progress between 75-100%, and at least 3 SHALL have progress greater than 100%.

**Validates: Requirements 6.3, 6.4, 6.5, 6.6**

### Property 16: Investor Count Proportionality

*For any* campaign created by the seeding system, the investor_count SHALL be proportional to the progress level (higher progress correlates with higher investor count).

**Validates: Requirements 6.7**

### Property 17: Milestone Count Per Campaign

*For any* campaign created by the seeding system, the campaign SHALL have between 2 and 4 milestones.

**Validates: Requirements 7.1**

### Property 18: Milestone Required Fields

*For any* milestone created by the seeding system, the milestone SHALL have non-empty title, description, and a target_amount greater than 0.

**Validates: Requirements 7.2**

### Property 19: Milestone Order Sequential

*For any* campaign created by the seeding system, the milestones SHALL have sequential order_index values starting from 1.

**Validates: Requirements 7.3**

### Property 20: Milestone Image Distribution

*For any* execution of the seeding system, at least 50% of all created milestones SHALL have non-empty image_url values.

**Validates: Requirements 7.4**

### Property 21: Milestone Status Validity

*For any* milestone created by the seeding system, the milestone SHALL have a status from the set {pending, active, completed, failed}.

**Validates: Requirements 7.5**

### Property 22: Milestone Target Date Range

*For any* milestone created by the seeding system, the target_date SHALL be a future date within 12 months from the current date.

**Validates: Requirements 7.6**

### Property 23: Milestone Target Amount Sum

*For any* campaign created by the seeding system, the sum of all milestone target_amount values SHALL be less than or equal to the campaign's target_amount.

**Validates: Requirements 7.7**

### Property 24: Collaborator Count Per Campaign

*For any* campaign created by the seeding system, the campaign SHALL have between 1 and 4 collaborators.

**Validates: Requirements 8.1**

### Property 25: User-Linked Collaborator Data Consistency

*For any* collaborator created by the seeding system that is linked to an existing user, the collaborator's name, profile_image_url, and description SHALL match or be derived from the user's fullName, profileImageUrl, and bio.

**Validates: Requirements 8.2, 8.3**

### Property 26: Collaborator Role Validity

*For any* collaborator created by the seeding system, the role SHALL be from a valid set of professional positions (CEO, CTO, CFO, COO, Marketing Director, Technical Lead, etc.).

**Validates: Requirements 8.4**

### Property 27: Collaborator Order Sequential

*For any* campaign created by the seeding system, the collaborators SHALL have sequential order_index values starting from 1.

**Validates: Requirements 8.6**

### Property 28: User-Linked Collaborator Distribution

*For any* execution of the seeding system, at least 10 campaigns SHALL have at least one collaborator that is linked to an existing user record.

**Validates: Requirements 8.7**

### Property 29: Investment Creation for Funded Campaigns

*For any* campaign created by the seeding system with progress level greater than 0%, the campaign SHALL have at least one investment record.

**Validates: Requirements 9.1**

### Property 30: Investment Investor Validity

*For any* investment created by the seeding system, the investor_id SHALL reference a user with userType 'investor'.

**Validates: Requirements 9.2**

### Property 31: Investment Amount Range

*For any* investment created by the seeding system, the amount SHALL be between the campaign's minimum_investment and maximum_investment values.

**Validates: Requirements 9.3**

### Property 32: Investment Payment Status

*For any* investment created by the seeding system, the payment_status SHALL be 'completed'.

**Validates: Requirements 9.4**

### Property 33: Investment Payment Reference Format

*For any* investment created by the seeding system, the payment_reference SHALL match the format 'SEED-[timestamp]-[random]' and be unique across all investments.

**Validates: Requirements 9.5**

### Property 34: Investment Payment Gateway Validity

*For any* investment created by the seeding system, the payment_gateway SHALL be from the set {paystack, flutterwave, bank_transfer}.

**Validates: Requirements 9.6**

### Property 35: Investment Fee Calculations

*For any* investment created by the seeding system, the platform_fee SHALL equal 2.5% of the amount, and the net_amount SHALL equal the amount minus the platform_fee.

**Validates: Requirements 9.7, 9.8**

### Property 36: Investment Sum Equals Campaign Amount

*For any* campaign created by the seeding system with investments, the sum of all investment amounts for that campaign SHALL equal the campaign's current_amount.

**Validates: Requirements 9.9**

### Property 37: Idempotent Execution

*For any* two consecutive executions of the seeding system with the same configuration, the resulting database state SHALL be equivalent in terms of record counts, data distributions, and relationships (though specific random values may differ).

**Validates: Requirements 10.1, 10.2**

## Error Handling

### Error Categories

The seeding system handles four categories of errors:

1. **Configuration Errors**: Missing or invalid environment variables
2. **Connection Errors**: Database connection failures
3. **Data Errors**: Constraint violations, invalid data generation
4. **Transaction Errors**: Rollback failures, deadlocks

### Error Handling Strategy

```javascript
try {
  // Phase execution
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    // Handle duplicate key errors
    logger.error('Duplicate entry detected', error);
    await rollbackTransaction();
  } else if (error.code === 'ER_NO_REFERENCED_ROW') {
    // Handle foreign key constraint violations
    logger.error('Foreign key constraint violation', error);
    await rollbackTransaction();
  } else {
    // Handle unexpected errors
    logger.error('Unexpected error', error);
    await rollbackTransaction();
  }
  process.exit(1);
}
```

### Rollback Strategy

When an error occurs during data creation:
1. Log the error with full context (phase, operation, data)
2. Rollback the current transaction
3. Display user-friendly error message
4. Exit with status code 1

The cleanup phase is not rolled back - if cleanup fails, the script exits immediately.

### Validation Strategy

Data is validated at two levels:

1. **Pre-insertion Validation**: Check data constraints before database insertion
   - Email format validation
   - Date range validation
   - Amount range validation
   - Foreign key existence validation

2. **Post-insertion Validation**: Verify data integrity after insertion
   - Count verification
   - Sum verification
   - Relationship verification

### Error Messages

Error messages follow this format:
```
❌ Error in [Phase]: [Operation]
   Details: [Error message]
   Context: [Relevant data]
   Action: [What to do next]
```

Example:
```
❌ Error in Campaign Creation: Database insertion failed
   Details: Duplicate entry for key 'campaigns.PRIMARY'
   Context: Campaign title: "Solar Energy Initiative"
   Action: Check database state and retry seeding
```

## Testing Strategy

### Dual Testing Approach

The seeding system will be tested using both unit tests and property-based tests:

**Unit Tests** focus on:
- Specific examples of data generation
- Edge cases (minimum/maximum values)
- Error conditions (connection failures, constraint violations)
- Console output formatting
- Configuration loading

**Property-Based Tests** focus on:
- Universal properties across all generated data
- Data distribution requirements
- Relationship constraints
- Calculation correctness
- Idempotency verification

### Property-Based Testing Configuration

The property-based tests will use **fast-check** (JavaScript property-based testing library) with the following configuration:

- Minimum 100 iterations per property test
- Each test tagged with reference to design property
- Tag format: `Feature: comprehensive-database-seeding, Property {number}: {property_text}`

### Test Organization

```
tests/
├── unit/
│   ├── connection.test.js          # Database connection tests
│   ├── cleanup.test.js             # Cleanup phase tests
│   ├── user-generator.test.js      # User generation tests
│   ├── campaign-generator.test.js  # Campaign generation tests
│   ├── milestone-generator.test.js # Milestone generation tests
│   ├── collaborator-generator.test.js # Collaborator generation tests
│   ├── investment-generator.test.js # Investment generation tests
│   └── logging.test.js             # Logging and output tests
│
└── property/
    ├── user-properties.test.js      # Properties 1-2
    ├── campaign-properties.test.js  # Properties 3-16
    ├── milestone-properties.test.js # Properties 17-23
    ├── collaborator-properties.test.js # Properties 24-28
    ├── investment-properties.test.js # Properties 29-36
    └── idempotency.test.js          # Property 37
```

### Example Property Test

```javascript
const fc = require('fast-check');

describe('Property 3: Campaign Count Exactness', () => {
  it('should create exactly 40 campaigns', async () => {
    // Feature: comprehensive-database-seeding, Property 3: Campaign Count Exactness
    
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 5, max: 8 }), // user count
        async (userCount) => {
          // Setup: Create test database
          const db = await createTestDatabase();
          
          // Execute: Run seeding
          await seedDatabase(db, { userCount });
          
          // Verify: Check campaign count
          const [result] = await db.query('SELECT COUNT(*) as count FROM campaigns');
          expect(result[0].count).toBe(40);
          
          // Cleanup
          await db.end();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Examples

```javascript
describe('User Generator', () => {
  it('should generate valid email format', () => {
    const user = generateUser('founder', 0);
    expect(user.email).toMatch(/^[a-z]+@example\.com$/);
  });
  
  it('should hash password with bcrypt', () => {
    const user = generateUser('investor', 0);
    expect(bcrypt.compareSync('password123', user.password)).toBe(true);
  });
  
  it('should assign unique profile images', () => {
    const users = Array.from({ length: 8 }, (_, i) => generateUser('founder', i));
    const imageUrls = users.map(u => u.profileImageUrl);
    const uniqueUrls = new Set(imageUrls);
    expect(uniqueUrls.size).toBe(8);
  });
});

describe('Error Handling', () => {
  it('should exit with code 1 on connection failure', async () => {
    const invalidConfig = {
      host: 'invalid-host',
      user: 'invalid-user',
      password: 'invalid-password',
      database: 'invalid-db'
    };
    
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation();
    await seedDatabase(invalidConfig);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
  
  it('should rollback transaction on constraint violation', async () => {
    const db = await createTestDatabase();
    
    // Create duplicate campaign
    await db.query('INSERT INTO campaigns (id, title, ...) VALUES (1, "Test", ...)');
    
    const result = await createCampaigns(db, founders, 40);
    expect(result.error).toBeDefined();
    
    // Verify rollback
    const [campaigns] = await db.query('SELECT COUNT(*) as count FROM campaigns');
    expect(campaigns[0].count).toBe(1); // Only the first one
  });
});
```

### Integration Testing

Integration tests will verify the complete seeding pipeline:

```javascript
describe('Complete Seeding Pipeline', () => {
  it('should seed database successfully', async () => {
    const db = await createTestDatabase();
    
    // Execute complete seeding
    const result = await seedDatabase(db);
    
    // Verify all phases completed
    expect(result.usersCreated).toBeGreaterThanOrEqual(5);
    expect(result.usersCreated).toBeLessThanOrEqual(8);
    expect(result.campaignsCreated).toBe(40);
    expect(result.milestonesCreated).toBeGreaterThanOrEqual(80);
    expect(result.collaboratorsCreated).toBeGreaterThanOrEqual(40);
    expect(result.investmentsCreated).toBeGreaterThan(0);
    
    await db.end();
  });
  
  it('should be idempotent', async () => {
    const db = await createTestDatabase();
    
    // Run seeding twice
    await seedDatabase(db);
    const firstRun = await getDatabaseSnapshot(db);
    
    await seedDatabase(db);
    const secondRun = await getDatabaseSnapshot(db);
    
    // Verify equivalent results
    expect(firstRun.campaignCount).toBe(secondRun.campaignCount);
    expect(firstRun.userCount).toBe(secondRun.userCount);
    expect(firstRun.milestoneCount).toBe(secondRun.milestoneCount);
    
    await db.end();
  });
});
```

### Test Data Generators

For property-based testing, custom generators will be created:

```javascript
// Custom arbitraries for fast-check
const userArbitrary = fc.record({
  email: fc.emailAddress(),
  fullName: fc.fullName(),
  userType: fc.constantFrom('admin', 'founder', 'investor'),
  companyName: fc.option(fc.company()),
  bio: fc.lorem({ maxCount: 50 })
});

const campaignArbitrary = fc.record({
  title: fc.lorem({ maxCount: 10 }),
  description: fc.lorem({ maxCount: 100 }),
  category: fc.constantFrom('Clean Energy', 'Agriculture', 'Healthcare', ...),
  target_amount: fc.integer({ min: 5000000, max: 100000000 }),
  minimum_investment: fc.integer({ min: 50000, max: 500000 })
});
```

### Performance Testing

Performance tests will verify seeding completes in reasonable time:

```javascript
describe('Performance', () => {
  it('should complete seeding in under 30 seconds', async () => {
    const db = await createTestDatabase();
    
    const startTime = Date.now();
    await seedDatabase(db);
    const endTime = Date.now();
    
    const executionTime = (endTime - startTime) / 1000;
    expect(executionTime).toBeLessThan(30);
    
    await db.end();
  });
});
```

### Test Coverage Goals

- Unit test coverage: 90%+ for all generator functions
- Property test coverage: 100% of all correctness properties
- Integration test coverage: All major workflows
- Error handling coverage: All error paths tested

