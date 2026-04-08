-- =============================================
-- DARB NETWORK - AIVEN DATABASE SCHEMA
-- =============================================
-- Clean schema without views (views will be created separately)
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS payment_webhooks;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS repayments;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS campaign_favorites;
DROP TABLE IF EXISTS campaign_views;
DROP TABLE IF EXISTS campaign_images;
DROP TABLE IF EXISTS campaign_milestones;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  userType ENUM('founder', 'investor', 'admin') NOT NULL,
  companyName VARCHAR(100) NULL,
  phoneNumber VARCHAR(20) NULL,
  address TEXT NULL,
  bvn VARCHAR(11) NULL,
  cacNumber VARCHAR(50) NULL,
  accountNumber VARCHAR(10) NULL,
  bankName VARCHAR(50) NULL,
  bankCode VARCHAR(10) NULL,
  profileImageUrl VARCHAR(500) NULL,
  bio TEXT NULL,
  website VARCHAR(255) NULL,
  linkedinUrl VARCHAR(255) NULL,
  twitterUrl VARCHAR(255) NULL,
  isActive BOOLEAN DEFAULT TRUE,
  isVerified BOOLEAN DEFAULT FALSE,
  isEmailVerified BOOLEAN DEFAULT FALSE,
  isPhoneVerified BOOLEAN DEFAULT FALSE,
  isBvnVerified BOOLEAN DEFAULT FALSE,
  isCacVerified BOOLEAN DEFAULT FALSE,
  emailVerifiedAt DATETIME NULL,
  phoneVerifiedAt DATETIME NULL,
  bvnVerifiedAt DATETIME NULL,
  cacVerifiedAt DATETIME NULL,
  lastLoginAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_userType (userType),
  INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0.00,
  minimum_investment DECIMAL(15,2) NOT NULL,
  maximum_investment DECIMAL(15,2) NULL,
  problem_statement TEXT NULL,
  solution TEXT NULL,
  business_plan TEXT NULL,
  market_analysis TEXT NULL,
  competitive_advantage TEXT NULL,
  financial_projections TEXT NULL,
  team_information TEXT NULL,
  risks_and_challenges TEXT NULL,
  main_image_url VARCHAR(500) NULL,
  video_url VARCHAR(500) NULL,
  pitch_deck_url VARCHAR(500) NULL,
  business_plan_url VARCHAR(500) NULL,
  status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  investor_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  duration_days INT DEFAULT 90,
  founder_id INT NOT NULL,
  reviewed_by INT NULL,
  admin_comments TEXT NULL,
  rejection_reason TEXT NULL,
  submitted_at DATETIME NULL,
  approved_at DATETIME NULL,
  rejected_at DATETIME NULL,
  featured_at DATETIME NULL,
  completed_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (founder_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_founder_id (founder_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CAMPAIGN MILESTONES TABLE
-- =============================================
CREATE TABLE campaign_milestones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0.00,
  deliverables TEXT NULL,
  timeline VARCHAR(100) NULL,
  success_metrics TEXT NULL,
  status ENUM('pending', 'active', 'completed', 'failed') DEFAULT 'pending',
  order_index INT NOT NULL,
  target_date DATETIME NULL,
  completed_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_campaign_id (campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CAMPAIGN IMAGES TABLE
-- =============================================
CREATE TABLE campaign_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_type ENUM('gallery', 'thumbnail', 'banner') DEFAULT 'gallery',
  caption VARCHAR(255) NULL,
  order_index INT DEFAULT 0,
  filename VARCHAR(255) NOT NULL,
  file_size INT NULL,
  mime_type VARCHAR(100) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_campaign_id (campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CAMPAIGN VIEWS TABLE
-- =============================================
CREATE TABLE campaign_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  user_id INT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  referrer VARCHAR(500) NULL,
  session_id VARCHAR(100) NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CAMPAIGN FAVORITES TABLE
-- =============================================
CREATE TABLE campaign_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  user_id INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_campaign (user_id, campaign_id),
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INVESTMENTS TABLE
-- =============================================
CREATE TABLE investments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  milestone_id INT NULL,
  investor_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  investment_type ENUM('campaign', 'milestone') DEFAULT 'campaign',
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  payment_status ENUM('pending', 'processing', 'completed', 'failed', 'abandoned', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50) NULL,
  payment_gateway ENUM('paystack', 'flutterwave', 'bank_transfer') NOT NULL,
  payment_gateway_id VARCHAR(100) NULL,
  payment_gateway_response JSON NULL,
  transaction_fee DECIMAL(10,2) DEFAULT 0.00,
  platform_fee DECIMAL(10,2) DEFAULT 0.00,
  net_amount DECIMAL(15,2) NOT NULL,
  investor_message TEXT NULL,
  campaign_snapshot JSON NULL,
  expected_return_percentage DECIMAL(5,2) NULL,
  expected_return_date DATETIME NULL,
  total_repaid DECIMAL(15,2) DEFAULT 0.00,
  repayment_status ENUM('none', 'partial', 'complete', 'overdue') DEFAULT 'none',
  investment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_confirmed_at DATETIME NULL,
  payment_failed_at DATETIME NULL,
  refunded_at DATETIME NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES campaign_milestones(id) ON DELETE SET NULL,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_investor_id (investor_id),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- REPAYMENTS TABLE
-- =============================================
CREATE TABLE repayments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  investment_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  repayment_type ENUM('partial', 'final', 'interest', 'bonus') NOT NULL,
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  description TEXT NULL,
  repayment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  INDEX idx_investment_id (investment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  related_id INT NULL,
  related_type ENUM('campaign', 'investment', 'user', 'system') NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500) NULL,
  action_text VARCHAR(100) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  is_sms_sent BOOLEAN DEFAULT FALSE,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  read_at DATETIME NULL,
  email_sent_at DATETIME NULL,
  sms_sent_at DATETIME NULL,
  expires_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- PAYMENT WEBHOOKS TABLE
-- =============================================
CREATE TABLE payment_webhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_reference VARCHAR(100) NULL,
  gateway ENUM('paystack', 'flutterwave') NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  headers JSON NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT NULL,
  retry_count INT DEFAULT 0,
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  INDEX idx_payment_reference (payment_reference),
  INDEX idx_processed (processed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- PASSWORD RESETS TABLE
-- =============================================
CREATE TABLE password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  user_id INT NULL,
  token VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- EMAIL VERIFICATIONS TABLE
-- =============================================
CREATE TABLE email_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  user_email VARCHAR(100) NULL,
  user_type VARCHAR(20) NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NULL,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description TEXT NULL,
  category VARCHAR(50) DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  is_editable BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CREATE VIEW: campaign_details
-- =============================================
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
  CASE 
    WHEN c.target_amount > 0 THEN ROUND((c.current_amount / c.target_amount) * 100, 2)
    ELSE 0 
  END as progress_percentage
FROM campaigns c
LEFT JOIN users u ON c.founder_id = u.id;
