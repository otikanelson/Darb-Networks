-- =============================================
-- DARB NETWORK - COMPLETE DATABASE SCHEMA
-- =============================================
-- Version: 1.0.0
-- Description: Complete database schema for Darb Network crowdfunding platform
-- =============================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS darb_network_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE darb_network_db;

-- =============================================
-- USERS TABLE
-- =============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  userType ENUM('founder', 'investor', 'admin') NOT NULL,
  companyName VARCHAR(100) NULL,
  phoneNumber VARCHAR(20) NULL,
  address TEXT NULL,
  
  -- KYC Information
  bvn VARCHAR(11) NULL,
  cacNumber VARCHAR(50) NULL,
  
  -- Banking Information
  accountNumber VARCHAR(10) NULL,
  bankName VARCHAR(50) NULL,
  bankCode VARCHAR(10) NULL,
  
  -- Profile Information
  profileImageUrl VARCHAR(500) NULL,
  bio TEXT NULL,
  website VARCHAR(255) NULL,
  linkedinUrl VARCHAR(255) NULL,
  twitterUrl VARCHAR(255) NULL,
  
  -- Status and Verification
  isActive BOOLEAN DEFAULT TRUE,
  isVerified BOOLEAN DEFAULT FALSE,
  isEmailVerified BOOLEAN DEFAULT FALSE,
  isPhoneVerified BOOLEAN DEFAULT FALSE,
  isBvnVerified BOOLEAN DEFAULT FALSE,
  isCacVerified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  emailVerifiedAt DATETIME NULL,
  phoneVerifiedAt DATETIME NULL,
  bvnVerifiedAt DATETIME NULL,
  cacVerifiedAt DATETIME NULL,
  lastLoginAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_userType (userType),
  INDEX idx_isActive (isActive),
  INDEX idx_isVerified (isVerified),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB;

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
DROP TABLE IF EXISTS campaigns;
CREATE TABLE campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  
  -- Financial Information
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0.00,
  minimum_investment DECIMAL(15,2) NOT NULL,
  maximum_investment DECIMAL(15,2) NULL,
  
  -- Campaign Content
  problem_statement TEXT NULL,
  solution TEXT NULL,
  business_plan TEXT NULL,
  market_analysis TEXT NULL,
  competitive_advantage TEXT NULL,
  financial_projections TEXT NULL,
  team_information TEXT NULL,
  risks_and_challenges TEXT NULL,
  
  -- Media
  main_image_url VARCHAR(500) NULL,
  video_url VARCHAR(500) NULL,
  pitch_deck_url VARCHAR(500) NULL,
  business_plan_url VARCHAR(500) NULL,
  
  -- Status and Workflow
  status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  view_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  investor_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  
  -- Campaign Duration
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  duration_days INT DEFAULT 90,
  
  -- Relationships
  founder_id INT NOT NULL,
  reviewed_by INT NULL,
  
  -- Admin Review
  admin_comments TEXT NULL,
  rejection_reason TEXT NULL,
  
  -- Timestamps
  submitted_at DATETIME NULL,
  approved_at DATETIME NULL,
  rejected_at DATETIME NULL,
  featured_at DATETIME NULL,
  completed_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (founder_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_founder_id (founder_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_location (location),
  INDEX idx_is_featured (is_featured),
  INDEX idx_target_amount (target_amount),
  INDEX idx_createdAt (createdAt),
  INDEX idx_end_date (end_date)
) ENGINE=InnoDB;

-- =============================================
-- CAMPAIGN MILESTONES TABLE
-- =============================================
DROP TABLE IF EXISTS campaign_milestones;
CREATE TABLE campaign_milestones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  
  -- Milestone Information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0.00,
  
  -- Milestone Details
  deliverables TEXT NULL,
  timeline VARCHAR(100) NULL,
  success_metrics TEXT NULL,
  
  -- Status
  status ENUM('pending', 'active', 'completed', 'failed') DEFAULT 'pending',
  order_index INT NOT NULL,
  
  -- Timestamps
  target_date DATETIME NULL,
  completed_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_status (status),
  INDEX idx_order_index (order_index)
) ENGINE=InnoDB;

-- =============================================
-- CAMPAIGN IMAGES TABLE
-- =============================================
DROP TABLE IF EXISTS campaign_images;
CREATE TABLE campaign_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  
  -- Image Information
  image_url VARCHAR(500) NOT NULL,
  image_type ENUM('gallery', 'thumbnail', 'banner') DEFAULT 'gallery',
  caption VARCHAR(255) NULL,
  order_index INT DEFAULT 0,
  
  -- File Information
  filename VARCHAR(255) NOT NULL,
  file_size INT NULL,
  mime_type VARCHAR(100) NULL,
  
  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_image_type (image_type),
  INDEX idx_order_index (order_index)
) ENGINE=InnoDB;

-- =============================================
-- CAMPAIGN VIEWS TABLE
-- =============================================
DROP TABLE IF EXISTS campaign_views;
CREATE TABLE campaign_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  user_id INT NULL,
  
  -- View Information
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  referrer VARCHAR(500) NULL,
  session_id VARCHAR(100) NULL,
  
  -- Timestamps
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_user_id (user_id),
  INDEX idx_viewed_at (viewed_at),
  INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB;

-- =============================================
-- CAMPAIGN FAVORITES TABLE
-- =============================================
DROP TABLE IF EXISTS campaign_favorites;
CREATE TABLE campaign_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  user_id INT NOT NULL,
  
  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate favorites
  UNIQUE KEY unique_user_campaign (user_id, campaign_id),
  
  -- Indexes
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_user_id (user_id),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB;

-- =============================================
-- INVESTMENTS TABLE
-- =============================================
DROP TABLE IF EXISTS investments;
CREATE TABLE investments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Relationship Information
  campaign_id INT NOT NULL,
  milestone_id INT NULL,
  investor_id INT NOT NULL,
  
  -- Investment Details
  amount DECIMAL(15,2) NOT NULL,
  investment_type ENUM('campaign', 'milestone') DEFAULT 'campaign',
  
  -- Payment Information
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  payment_status ENUM('pending', 'processing', 'completed', 'failed', 'abandoned', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50) NULL,
  payment_gateway ENUM('paystack', 'flutterwave', 'bank_transfer') NOT NULL,
  payment_gateway_id VARCHAR(100) NULL,
  payment_gateway_response JSON NULL,
  
  -- Transaction Information
  transaction_fee DECIMAL(10,2) DEFAULT 0.00,
  platform_fee DECIMAL(10,2) DEFAULT 0.00,
  net_amount DECIMAL(15,2) NOT NULL,
  
  -- Investor Information
  investor_message TEXT NULL,
  investor_email VARCHAR(100) NULL,
  investor_phone VARCHAR(20) NULL,
  
  -- Campaign Snapshot (for historical data)
  campaign_snapshot JSON NULL,
  
  -- Return Information
  expected_return_percentage DECIMAL(5,2) NULL,
  expected_return_date DATETIME NULL,
  total_repaid DECIMAL(15,2) DEFAULT 0.00,
  repayment_status ENUM('none', 'partial', 'complete', 'overdue') DEFAULT 'none',
  
  -- Timestamps
  investment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_confirmed_at DATETIME NULL,
  payment_failed_at DATETIME NULL,
  refunded_at DATETIME NULL,
  
  -- Foreign Keys
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES campaign_milestones(id) ON DELETE SET NULL,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_investor_id (investor_id),
  INDEX idx_payment_reference (payment_reference),
  INDEX idx_payment_status (payment_status),
  INDEX idx_investment_date (investment_date),
  INDEX idx_payment_gateway (payment_gateway)
) ENGINE=InnoDB;

-- =============================================
-- REPAYMENTS TABLE
-- =============================================
DROP TABLE IF EXISTS repayments;
CREATE TABLE repayments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  investment_id INT NOT NULL,
  
  -- Repayment Information
  amount DECIMAL(15,2) NOT NULL,
  repayment_type ENUM('partial', 'final', 'interest', 'bonus') NOT NULL,
  
  -- Payment Information
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  
  -- Description
  description TEXT NULL,
  
  -- Timestamps
  repayment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  
  -- Foreign Keys
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_investment_id (investment_id),
  INDEX idx_payment_reference (payment_reference),
  INDEX idx_repayment_date (repayment_date)
) ENGINE=InnoDB;

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Relationship Information
  user_id INT NOT NULL,
  related_id INT NULL,
  related_type ENUM('campaign', 'investment', 'user', 'system') NULL,
  
  -- Notification Content
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Action Information
  action_url VARCHAR(500) NULL,
  action_text VARCHAR(100) NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  is_sms_sent BOOLEAN DEFAULT FALSE,
  
  -- Priority
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  
  -- Timestamps
  read_at DATETIME NULL,
  email_sent_at DATETIME NULL,
  sms_sent_at DATETIME NULL,
  expires_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_priority (priority),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB;

-- =============================================
-- PAYMENT WEBHOOKS TABLE
-- =============================================
DROP TABLE IF EXISTS payment_webhooks;
CREATE TABLE payment_webhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Webhook Information
  payment_reference VARCHAR(100) NULL,
  gateway ENUM('paystack', 'flutterwave') NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  
  -- Payload
  payload JSON NOT NULL,
  headers JSON NULL,
  
  -- Processing Information
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT NULL,
  retry_count INT DEFAULT 0,
  
  -- Timestamps
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  
  -- Indexes
  INDEX idx_payment_reference (payment_reference),
  INDEX idx_gateway (gateway),
  INDEX idx_event_type (event_type),
  INDEX idx_processed (processed),
  INDEX idx_received_at (received_at)
) ENGINE=InnoDB;

-- =============================================
-- PASSWORD RESETS TABLE
-- =============================================
DROP TABLE IF EXISTS password_resets;
CREATE TABLE password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- User Information
  email VARCHAR(100) NOT NULL,
  user_id INT NULL,
  
  -- Token Information
  token VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  
  -- Status
  used BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  
  -- Timestamps
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_used (used)
) ENGINE=InnoDB;

-- =============================================
-- EMAIL VERIFICATION TABLE
-- =============================================
DROP TABLE IF EXISTS email_verifications;
CREATE TABLE email_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- User Information
  user_id INT NOT NULL,
  email VARCHAR(100) NOT NULL,
  
  -- Token Information
  token VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  
  -- Status
  verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_verified (verified)
) ENGINE=InnoDB;

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- User Information
  user_id INT NULL,
  user_email VARCHAR(100) NULL,
  user_type VARCHAR(20) NULL,
  
  -- Action Information
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  
  -- Change Information
  old_values JSON NULL,
  new_values JSON NULL,
  
  -- Request Information
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  
  -- Timestamps
  performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_performed_at (performed_at)
) ENGINE=InnoDB;

-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================
DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Setting Information
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NULL,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  
  -- Description
  description TEXT NULL,
  category VARCHAR(50) DEFAULT 'general',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_editable BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_setting_key (setting_key),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- =============================================
-- DATABASE VIEWS
-- =============================================

-- Campaign Details View with Founder Information
CREATE OR REPLACE VIEW campaign_details AS
SELECT 
  c.*,
  u.fullName as founder_name,
  u.email as founder_email,
  u.companyName as founder_company,
  u.profileImageUrl as founder_avatar,
  u.bio as founder_bio,
  u.website as founder_website,
  u.isVerified as founder_verified,
  admin.fullName as reviewed_by_name,
  admin.email as reviewed_by_email,
  
  -- Calculate progress percentage
  CASE 
    WHEN c.target_amount > 0 THEN ROUND((c.current_amount / c.target_amount) * 100, 2)
    ELSE 0 
  END as progress_percentage,
  
  -- Calculate days remaining
  CASE 
    WHEN c.end_date IS NOT NULL AND c.end_date > NOW() THEN DATEDIFF(c.end_date, NOW())
    ELSE 0 
  END as days_remaining,
  
  -- Calculate campaign duration
  CASE 
    WHEN c.start_date IS NOT NULL AND c.end_date IS NOT NULL THEN DATEDIFF(c.end_date, c.start_date)
    ELSE c.duration_days 
  END as total_duration_days

FROM campaigns c
LEFT JOIN users u ON c.founder_id = u.id
LEFT JOIN users admin ON c.reviewed_by = admin.id;

-- Investment Summary View
CREATE OR REPLACE VIEW investment_summary AS
SELECT 
  i.*,
  c.title as campaign_title,
  c.category as campaign_category,
  u.fullName as investor_name,
  u.email as investor_email,
  founder.fullName as founder_name,
  founder.email as founder_email
FROM investments i
LEFT JOIN campaigns c ON i.campaign_id = c.id
LEFT JOIN users u ON i.investor_id = u.id
LEFT JOIN users founder ON c.founder_id = founder.id;

-- User Statistics View
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  u.id,
  u.fullName,
  u.email,
  u.userType,
  u.createdAt,
  
  -- Founder Statistics
  CASE WHEN u.userType = 'founder' THEN
    (SELECT COUNT(*) FROM campaigns WHERE founder_id = u.id)
    ELSE 0
  END as total_campaigns,
  
  CASE WHEN u.userType = 'founder' THEN
    (SELECT COUNT(*) FROM campaigns WHERE founder_id = u.id AND status = 'approved')
    ELSE 0
  END as approved_campaigns,
  
  CASE WHEN u.userType = 'founder' THEN
    (SELECT COALESCE(SUM(current_amount), 0) FROM campaigns WHERE founder_id = u.id)
    ELSE 0
  END as total_raised,
  
  -- Investor Statistics
  CASE WHEN u.userType = 'investor' THEN
    (SELECT COUNT(*) FROM investments WHERE investor_id = u.id AND payment_status = 'completed')
    ELSE 0
  END as total_investments,
  
  CASE WHEN u.userType = 'investor' THEN
    (SELECT COALESCE(SUM(amount), 0) FROM investments WHERE investor_id = u.id AND payment_status = 'completed')
    ELSE 0
  END as total_invested,
  
  -- General Statistics
  (SELECT COUNT(*) FROM campaign_favorites WHERE user_id = u.id) as favorite_campaigns,
  (SELECT COUNT(*) FROM campaign_views WHERE user_id = u.id) as campaign_views

FROM users u;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Additional indexes for better performance
CREATE INDEX idx_campaigns_status_featured ON campaigns(status, is_featured);
CREATE INDEX idx_campaigns_category_status ON campaigns(category, status);
CREATE INDEX idx_campaigns_end_date_status ON campaigns(end_date, status);