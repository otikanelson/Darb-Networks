-- Create database if not exists
CREATE DATABASE IF NOT EXISTS darb_network_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE darb_network_dev;

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS campaign_images;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS campaign_documents;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS users;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
  
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
  
  -- Documents (JSON array of document objects)
  documents JSON NULL,
  
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
  INDEX idx_country (country),
  INDEX idx_createdAt (createdAt),
  INDEX idx_start_end_date (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- MILESTONES TABLE
-- =============================================
CREATE TABLE milestones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  achieved BOOLEAN DEFAULT FALSE,
  achieved_at DATETIME NULL,
  target_date DATE NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_achieved (achieved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INVESTMENTS TABLE
-- =============================================
CREATE TABLE investments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  investor_id INT NOT NULL,
  
  -- Investment Details
  amount DECIMAL(15,2) NOT NULL,
  shares INT NULL,
  
  -- Payment Information
  reference_id VARCHAR(100) NULL,
  payment_method VARCHAR(50) NULL,
  
  -- Status
  status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
  
  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_investor_id (investor_id),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CAMPAIGN IMAGES TABLE
-- =============================================
CREATE TABLE campaign_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_type ENUM('main', 'gallery') DEFAULT 'gallery',
  `order` INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_image_type (image_type),
  INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- CAMPAIGN DOCUMENTS TABLE
-- =============================================
CREATE TABLE campaign_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Success message
SELECT 'Database and tables created successfully!' AS status;
