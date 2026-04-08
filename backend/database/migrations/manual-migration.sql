-- =============================================
-- MANUAL MIGRATION SCRIPT
-- Run this directly in your Aiven MySQL console
-- =============================================

-- 1. Add columns to campaign_milestones table
ALTER TABLE campaign_milestones
ADD COLUMN image_url VARCHAR(500) NULL AFTER description;

ALTER TABLE campaign_milestones
ADD COLUMN video_url VARCHAR(500) NULL AFTER image_url;

-- 2. Create campaign_collaborators table
CREATE TABLE IF NOT EXISTS campaign_collaborators (
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

-- 3. Update campaigns table for rich text (change TEXT to LONGTEXT)
ALTER TABLE campaigns MODIFY COLUMN description LONGTEXT NOT NULL;
ALTER TABLE campaigns MODIFY COLUMN problem_statement LONGTEXT NULL;
ALTER TABLE campaigns MODIFY COLUMN solution LONGTEXT NULL;
ALTER TABLE campaigns MODIFY COLUMN business_plan LONGTEXT NULL;
ALTER TABLE campaigns MODIFY COLUMN market_analysis LONGTEXT NULL;
ALTER TABLE campaigns MODIFY COLUMN competitive_advantage LONGTEXT NULL;
ALTER TABLE campaigns MODIFY COLUMN financial_projections LONGTEXT NULL;
ALTER TABLE campaigns MODIFY COLUMN team_information LONGTEXT NULL;
ALTER TABLE campaigns MODIFY COLUMN risks_and_challenges LONGTEXT NULL;

-- 4. Verify changes
SHOW TABLES LIKE '%collaborator%';
DESCRIBE campaign_milestones;
DESCRIBE campaign_collaborators;
