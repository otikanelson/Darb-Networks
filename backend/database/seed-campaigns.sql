-- =============================================
-- DARB NETWORK - CAMPAIGN SEED DATA
-- =============================================
-- Description: Seed data for sample campaigns with stock photos
-- =============================================

USE darb_network_db;

-- First, create a sample founder user if not exists
INSERT INTO users (email, password, fullName, userType, companyName, phoneNumber, address, isActive, isVerified, isEmailVerified, bio, website)
VALUES 
('founder@example.com', '$2b$10$YourHashedPasswordHere', 'John Doe', 'founder', 'Tech Innovations Ltd', '+2348012345678', 'Lagos, Nigeria', TRUE, TRUE, TRUE, 'Experienced entrepreneur with 10+ years in tech startups', 'https://techinnovations.com')
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

SET @founder_id = LAST_INSERT_ID();

-- =============================================
-- CAMPAIGN 1: EcoCharge - Solar Power Solutions
-- =============================================
INSERT INTO campaigns (
  title,
  description,
  category,
  location,
  target_amount,
  current_amount,
  minimum_investment,
  maximum_investment,
  problem_statement,
  solution,
  business_plan,
  market_analysis,
  competitive_advantage,
  financial_projections,
  team_information,
  risks_and_challenges,
  main_image_url,
  status,
  is_featured,
  view_count,
  investor_count,
  start_date,
  end_date,
  duration_days,
  founder_id
) VALUES (
  'EcoCharge - Affordable Solar Power for Nigerian Homes',
  'EcoCharge is revolutionizing access to clean, affordable energy in Nigeria by providing innovative solar power solutions for homes and small businesses. Our mission is to make renewable energy accessible to every Nigerian household, reducing dependence on expensive generators and unreliable grid power.',
  'Clean Energy',
  'Lagos, Nigeria',
  50000000.00,
  12500000.00,
  50000.00,
  5000000.00,
  'Over 85 million Nigerians lack access to reliable electricity. The average Nigerian household spends ₦30,000-₦50,000 monthly on fuel for generators, contributing to air pollution and high energy costs. Traditional solar solutions are too expensive for most families, creating a significant market gap.',
  'EcoCharge offers affordable, modular solar power systems with flexible payment plans. Our innovative approach includes: 1) Pay-as-you-go solar panels with mobile money integration, 2) Modular systems that can be expanded as needs grow, 3) Local assembly and maintenance to reduce costs, 4) Smart monitoring via mobile app for energy optimization.',
  'Phase 1 (Months 1-6): Establish manufacturing facility and hire 50 local technicians. Phase 2 (Months 7-12): Launch pilot program in 5 Lagos communities with 500 installations. Phase 3 (Year 2): Scale to 10,000 installations across Lagos and Abuja. Phase 4 (Year 3): Expand to 5 additional states with 50,000 total installations.',
  'The Nigerian solar market is projected to reach $2.5 billion by 2025. Our target market includes 15 million middle-income households earning ₦150,000-₦500,000 monthly. Current market penetration is less than 5%, indicating massive growth potential. Key competitors include Arnergy, Lumos, and traditional generator sellers.',
  '1) Local manufacturing reduces costs by 40% vs imported systems, 2) Mobile money integration enables micro-payments, 3) Proprietary IoT monitoring system optimizes energy usage, 4) Strong partnerships with local banks for financing, 5) Experienced team with 20+ years combined experience in renewable energy.',
  'Year 1: Revenue ₦500M, 5,000 installations, Break-even by Q4. Year 2: Revenue ₦2.5B, 25,000 installations, Net profit ₦400M. Year 3: Revenue ₦8B, 80,000 installations, Net profit ₦1.6B. Projected ROI for investors: 35% annually over 3 years.',
  'CEO: Adebayo Okonkwo - 15 years in renewable energy, former VP at Shell Nigeria. CTO: Chioma Nwosu - MIT graduate, 10 years in IoT and smart grid technology. CFO: Ibrahim Musa - Former investment banker at Access Bank. Operations Director: Fatima Abdullahi - 8 years in supply chain management.',
  'Key risks include: 1) Currency fluctuation affecting component costs (Mitigation: Local manufacturing and hedging), 2) Regulatory changes in energy sector (Mitigation: Strong government relationships), 3) Competition from established players (Mitigation: Superior technology and pricing), 4) Customer payment defaults (Mitigation: Remote shut-off capability and insurance).',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
  'approved',
  TRUE,
  1250,
  45,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 60 DAY),
  90,
  @founder_id
);

SET @campaign1_id = LAST_INSERT_ID();

-- Add gallery images for Campaign 1
INSERT INTO campaign_images (campaign_id, image_url, image_type, caption, order_index, filename, mime_type) VALUES
(@campaign1_id, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', 'banner', 'Solar panels installation', 1, 'solar-banner.jpg', 'image/jpeg'),
(@campaign1_id, 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800', 'gallery', 'Residential solar installation', 2, 'solar-residential.jpg', 'image/jpeg'),
(@campaign1_id, 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800', 'gallery', 'Solar panel manufacturing', 3, 'solar-manufacturing.jpg', 'image/jpeg'),
(@campaign1_id, 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800', 'gallery', 'Team installing solar panels', 4, 'solar-team.jpg', 'image/jpeg');

-- Add milestones for Campaign 1
INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, deliverables, timeline, success_metrics, status) VALUES
(@campaign1_id, 'Manufacturing Facility Setup', 'Establish local manufacturing facility and hire technical team', 15000000.00, 1, 'Fully equipped manufacturing facility, 50 trained technicians, Quality control systems in place', '3 months', 'Facility operational, Team hired and trained, First batch of 100 units produced', 'active'),
(@campaign1_id, 'Pilot Program Launch', 'Launch pilot program in 5 Lagos communities', 20000000.00, 2, '500 installations completed, Customer feedback collected, Mobile app launched', '6 months', '500 active customers, 90% customer satisfaction, App downloads: 1000+', 'pending'),
(@campaign1_id, 'Scale to 10,000 Installations', 'Expand operations across Lagos and Abuja', 15000000.00, 3, '10,000 installations, 5 service centers, 200 technicians', '12 months', '10,000 active customers, 95% uptime, Revenue: ₦500M', 'pending');

-- =============================================
-- CAMPAIGN 2: AgroConnect - Farm-to-Market Platform
-- =============================================
INSERT INTO campaigns (
  title,
  description,
  category,
  location,
  target_amount,
  current_amount,
  minimum_investment,
  maximum_investment,
  problem_statement,
  solution,
  business_plan,
  market_analysis,
  competitive_advantage,
  financial_projections,
  team_information,
  risks_and_challenges,
  main_image_url,
  status,
  is_featured,
  view_count,
  investor_count,
  start_date,
  end_date,
  duration_days,
  founder_id
) VALUES (
  'AgroConnect - Connecting Farmers Directly to Markets',
  'AgroConnect is a digital platform that connects smallholder farmers directly with buyers, eliminating middlemen and ensuring fair prices for farmers while providing fresh produce to urban consumers. We are building the future of agricultural commerce in Nigeria.',
  'Agriculture',
  'Abuja, Nigeria',
  35000000.00,
  8750000.00,
  25000.00,
  3000000.00,
  'Nigerian farmers lose 40-60% of their produce value to middlemen and post-harvest losses. Smallholder farmers lack access to markets, fair pricing, and logistics support. Urban consumers pay inflated prices for produce that often lacks freshness. The agricultural value chain is broken and inefficient.',
  'AgroConnect provides: 1) Mobile app connecting farmers directly to buyers (restaurants, retailers, consumers), 2) Real-time market pricing information, 3) Logistics network for efficient delivery, 4) Cold storage facilities to reduce post-harvest losses, 5) Agricultural financing and insurance options, 6) Training programs for farmers on best practices.',
  'Phase 1 (Months 1-4): Launch platform in FCT with 500 farmers and 100 buyers. Phase 2 (Months 5-8): Establish 3 collection centers and cold storage facilities. Phase 3 (Months 9-12): Expand to Kaduna and Kano states with 2,000 farmers. Phase 4 (Year 2): Scale to 10 states with 10,000 farmers and 1,000 buyers.',
  'Nigeria\'s agricultural market is worth $90 billion annually. There are 14 million smallholder farmers who could benefit from our platform. The food delivery and agri-tech market is growing at 25% annually. Key competitors include Farmcrowdy, ThriveAgric, and traditional market systems.',
  '1) Direct farmer-to-buyer model eliminates 3-4 middlemen, 2) Proprietary logistics network ensures 24-hour delivery, 3) Cold storage reduces losses by 70%, 4) Data analytics for demand forecasting, 5) Strong partnerships with state governments and agricultural cooperatives, 6) Team with deep agricultural and tech expertise.',
  'Year 1: Revenue ₦400M, 2,000 farmers onboarded, 5,000 tons of produce traded. Year 2: Revenue ₦1.8B, 10,000 farmers, 25,000 tons traded, Net profit ₦300M. Year 3: Revenue ₦5B, 30,000 farmers, 80,000 tons traded, Net profit ₦1B. Projected ROI: 40% annually over 3 years.',
  'CEO: Amina Bello - Agricultural economist, 12 years at FAO Nigeria. CTO: Emeka Okafor - Software engineer, former lead at Andela. COO: Yusuf Mohammed - 15 years in logistics and supply chain. Head of Farmer Relations: Grace Adeyemi - Agronomist with 10 years field experience.',
  'Key risks: 1) Farmer adoption challenges (Mitigation: Extensive training and support), 2) Logistics in rural areas (Mitigation: Partnership with local transporters), 3) Seasonal demand fluctuations (Mitigation: Diversified crop portfolio), 4) Competition from established players (Mitigation: Superior technology and farmer-first approach).',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  'approved',
  TRUE,
  890,
  32,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 75 DAY),
  90,
  @founder_id
);

SET @campaign2_id = LAST_INSERT_ID();

-- Add gallery images for Campaign 2
INSERT INTO campaign_images (campaign_id, image_url, image_type, caption, order_index, filename, mime_type) VALUES
(@campaign2_id, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 'banner', 'Fresh farm produce', 1, 'agro-banner.jpg', 'image/jpeg'),
(@campaign2_id, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', 'gallery', 'Farmers in the field', 2, 'agro-farmers.jpg', 'image/jpeg'),
(@campaign2_id, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800', 'gallery', 'Mobile app interface', 3, 'agro-app.jpg', 'image/jpeg'),
(@campaign2_id, 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800', 'gallery', 'Logistics and delivery', 4, 'agro-logistics.jpg', 'image/jpeg');

-- Add milestones for Campaign 2
INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, deliverables, timeline, success_metrics, status) VALUES
(@campaign2_id, 'Platform Launch & Farmer Onboarding', 'Launch mobile app and onboard first 500 farmers', 10000000.00, 1, 'Mobile app live, 500 farmers registered, 100 buyers onboarded, Training materials created', '4 months', '500 active farmers, 100 active buyers, 1000 transactions completed', 'active'),
(@campaign2_id, 'Collection Centers & Cold Storage', 'Establish 3 collection centers with cold storage', 15000000.00, 2, '3 collection centers operational, Cold storage capacity: 500 tons, Logistics fleet: 10 vehicles', '8 months', '3 centers operational, 70% reduction in post-harvest losses, 5000 tons stored', 'pending'),
(@campaign2_id, 'Multi-State Expansion', 'Expand to Kaduna and Kano states', 10000000.00, 3, '2,000 farmers onboarded, 5 new collection centers, State government partnerships', '12 months', '2,000 farmers in new states, 10,000 tons traded, Revenue: ₦400M', 'pending');

-- =============================================
-- CAMPAIGN 3: HealthTech Nigeria - Telemedicine Platform
-- =============================================
INSERT INTO campaigns (
  title,
  description,
  category,
  location,
  target_amount,
  current_amount,
  minimum_investment,
  maximum_investment,
  problem_statement,
  solution,
  business_plan,
  market_analysis,
  competitive_advantage,
  financial_projections,
  team_information,
  risks_and_challenges,
  main_image_url,
  status,
  is_featured,
  view_count,
  investor_count,
  start_date,
  end_date,
  duration_days,
  founder_id
) VALUES (
  'HealthTech Nigeria - Accessible Healthcare Through Telemedicine',
  'HealthTech Nigeria is democratizing healthcare access across Nigeria through our comprehensive telemedicine platform. We connect patients with qualified doctors via video consultations, provide prescription delivery, and maintain digital health records - all accessible from a smartphone.',
  'Healthcare',
  'Port Harcourt, Nigeria',
  45000000.00,
  18000000.00,
  50000.00,
  4000000.00,
  'Nigeria has only 4 doctors per 10,000 people, far below WHO recommendations. 70% of Nigerians live more than 5km from the nearest healthcare facility. Long wait times, high costs, and limited access to specialists create a healthcare crisis. Many treatable conditions go undiagnosed due to accessibility issues.',
  'HealthTech Nigeria offers: 1) 24/7 video consultations with licensed doctors, 2) AI-powered symptom checker and triage system, 3) E-prescription and medication delivery within 2 hours, 4) Digital health records accessible anytime, 5) Specialist referrals and appointment booking, 6) Health insurance integration, 7) Mental health support services.',
  'Phase 1 (Months 1-3): Launch platform with 50 doctors in Lagos and Port Harcourt. Phase 2 (Months 4-6): Expand to 200 doctors across 6 states, partner with 50 pharmacies. Phase 3 (Months 7-12): Add 500 doctors, integrate with 5 HMOs, launch corporate wellness programs. Phase 4 (Year 2): Scale to all 36 states with 2,000 doctors.',
  'Nigeria\'s healthcare market is valued at $12 billion. The telemedicine market is growing at 35% annually. Target market: 40 million smartphone users with health insurance or disposable income. Key competitors include Helium Health, mDoc, and traditional hospitals.',
  '1) Largest network of verified doctors in Nigeria, 2) AI-powered triage reduces wait times by 60%, 3) Integrated pharmacy network for fast delivery, 4) HIPAA-compliant data security, 5) Partnerships with major HMOs and corporate clients, 6) Multilingual support (English, Yoruba, Hausa, Igbo), 7) Affordable pricing: ₦2,000 per consultation.',
  'Year 1: Revenue ₦600M, 100,000 consultations, 200 doctors. Year 2: Revenue ₦2.5B, 500,000 consultations, 1,000 doctors, Net profit ₦500M. Year 3: Revenue ₦8B, 2 million consultations, 2,000 doctors, Net profit ₦2B. Projected ROI: 45% annually over 3 years.',
  'CEO: Dr. Oluwaseun Adebayo - Medical doctor, 10 years clinical experience, MBA from INSEAD. CTO: Tunde Bakare - Former engineering lead at Flutterwave. CMO: Dr. Ngozi Okonjo - Public health specialist, 8 years at WHO. COO: Aisha Yusuf - Healthcare operations expert, former COO at Hygeia HMO.',
  'Key risks: 1) Regulatory compliance (Mitigation: Legal team and MDCN approval), 2) Doctor recruitment and retention (Mitigation: Competitive compensation and flexible schedules), 3) Data security breaches (Mitigation: Bank-grade encryption and regular audits), 4) Patient trust in telemedicine (Mitigation: Education campaigns and quality assurance).',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
  'approved',
  TRUE,
  1580,
  67,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 45 DAY),
  90,
  @founder_id
);

SET @campaign3_id = LAST_INSERT_ID();

-- Add gallery images for Campaign 3
INSERT INTO campaign_images (campaign_id, image_url, image_type, caption, order_index, filename, mime_type) VALUES
(@campaign3_id, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', 'banner', 'Doctor consultation via telemedicine', 1, 'health-banner.jpg', 'image/jpeg'),
(@campaign3_id, 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800', 'gallery', 'Mobile app interface', 2, 'health-app.jpg', 'image/jpeg'),
(@campaign3_id, 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800', 'gallery', 'Healthcare professionals', 3, 'health-doctors.jpg', 'image/jpeg'),
(@campaign3_id, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800', 'gallery', 'Patient using telemedicine', 4, 'health-patient.jpg', 'image/jpeg');

-- Add milestones for Campaign 3
INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, deliverables, timeline, success_metrics, status) VALUES
(@campaign3_id, 'Platform Launch & Doctor Onboarding', 'Launch telemedicine platform with initial doctor network', 15000000.00, 1, 'Platform live, 50 doctors onboarded, MDCN approval obtained, 10 pharmacy partnerships', '3 months', '50 active doctors, 5,000 consultations, 90% patient satisfaction', 'active'),
(@campaign3_id, 'Multi-State Expansion & HMO Integration', 'Expand to 6 states and integrate with health insurance', 18000000.00, 2, '200 doctors across 6 states, 5 HMO partnerships, 50 pharmacy partners, Corporate wellness program', '6 months', '200 doctors, 50,000 consultations, 5 HMO integrations, 20 corporate clients', 'pending'),
(@campaign3_id, 'National Scale & Specialist Network', 'Scale to all states with specialist services', 12000000.00, 3, '2,000 doctors, Specialist network (cardiology, pediatrics, etc.), Mental health services, AI diagnostics', '12 months', '2,000 doctors, 500,000 consultations, Revenue: ₦600M', 'pending');

-- =============================================
-- ADD SOME SAMPLE INVESTMENTS
-- =============================================

-- Create sample investors
INSERT INTO users (email, password, fullName, userType, phoneNumber, isActive, isVerified, isEmailVerified)
VALUES 
('investor1@example.com', '$2b$10$YourHashedPasswordHere', 'Sarah Johnson', 'investor', '+2348098765432', TRUE, TRUE, TRUE),
('investor2@example.com', '$2b$10$YourHashedPasswordHere', 'Michael Chen', 'investor', '+2348087654321', TRUE, TRUE, TRUE),
('investor3@example.com', '$2b$10$YourHashedPasswordHere', 'Aisha Mohammed', 'investor', '+2348076543210', TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

-- Add sample investments for each campaign
INSERT INTO investments (campaign_id, investor_id, amount, payment_reference, payment_status, payment_method, payment_gateway, net_amount, investment_date, payment_confirmed_at)
SELECT 
  @campaign1_id,
  id,
  CASE 
    WHEN id % 3 = 0 THEN 500000.00
    WHEN id % 3 = 1 THEN 250000.00
    ELSE 100000.00
  END,
  CONCAT('INV-ECO-', LPAD(id, 6, '0')),
  'completed',
  'card',
  'paystack',
  CASE 
    WHEN id % 3 = 0 THEN 485000.00
    WHEN id % 3 = 1 THEN 242500.00
    ELSE 97000.00
  END,
  DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY),
  DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY)
FROM users 
WHERE userType = 'investor'
LIMIT 15;

INSERT INTO investments (campaign_id, investor_id, amount, payment_reference, payment_status, payment_method, payment_gateway, net_amount, investment_date, payment_confirmed_at)
SELECT 
  @campaign2_id,
  id,
  CASE 
    WHEN id % 3 = 0 THEN 300000.00
    WHEN id % 3 = 1 THEN 150000.00
    ELSE 75000.00
  END,
  CONCAT('INV-AGRO-', LPAD(id, 6, '0')),
  'completed',
  'card',
  'paystack',
  CASE 
    WHEN id % 3 = 0 THEN 291000.00
    WHEN id % 3 = 1 THEN 145500.00
    ELSE 72750.00
  END,
  DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 25) DAY),
  DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 25) DAY)
FROM users 
WHERE userType = 'investor'
LIMIT 12;

INSERT INTO investments (campaign_id, investor_id, amount, payment_reference, payment_status, payment_method, payment_gateway, net_amount, investment_date, payment_confirmed_at)
SELECT 
  @campaign3_id,
  id,
  CASE 
    WHEN id % 3 = 0 THEN 600000.00
    WHEN id % 3 = 1 THEN 350000.00
    ELSE 150000.00
  END,
  CONCAT('INV-HEALTH-', LPAD(id, 6, '0')),
  'completed',
  'card',
  'paystack',
  CASE 
    WHEN id % 3 = 0 THEN 582000.00
    WHEN id % 3 = 1 THEN 339500.00
    ELSE 145500.00
  END,
  DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 20) DAY),
  DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 20) DAY)
FROM users 
WHERE userType = 'investor'
LIMIT 20;

-- =============================================
-- UPDATE CAMPAIGN STATISTICS
-- =============================================

-- Update current amounts based on investments
UPDATE campaigns c
SET current_amount = (
  SELECT COALESCE(SUM(amount), 0)
  FROM investments i
  WHERE i.campaign_id = c.id AND i.payment_status = 'completed'
),
investor_count = (
  SELECT COUNT(DISTINCT investor_id)
  FROM investments i
  WHERE i.campaign_id = c.id AND i.payment_status = 'completed'
)
WHERE c.id IN (@campaign1_id, @campaign2_id, @campaign3_id);

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'Campaign Seed Data Summary' as Info;
SELECT 
  id,
  title,
  category,
  target_amount,
  current_amount,
  ROUND((current_amount / target_amount) * 100, 2) as progress_percentage,
  investor_count,
  status,
  is_featured
FROM campaigns
WHERE id IN (@campaign1_id, @campaign2_id, @campaign3_id);

SELECT 'Total Investments Created' as Info, COUNT(*) as count FROM investments WHERE campaign_id IN (@campaign1_id, @campaign2_id, @campaign3_id);
SELECT 'Total Campaign Images Created' as Info, COUNT(*) as count FROM campaign_images WHERE campaign_id IN (@campaign1_id, @campaign2_id, @campaign3_id);
SELECT 'Total Milestones Created' as Info, COUNT(*) as count FROM campaign_milestones WHERE campaign_id IN (@campaign1_id, @campaign2_id, @campaign3_id);
