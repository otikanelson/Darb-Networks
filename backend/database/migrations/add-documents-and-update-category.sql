-- Migration: Add documents field and update productivity category
-- Date: 2026-04-12

-- Add documents column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN documents JSON NULL 
AFTER business_plan_url;

-- Update all campaigns with 'productivity' category to 'Business & Finance'
UPDATE campaigns 
SET category = 'Business & Finance' 
WHERE category = 'productivity';

-- Verify the changes
SELECT id, title, category FROM campaigns WHERE category = 'Business & Finance';
