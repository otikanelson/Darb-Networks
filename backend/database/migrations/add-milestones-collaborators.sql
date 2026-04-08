-- =============================================
-- MIGRATION: Add Milestones Images/Video and Collaborators
-- =============================================

-- Note: USE statement removed - connection already specifies database

-- =============================================
-- UPDATE CAMPAIGN MILESTONES TABLE
-- =============================================
ALTER TABLE campaign_milestones
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL AFTER description,
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) NULL AFTER image_url;

-- =============================================
-- CREATE CAMPAIGN COLLABORATORS TABLE
-- =============================================
DROP TABLE IF EXISTS campaign_collaborators;
CREATE TABLE campaign_collaborators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  
  -- Collaborator Information
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  description TEXT NULL,
  
  -- Contact Information
  email VARCHAR(100) NULL,
  phoneNumber VARCHAR(20) NULL,
  
  -- Profile
  profile_image_url VARCHAR(500) NULL,
  linkedin_url VARCHAR(255) NULL,
  
  -- Order
  order_index INT DEFAULT 0,
  
  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_order_index (order_index)
) ENGINE=InnoDB;

-- =============================================
-- UPDATE CAMPAIGNS TABLE FOR RICH TEXT
-- =============================================
-- Change text fields to LONGTEXT for rich text content
ALTER TABLE campaigns
MODIFY COLUMN description LONGTEXT NOT NULL,
MODIFY COLUMN problem_statement LONGTEXT NULL,
MODIFY COLUMN solution LONGTEXT NULL,
MODIFY COLUMN business_plan LONGTEXT NULL,
MODIFY COLUMN market_analysis LONGTEXT NULL,
MODIFY COLUMN competitive_advantage LONGTEXT NULL,
MODIFY COLUMN financial_projections LONGTEXT NULL,
MODIFY COLUMN team_information LONGTEXT NULL,
MODIFY COLUMN risks_and_challenges LONGTEXT NULL;
