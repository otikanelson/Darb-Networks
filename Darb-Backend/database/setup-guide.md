# Database Setup Guide for Darb Network

This guide provides comprehensive instructions for setting up the MySQL database for the Darb Network crowdfunding platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MySQL Installation](#mysql-installation)
3. [Database Creation](#database-creation)
4. [Running SQL Scripts](#running-sql-scripts)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Database Maintenance](#database-maintenance)
8. [Production Considerations](#production-considerations)

## Prerequisites

Before setting up the database, ensure you have:

- MySQL 8.0 or higher installed
- MySQL command-line client (mysql) available
- Administrative access to create databases and users
- At least 1GB free disk space for development
- Basic familiarity with SQL and command line

### System Requirements

- **RAM**: Minimum 4GB (8GB recommended for development)
- **Storage**: At least 1GB free space (more for production)
- **MySQL Version**: 8.0+ (for JSON support and better performance)

## MySQL Installation

### Windows

1. **Download MySQL**:
   ```
   Visit: https://dev.mysql.com/downloads/mysql/
   Download: MySQL Community Server 8.0+
   ```

2. **Install MySQL**:
   - Run the installer
   - Choose "Developer Default" setup type
   - Set root password (remember this!)
   - Complete installation

3. **Add MySQL to PATH**:
   ```cmd
   # Add to System PATH: C:\Program Files\MySQL\MySQL Server 8.0\bin
   ```

### macOS

1. **Using Homebrew** (Recommended):
   ```bash
   # Install Homebrew if not installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MySQL
   brew install mysql@8.0
   
   # Start MySQL service
   brew services start mysql@8.0
   ```

2. **Using MySQL Installer**:
   ```
   Visit: https://dev.mysql.com/downloads/mysql/
   Download: MySQL Community Server for macOS
   ```

### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt update

# Install MySQL Server
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Linux (CentOS/RHEL)

```bash
# Install MySQL repository
sudo dnf install mysql-server

# Start and enable MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Get temporary root password
sudo grep 'temporary password' /var/log/mysqld.log

# Secure installation
sudo mysql_secure_installation
```

## Database Creation

### Method 1: Command Line Setup

1. **Connect to MySQL**:
   ```bash
   mysql -u root -p
   ```

2. **Create Database**:
   ```sql
   CREATE DATABASE darb_network_db 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

3. **Create Application User** (Recommended):
   ```sql
   -- Create user for the application
   CREATE USER 'darb_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON darb_network_db.* TO 'darb_user'@'localhost';
   
   -- Apply changes
   FLUSH PRIVILEGES;
   
   -- Exit MySQL
   EXIT;
   ```

### Method 2: Automated Setup

Create a setup script `setup_database.sh`:

```bash
#!/bin/bash

# Database configuration
DB_NAME="darb_network_db"
DB_USER="darb_user"
DB_PASS="your_secure_password"
ROOT_PASS="your_root_password"

echo "Setting up Darb Network Database..."

# Create database and user
mysql -u root -p$ROOT_PASS <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "Database and user created successfully!"
```

Make it executable and run:
```bash
chmod +x setup_database.sh
./setup_database.sh
```

## Running SQL Scripts

### Step 1: Navigate to Project Directory

```bash
cd /path/to/darb-network
```

### Step 2: Run Schema Script

```bash
# Using root user
mysql -u root -p darb_network_db < database/schema.sql

# Or using application user
mysql -u darb_user -p darb_network_db < database/schema.sql
```

### Step 3: Load Sample Data (Optional)

```bash
# Load sample data for development
mysql -u darb_user -p darb_network_db < database/seed-data.sql
```

### Step 4: Verify Installation

```bash
# Connect to database
mysql -u darb_user -p darb_network_db

# Check tables
SHOW TABLES;

# Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM campaigns;

# Exit
EXIT;
```

## Verification

### Database Structure Verification

```sql
-- Connect to database
mysql -u darb_user -p darb_network_db

-- Verify all tables exist
SHOW TABLES;

-- Expected tables:
-- audit_logs
-- campaign_favorites
-- campaign_images
-- campaign_milestones
-- campaign_views
-- campaigns
-- email_verifications
-- investments
-- notifications
-- password_resets
-- payment_webhooks
-- repayments
-- system_settings
-- users

-- Check table structures
DESCRIBE users;
DESCRIBE campaigns;
DESCRIBE investments;

-- Verify views
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Check indexes
SHOW INDEX FROM campaigns;
SHOW INDEX FROM users;
```

### Sample Data Verification

```sql
-- Check user accounts
SELECT id, email, fullName, userType, isVerified FROM users;

-- Check campaigns
SELECT id, title, category, status, target_amount, current_amount FROM campaigns;

-- Check investments
SELECT id, campaign_id, investor_id, amount, payment_status FROM investments;

-- Verify relationships work
SELECT 
    c.title,
    u.fullName as founder_name,
    c.target_amount,
    c.current_amount
FROM campaigns c
JOIN users u ON c.founder_id = u.id
WHERE c.status = 'approved';
```

### Performance Check

```sql
-- Check database size
SELECT 
    table_schema as 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'darb_network_db'
GROUP BY table_schema;

-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size (MB)',
    table_rows
FROM information_schema.tables 
WHERE table_schema = 'darb_network_db'
ORDER BY (data_length + index_length) DESC;
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Access Denied Error

**Problem**: `ERROR 1045 (28000): Access denied for user 'root'@'localhost'`

**Solutions**:
```bash
# Reset root password (Ubuntu/Debian)
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

# Or for newer MySQL versions
sudo mysql_secure_installation
```

#### 2. Database Connection Refused

**Problem**: `ERROR 2002 (HY000): Can't connect to local MySQL server`

**Solutions**:
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql

# Check MySQL port
sudo netstat -tlnp | grep :3306
```

#### 3. Character Set Issues

**Problem**: Emoji or special characters not saving properly

**Solution**:
```sql
-- Verify database charset
SELECT default_character_set_name FROM information_schema.SCHEMATA 
WHERE schema_name = 'darb_network_db';

-- Should return: utf8mb4

-- Fix if needed
ALTER DATABASE darb_network_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 4. Foreign Key Constraint Errors

**Problem**: `ERROR 1452: Cannot add or update a child row`

**Solutions**:
```sql
-- Check foreign key constraints
SELECT * FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = 'darb_network_db';

-- Temporarily disable foreign key checks (if needed for data import)
SET FOREIGN_KEY_CHECKS = 0;
-- Run your problematic query
SET FOREIGN_KEY_CHECKS = 1;
```

#### 5. Schema Already Exists

**Problem**: Tables already exist when running schema.sql

**Solution**:
```sql
-- Drop database and recreate (WARNING: This deletes all data!)
DROP DATABASE IF EXISTS darb_network_db;
CREATE DATABASE darb_network_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Or drop individual tables
DROP TABLE IF EXISTS table_name;
```

### Performance Issues

#### Slow Queries

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2; -- Log queries taking > 2 seconds

-- Check query performance
EXPLAIN SELECT * FROM campaigns WHERE status = 'approved';

-- Add missing indexes if needed
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

#### Memory Issues

```sql
-- Check MySQL memory usage
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- Adjust if needed (in my.cnf or my.ini)
[mysqld]
innodb_buffer_pool_size = 1G
```

## Database Maintenance

### Backup Procedures

#### Daily Backup Script

```bash
#!/bin/bash
# backup_database.sh

DB_NAME="darb_network_db"
DB_USER="darb_user"
DB_PASS="your_password"
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/darb_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/darb_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "darb_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: darb_backup_$DATE.sql.gz"
```

#### Automated Backup with Cron

```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/backup_database.sh >> /var/log/darb_backup.log 2>&1
```

### Restore Procedures

```bash
# Restore from backup
gunzip darb_backup_20231201_020001.sql.gz
mysql -u darb_user -p darb_network_db < darb_backup_20231201_020001.sql
```

### Regular Maintenance

#### Weekly Maintenance Script

```sql
-- Optimize tables
OPTIMIZE TABLE users, campaigns, investments, notifications;

-- Check table integrity
CHECK TABLE users, campaigns, investments, notifications;

-- Update table statistics
ANALYZE TABLE users, campaigns, investments, notifications;

-- Clean up old data (customize as needed)
DELETE FROM password_resets WHERE expires_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
DELETE FROM email_verifications WHERE expires_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
DELETE FROM audit_logs WHERE performed_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

## Production Considerations

### Security Configuration

```sql
-- Create read-only user for reporting
CREATE USER 'darb_readonly'@'localhost' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON darb_network_db.* TO 'darb_readonly'@'localhost';

-- Create backup user
CREATE USER 'darb_backup'@'localhost' IDENTIFIED BY 'backup_password';
GRANT SELECT, LOCK TABLES ON darb_network_db.* TO 'darb_backup'@'localhost';
```

### Performance Optimization

```ini
# my.cnf optimizations for production
[mysqld]
# Memory settings
innodb_buffer_pool_size = 4G
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M

# Connection settings
max_connections = 500
connect_timeout = 10
wait_timeout = 600
interactive_timeout = 600

# Query cache (if using MySQL < 8.0)
query_cache_type = 1
query_cache_size = 64M

# Binary logging for replication
log-bin = mysql-bin
binlog-format = ROW
expire_logs_days = 7
```

### Monitoring Setup

```sql
-- Enable performance schema
UPDATE performance_schema.setup_instruments 
SET ENABLED = 'YES', TIMED = 'YES' 
WHERE NAME LIKE '%statement/%';

-- Monitor slow queries
SELECT 
    query_sample_text,
    avg_timer_wait/1000000000 as avg_time_seconds,
    count_star as execution_count
FROM performance_schema.events_statements_summary_by_digest 
ORDER BY avg_timer_wait DESC 
LIMIT 10;
```

### Replication Setup (for High Availability)

```ini
# Master configuration (my.cnf)
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-do-db = darb_network_db

# Slave configuration (my.cnf)
[mysqld]
server-id = 2
relay-log = mysql-relay-bin
```

## Environment-Specific Setup

### Development Environment

```bash
# .env for development
DB_HOST=localhost
DB_USER=darb_user
DB_PASSWORD=dev_password
DB_NAME=darb_network_db
DB_PORT=3306
DB_LOGGING=true
```

### Staging Environment

```bash
# .env for staging
DB_HOST=staging-db.company.com
DB_USER=darb_staging
DB_PASSWORD=staging_secure_password
DB_NAME=darb_network_staging
DB_PORT=3306
DB_LOGGING=false
```

### Production Environment

```bash
# .env for production
DB_HOST=prod-db.company.com
DB_USER=darb_prod
DB_PASSWORD=super_secure_production_password
DB_NAME=darb_network_prod
DB_PORT=3306
DB_LOGGING=false
```

---

## Support

If you encounter issues during database setup:

1. **Check the logs**: MySQL error log usually located at `/var/log/mysql/error.log`
2. **Verify permissions**: Ensure the MySQL user has proper file system permissions
3. **Test connections**: Use `mysql -u username -p -h hostname` to test connectivity
4. **Review configuration**: Check `my.cnf` or `my.ini` for configuration issues

For additional support:
- **Email**: otikanelson29@gmail.com
- **Documentation**: Check project README and API documentation
- **Issues**: Create an issue in the GitHub repository

---

**Last Updated**: December 2024  
**Version**: 1.0.0

