-- Migration: Add country column to campaigns table
-- Purpose: Enable country-based campaign filtering

-- Add country column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN country VARCHAR(100) NOT NULL DEFAULT 'Nigeria' AFTER location;

-- Add index for better query performance
CREATE INDEX idx_campaigns_country ON campaigns(country);

-- Create a composite index for common queries
CREATE INDEX idx_campaigns_country_status ON campaigns(country, status);

-- Update existing campaigns to have Nigeria as default country
UPDATE campaigns SET country = 'Nigeria' WHERE country = '';

-- Add comment to column
ALTER TABLE campaigns MODIFY COLUMN country VARCHAR(100) NOT NULL COMMENT 'Country where the campaign is based (e.g., Nigeria, Kenya, Ghana)';
