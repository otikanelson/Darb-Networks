-- Migration: Add country column to campaigns table
-- Date: 2024
-- Description: Adds support for multi-country campaigns

ALTER TABLE campaigns 
ADD COLUMN country VARCHAR(100) NOT NULL DEFAULT 'Nigeria' AFTER location;

-- Add index for faster filtering
CREATE INDEX idx_campaigns_country ON campaigns(country);
