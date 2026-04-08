# Database Seeding Guide

## Overview

The comprehensive database seeding script populates your Darb Network database with realistic test data. It creates:

- **5-8 Users** with varied roles (admin, founder, investor)
- **40 Campaigns** with diverse characteristics and content
- **Campaign Images** (2-5 per campaign) with stock photos
- **Milestones** (2-4 per campaign) with images and descriptions
- **Collaborators** (1-4 per campaign) linked to users
- **Investments** for funded campaigns with realistic amounts

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL Database** running and accessible
3. **Environment Variables** configured in `.env`

## Environment Setup

Create or update your `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=darb_network_db
DB_SSL=false
```

For production with SSL:
```env
DB_SSL=true
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Ensure the database schema is initialized:
```bash
# Run migrations if needed
node run-migration.js
```

## Usage

### Run the Seeding Script

```bash
npm run seed:database
```

Or directly:
```bash
node seed-database.js
```

### What Gets Created

#### Users (5-8 total)
- **1 Admin** - Full system access
- **2+ Founders** - Can create and manage campaigns
- **2+ Investors** - Can invest in campaigns
- All with realistic Nigerian names and profile images

#### Campaigns (40 total)
- **5-10 Featured** - Highlighted on platform
- **3-7 Drafts** - Not yet published
- **2-3 Completed** - Fully funded
- **10+ with long business plans** (>1000 characters)
- Varied content lengths for descriptions, problems, and solutions
- Progress levels from 0% to 150% funding
- Random categories: Clean Energy, Agriculture, Healthcare, Education, Technology, Fashion, Real Estate, Logistics, Fintech, Manufacturing
- Locations across Nigerian cities

#### Campaign Media
- **2-5 images per campaign** from Unsplash
- **10+ campaigns with video URLs** (YouTube/Vimeo)
- Images tagged as gallery, thumbnail, or banner

#### Milestones (2-4 per campaign)
- Realistic titles and descriptions
- Target amounts proportional to campaign goals
- Varied statuses: pending, active, completed, failed
- 50% have stock images
- Future target dates within 12 months

#### Collaborators (1-4 per campaign)
- Professional roles: CEO, CTO, CFO, COO, etc.
- 10+ campaigns linked to existing users
- Professional descriptions and contact info

#### Investments
- Created for all campaigns with progress > 0%
- Amounts between minimum and maximum investment
- Sum of investments equals campaign current_amount
- Realistic payment gateways: Paystack, Flutterwave, Bank Transfer
- Platform fees calculated at 2.5%
- Unique payment references

## Output

The script displays a summary upon completion:

```
============================================================
📊 DATABASE SEEDING SUMMARY
============================================================

✅ Seeding completed successfully!

Users Created:              7
Campaigns Created:          40
  - Featured:               8
  - Drafts:                 5
  - Completed:              3
Campaign Images Created:    156
Milestones Created:         128
Collaborators Created:      98
Investments Created:        245
Total Investment Amount:    ₦1,234,567,890

Execution Time:             12.45 seconds
============================================================
```

## Idempotency

The script is **idempotent** - you can run it multiple times safely:

1. Each execution deletes all existing campaigns and related data
2. Creates fresh data with new random values
3. Maintains data consistency and relationships
4. No duplicate data or conflicts

## Error Handling

The script handles various error scenarios:

- **Missing environment variables** - Exits with clear error message
- **Database connection failures** - Logs error and exits with status code 1
- **Constraint violations** - Rolls back transaction and reports error
- **Transaction failures** - Automatic rollback and cleanup

## Performance

- Typical execution time: **10-15 seconds**
- Optimized with batch transactions
- Efficient database operations
- Suitable for development and testing

## Data Characteristics

### Realistic Content
- Nigerian names and locations
- Business-appropriate descriptions
- Realistic financial amounts in Naira
- Professional roles and titles

### Varied Data
- Different content lengths
- Multiple status combinations
- Diverse funding levels
- Various image types and media

### Relationships
- Proper foreign key relationships
- Cascading deletes work correctly
- Investment amounts match campaign funding
- Milestone amounts proportional to campaigns

## Troubleshooting

### Connection Failed
```
❌ Database connection failed: connect ECONNREFUSED
```
**Solution:** Check DB_HOST, DB_PORT, and ensure MySQL is running

### Missing Environment Variables
```
❌ Error: Missing required database environment variables
```
**Solution:** Ensure all required variables are set in `.env`

### Permission Denied
```
❌ Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check DB_USER and DB_PASSWORD in `.env`

### Database Not Found
```
❌ Error: Unknown database 'darb_network_db'
```
**Solution:** Create the database or run migrations first

## Testing

Run the test suite to verify the seeding functions:

```bash
npm test -- seed-database.test.js
```

Tests verify:
- User generation with proper role distribution
- Campaign data validity and constraints
- Milestone and collaborator generation
- Media URL generation
- Content generation with proper lengths
- Random helper functions

## Advanced Usage

### Modify Seeding Parameters

Edit `backend/seed-database.js` to customize:

- Number of users (currently 5-8)
- Number of campaigns (currently 40)
- Campaign categories
- Nigerian cities
- Professional roles
- Stock image sources

### Extend the Script

Add new data types by:

1. Creating a generator function (e.g., `generateNewData()`)
2. Creating a creation function (e.g., `createNewData()`)
3. Adding it to the main `seedDatabase()` orchestrator
4. Updating the summary display

## Database Schema

The script uses these tables:
- `users` - User accounts with roles
- `campaigns` - Campaign projects
- `campaign_images` - Campaign media
- `campaign_milestones` - Campaign phases
- `campaign_collaborators` - Team members
- `investments` - Financial contributions

## Support

For issues or questions:
1. Check the error message and troubleshooting section
2. Verify environment variables
3. Ensure database is running and accessible
4. Check database schema is up to date
5. Review test output for specific failures

## License

Part of the Darb Network platform.
