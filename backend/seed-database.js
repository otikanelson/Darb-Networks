/**
 * Comprehensive Database Seeding Script
 * 
 * This script populates the database with realistic test data including:
 * - Users (5-8 with varied roles)
 * - Campaigns (40 with diverse characteristics)
 * - Campaign images and videos
 * - Milestones (2-4 per campaign)
 * - Collaborators (1-4 per campaign)
 * - Investments (for funded campaigns)
 * 
 * The script is idempotent and can be run multiple times safely.
 * 
 * Usage: node seed-database.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Import utility modules
const { randomElement, randomInt, randomFloat, randomDate, randomBoolean } = require('./utils/random-helpers');
const { generateBusinessPlan, generateDescription, generateProblemStatement, generateSolution } = require('./utils/content-generators');

// =============================================
// CONSTANTS AND DATA
// =============================================

const NIGERIAN_FIRST_NAMES = [
  'Chioma', 'Adeyemi', 'Zainab', 'Emeka', 'Fatima', 'Oluwaseun', 'Amara', 'Chukwu',
  'Aisha', 'Tunde', 'Ngozi', 'Kunle', 'Nneka', 'Segun', 'Hauwa', 'Ikechukwu',
  'Blessing', 'Jamal', 'Folake', 'Babajide', 'Ife', 'Nonso', 'Zara', 'Adebayo',
  'Chidinma', 'Okafor', 'Leila', 'Taiwo', 'Ama', 'Chidi', 'Kemi', 'Bola'
];

const NIGERIAN_LAST_NAMES = [
  'Okonkwo', 'Adeyemi', 'Hassan', 'Okafor', 'Bello', 'Nwosu', 'Eze', 'Oluwaseun',
  'Ibrahim', 'Adekunle', 'Nkosi', 'Obi', 'Abubakar', 'Eze', 'Mensah', 'Okafor',
  'Adebayo', 'Oladele', 'Aminu', 'Okonkwo', 'Adeola', 'Nwankwo', 'Okafor', 'Balogun'
];

const COMPANY_NAMES = [
  'TechVenture', 'GreenFarm', 'HealthPlus', 'EduSmart', 'FashionHub', 'LogisticsPro',
  'FinanceFlow', 'BuildCorp', 'EnergyNext', 'AgriTech', 'MediCare', 'LearnHub'
];

const STOCK_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
];

const CAMPAIGN_CATEGORIES = [
  'Clean Energy', 'Agriculture', 'Healthcare', 'Education', 'Technology',
  'Fashion', 'Real Estate', 'Logistics', 'Fintech', 'Manufacturing'
];

const CAMPAIGN_TITLES = [
  'SolarHub - Distributed Solar Energy Platform',
  'AgroConnect - Smart Farming Solutions',
  'MediCare Plus - Telemedicine Network',
  'EduTech Academy - Online Learning Platform',
  'CloudSync - Enterprise Cloud Storage',
  'FashionAI - AI-Powered Fashion Marketplace',
  'PropTech Solutions - Real Estate Analytics',
  'LogisticsPro - Supply Chain Optimization',
  'PayFlow - Fintech Payment Gateway',
  'ManufactureTech - IoT Manufacturing Hub',
  'GreenEnergy Co - Renewable Energy Investment',
  'FarmersMarket - Direct-to-Consumer Agriculture',
  'HealthHub - Community Health Centers',
  'SkillUp - Professional Development Platform',
  'DataVault - Secure Data Management',
  'StyleHub - Fashion Designer Collective',
  'SmartCity - Urban Development Platform',
  'CargoTrack - Real-Time Logistics Tracking',
  'FinanceFlow - Personal Finance Management',
  'BuildSmart - Construction Tech Platform',
  'EcoWave - Ocean Energy Solutions',
  'NutriTech - Agricultural Nutrition Analytics',
  'WellnessHub - Mental Health Support Platform'
];

const NIGERIAN_CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Benin City',
  'Kaduna', 'Katsina', 'Bauchi', 'Ilorin', 'Oshogbo', 'Akure', 'Calabar'
];

const PROFESSIONAL_ROLES = [
  'CEO', 'CTO', 'CFO', 'COO', 'Marketing Director', 'Technical Lead',
  'Product Manager', 'Operations Manager', 'Finance Manager', 'Lead Developer'
];

const BIO_TEMPLATES = [
  'Passionate entrepreneur with {years} years of experience in {industry}. Committed to innovation and sustainable growth.',
  'Dedicated professional focused on {industry}. Experienced in building scalable solutions and leading teams.',
  'Visionary leader in {industry} with a track record of successful ventures. Driven by impact and excellence.',
  'Strategic thinker with expertise in {industry}. Passionate about creating value and driving positive change.',
  'Innovative entrepreneur in {industry} space. Focused on solving real-world problems through technology.',
  'Results-driven professional with {years} years in {industry}. Committed to building sustainable businesses.'
];

const PAYMENT_GATEWAYS = ['paystack', 'flutterwave', 'bank_transfer'];

// =============================================
// TASK 2: DATABASE CONNECTION MODULE
// =============================================

/**
 * Connect to the database using environment variables
 * @returns {Promise<mysql.Connection>} Database connection object
 * @throws {Error} If connection fails or required environment variables are missing
 */
async function connectToDatabase() {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const sslEnabled = process.env.DB_SSL === 'true';

  if (!host || !user || !password || !database) {
    throw new Error('Missing required database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
  }

  const config = {
    host,
    port,
    user,
    password,
    database,
  };

  if (sslEnabled) {
    config.ssl = {
      rejectUnauthorized: false,
    };
  }

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection established successfully');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

// =============================================
// TASK 3: CLEANUP MODULE
// =============================================

/**
 * Clean up existing campaign data
 * @param {mysql.Connection} connection - Database connection object
 * @returns {Promise<Object>} Statistics about deleted records
 */
async function cleanupExistingData(connection) {
  console.log('🧹 Cleaning up existing campaign data...');
  
  try {
    await connection.beginTransaction();
    
    const [campaignsBefore] = await connection.query('SELECT COUNT(*) as count FROM campaigns');
    const [imagesBefore] = await connection.query('SELECT COUNT(*) as count FROM campaign_images');
    const [milestonesBefore] = await connection.query('SELECT COUNT(*) as count FROM campaign_milestones');
    const [collaboratorsBefore] = await connection.query('SELECT COUNT(*) as count FROM campaign_collaborators');
    const [investmentsBefore] = await connection.query('SELECT COUNT(*) as count FROM investments');
    
    await connection.query('DELETE FROM campaigns');
    await connection.commit();
    
    const cleanupStats = {
      campaignsDeleted: campaignsBefore[0].count,
      imagesDeleted: imagesBefore[0].count,
      milestonesDeleted: milestonesBefore[0].count,
      collaboratorsDeleted: collaboratorsBefore[0].count,
      investmentsDeleted: investmentsBefore[0].count,
    };
    
    console.log('✅ Cleanup completed successfully');
    console.log(`   - Campaigns deleted: ${cleanupStats.campaignsDeleted}`);
    console.log(`   - Campaign images deleted: ${cleanupStats.imagesDeleted}`);
    console.log(`   - Campaign milestones deleted: ${cleanupStats.milestonesDeleted}`);
    console.log(`   - Campaign collaborators deleted: ${cleanupStats.collaboratorsDeleted}`);
    console.log(`   - Investments deleted: ${cleanupStats.investmentsDeleted}\n`);
    
    return cleanupStats;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error during cleanup:', error.message);
    throw error;
  }
}

// =============================================
// TASK 4: RANDOM HELPERS AND CONTENT GENERATORS
// =============================================

/**
 * Generate a stock image URL based on category
 * @param {string} category - Campaign category
 * @param {number} index - Index for variety
 * @returns {string} Stock image URL
 */
function generateStockImageUrl(category, index) {
  const categoryImages = {
    'Clean Energy': 'photo-1509391366360-2e938aa1ef14',
    'Agriculture': 'photo-1574943320219-553eb213f72d',
    'Healthcare': 'photo-1576091160550-2173dba999ef',
    'Education': 'photo-1427504494785-cdedca239470',
    'Technology': 'photo-1519389950473-47ba0277781c',
    'Fashion': 'photo-1558618666-fcd25c85cd64',
    'Real Estate': 'photo-1560518883-ce09059eeffa',
    'Logistics': 'photo-1578574494267-b8d1d0f0eff3',
    'Fintech': 'photo-1454165804606-c3d57bc86b40',
    'Manufacturing': 'photo-1581092918056-0c4c3acd3789'
  };

  const imageId = categoryImages[category] || 'photo-1507003211169-0a1dd7228f2d';
  return `https://images.unsplash.com/${imageId}?w=800&h=600&fit=crop`;
}

/**
 * Generate a video URL
 * @param {number} index - Index for variety
 * @returns {string} Video URL
 */
function generateVideoUrl(index) {
  const videoIds = [
    'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'oHg5SJYRHA0',
    'kJQP7kiw9Ls', 'L0MK7qz13bU', 'aqz-KE-bpKQ', 'xfr64zoBTAQ'
  ];
  return `https://www.youtube.com/watch?v=${videoIds[index % videoIds.length]}`;
}

// =============================================
// TASK 5: USER GENERATOR MODULE
// =============================================

/**
 * Generate a single user with realistic data
 * @param {string} userType - The user type: 'admin', 'founder', or 'investor'
 * @param {number} index - Index for uniqueness
 * @returns {Object} User data object
 */
function generateUser(userType, index) {
  const firstName = randomElement(NIGERIAN_FIRST_NAMES);
  const lastName = randomElement(NIGERIAN_LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
  const password = 'SeedPassword123!';
  
  const industries = ['technology', 'agriculture', 'healthcare', 'finance', 'energy', 'education'];
  const industry = randomElement(industries);
  const years = randomInt(3, 15);
  const bioTemplate = randomElement(BIO_TEMPLATES);
  let bio = bioTemplate
    .replace('{industry}', industry)
    .replace('{years}', years.toString());
  
  if (bio.length < 100) {
    bio = bio + ' ' + randomElement(BIO_TEMPLATES).substring(0, 100 - bio.length);
  }
  bio = bio.substring(0, 300);
  
  const profileImageUrl = STOCK_IMAGE_URLS[index % STOCK_IMAGE_URLS.length];
  const companyName = userType === 'founder' ? randomElement(COMPANY_NAMES) : null;
  const phoneNumber = `+234${randomInt(700, 999)}${randomInt(1000000, 9999999)}`;
  
  return {
    email,
    password,
    fullName,
    userType,
    companyName,
    phoneNumber,
    profileImageUrl,
    bio,
    isActive: true,
    isVerified: true
  };
}

/**
 * Create users with varied roles
 * @param {mysql.Connection} connection - Database connection object
 * @returns {Promise<Array>} Array of created user records
 */
async function createUsers(connection) {
  console.log('👥 Creating users...');
  
  try {
    const userCount = randomInt(5, 8);
    const roles = ['admin', 'founder', 'founder', 'investor', 'investor'];
    
    while (roles.length < userCount) {
      roles.push(randomElement(['founder', 'investor']));
    }
    
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    
    await connection.beginTransaction();
    
    const createdUsers = [];
    
    for (let i = 0; i < userCount; i++) {
      const userData = generateUser(roles[i], i);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [result] = await connection.query(
        `INSERT INTO users (email, password, fullName, userType, companyName, phoneNumber, profileImageUrl, bio, isActive, isVerified, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userData.email,
          hashedPassword,
          userData.fullName,
          userData.userType,
          userData.companyName,
          userData.phoneNumber,
          userData.profileImageUrl,
          userData.bio,
          userData.isActive ? 1 : 0,
          userData.isVerified ? 1 : 0
        ]
      );
      
      createdUsers.push({
        id: result.insertId,
        email: userData.email,
        fullName: userData.fullName,
        userType: userData.userType,
        profileImageUrl: userData.profileImageUrl,
        bio: userData.bio
      });
      
      console.log(`   ✓ Created ${userData.userType}: ${userData.email}`);
    }
    
    await connection.commit();
    console.log(`✅ Created ${userCount} users successfully\n`);
    
    return createdUsers;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating users:', error.message);
    throw error;
  }
}

// =============================================
// TASK 7: CAMPAIGN GENERATOR MODULE
// =============================================

/**
 * Generate a single campaign with realistic data
 * @param {Object} founder - Founder user object
 * @param {number} index - Index for uniqueness
 * @param {Object} options - Campaign generation options
 * @returns {Object} Campaign data object
 */
function generateCampaign(founder, index, options = {}) {
  const title = CAMPAIGN_TITLES[index % CAMPAIGN_TITLES.length];
  const description = generateDescription(200, 1000);
  const category = CAMPAIGN_CATEGORIES[index % CAMPAIGN_CATEGORIES.length];
  const location = randomElement(NIGERIAN_CITIES);
  const targetAmount = randomInt(5000000, 100000000);
  const minimumInvestment = randomInt(50000, 500000);
  const maximumInvestment = Math.floor(targetAmount * 0.1);
  
  const problemStatement = generateProblemStatement(300, 800);
  const solution = generateSolution(300, 800);
  const businessPlan = generateBusinessPlan(500);
  
  const mainImageUrl = generateStockImageUrl(category, index);
  
  // Determine status and featured status
  let status = 'approved';
  let isFeatured = false;
  
  if (options.draftCount !== undefined && options.draftCount > 0) {
    status = 'draft';
    options.draftCount--;
  } else if (options.completedCount !== undefined && options.completedCount > 0) {
    status = 'completed';
    options.completedCount--;
  }
  
  if (options.featuredCount !== undefined && options.featuredCount > 0) {
    isFeatured = true;
    options.featuredCount--;
  }
  
  // Calculate dates
  const startDate = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
  const endDate = new Date(startDate.getTime() + randomInt(30, 180) * 24 * 60 * 60 * 1000);
  
  // Calculate progress level and current amount
  const progressLevel = randomFloat(0, 1.5);
  const currentAmount = targetAmount * progressLevel;
  
  // Set investor count proportional to progress
  const investorCount = Math.max(1, Math.floor(progressLevel * 50));
  
  // Add random view count (100 to 50000 views)
  const views = randomInt(100, 50000);
  
  return {
    title,
    description,
    category,
    location,
    target_amount: targetAmount,
    current_amount: currentAmount,
    minimum_investment: minimumInvestment,
    maximum_investment: maximumInvestment,
    problem_statement: problemStatement,
    solution,
    business_plan: businessPlan,
    main_image_url: mainImageUrl,
    video_url: randomBoolean(0.25) ? generateVideoUrl(index) : null,
    status,
    is_featured: isFeatured,
    investor_count: investorCount,
    start_date: startDate,
    end_date: endDate,
    founder_id: founder.id,
    progressLevel,
    views
  };
}

/**
 * Create campaigns with varied characteristics
 * @param {mysql.Connection} connection - Database connection object
 * @param {Array} founders - Array of founder users
 * @returns {Promise<Array>} Array of created campaigns
 */
async function createCampaigns(connection, founders) {
  console.log('📢 Creating campaigns...');
  
  try {
    const campaigns = [];
    let draftCount = randomInt(2, 3);
    let completedCount = randomInt(1, 2);
    let featuredCount = randomInt(3, 5);
    let longBusinessPlanCount = 5;
    
    // Generate 20 campaigns
    for (let i = 0; i < 20; i++) {
      const founder = randomElement(founders);
      const campaign = generateCampaign(founder, i, {
        draftCount: draftCount > 0 ? draftCount-- : 0,
        completedCount: completedCount > 0 ? completedCount-- : 0,
        featuredCount: featuredCount > 0 ? featuredCount-- : 0
      });
      
      // Ensure at least 5 campaigns have long business plans
      if (longBusinessPlanCount > 0 && campaign.business_plan.length < 1000) {
        campaign.business_plan = generateBusinessPlan(1000);
        longBusinessPlanCount--;
      }
      
      campaigns.push(campaign);
    }
    
    // Insert campaigns in batches
    await connection.beginTransaction();
    
    for (let i = 0; i < campaigns.length; i += 10) {
      const batch = campaigns.slice(i, i + 10);
      
      for (const campaign of batch) {
        const [result] = await connection.query(
          `INSERT INTO campaigns (title, description, category, location, target_amount, current_amount, minimum_investment, maximum_investment, problem_statement, solution, business_plan, main_image_url, video_url, status, is_featured, investor_count, start_date, end_date, founder_id, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            campaign.title,
            campaign.description,
            campaign.category,
            campaign.location,
            campaign.target_amount,
            campaign.current_amount,
            campaign.minimum_investment,
            campaign.maximum_investment,
            campaign.problem_statement,
            campaign.solution,
            campaign.business_plan,
            campaign.main_image_url,
            campaign.video_url,
            campaign.status,
            campaign.is_featured ? 1 : 0,
            campaign.investor_count,
            campaign.start_date,
            campaign.end_date,
            campaign.founder_id
          ]
        );
        
        campaign.id = result.insertId;
      }
    }
    
    await connection.commit();
    console.log(`✅ Created 20 campaigns successfully\n`);
    
    return campaigns;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating campaigns:', error.message);
    throw error;
  }
}

// =============================================
// TASK 9: MEDIA GENERATOR MODULE
// =============================================

/**
 * Create campaign images
 * @param {mysql.Connection} connection - Database connection object
 * @param {Array} campaigns - Array of campaigns
 * @returns {Promise<number>} Number of images created
 */
async function createCampaignImages(connection, campaigns) {
  console.log('🖼️  Creating campaign images...');
  
  try {
    let imageCount = 0;
    let videoCount = 0;
    
    // Process all campaigns in a single transaction with reduced image count
    await connection.beginTransaction();
    
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      
      // Create only 2-3 images per campaign instead of 2-5 to speed up
      const imageCount_per_campaign = randomInt(2, 3);
      
      for (let j = 0; j < imageCount_per_campaign; j++) {
        const imageUrl = generateStockImageUrl(campaign.category, j);
        const imageType = randomElement(['gallery', 'thumbnail', 'banner']);
        
        await connection.query(
          `INSERT INTO campaign_images (campaign_id, image_url, image_type, order_index, filename, createdAt)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            campaign.id,
            imageUrl,
            imageType,
            j,
            `image-${campaign.id}-${j}.jpg`
          ]
        );
        
        imageCount++;
      }
      
      // Add video URL to at least 10 campaigns
      if (videoCount < 10 && randomBoolean(0.3)) {
        await connection.query(
          `UPDATE campaigns SET video_url = ? WHERE id = ?`,
          [generateVideoUrl(campaign.id), campaign.id]
        );
        videoCount++;
      }
      
      // Log progress every 10 campaigns
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ Processed ${i + 1} campaigns...`);
      }
    }
    
    await connection.commit();
    console.log(`✅ Created ${imageCount} campaign images and ${videoCount} video URLs\n`);
    
    return imageCount;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (e) {
      // Connection might already be closed
    }
    console.error('❌ Error creating campaign images:', error.message);
    throw error;
  }
}

// =============================================
// TASK 11: MILESTONE GENERATOR MODULE
// =============================================

/**
 * Generate a single milestone
 * @param {Object} campaign - Campaign object
 * @param {number} index - Milestone index
 * @param {number} totalMilestones - Total milestones for this campaign
 * @returns {Object} Milestone data object
 */
function generateMilestone(campaign, index, totalMilestones) {
  const title = `Milestone ${index + 1}: ${randomElement(['Launch', 'Scale', 'Expand', 'Optimize', 'Integrate'])} Phase`;
  const description = generateDescription(200, 500);
  const targetAmount = Math.floor(campaign.target_amount / totalMilestones * randomFloat(0.8, 1.2));
  const deliverables = randomElement([
    'Product launch, 1000 users, 5 partnerships',
    'Infrastructure setup, 100 employees, 3 offices',
    'Market expansion, 10000 customers, 5 cities',
    'Technology upgrade, 50 features, 99.9% uptime'
  ]);
  const timeline = randomElement(['3 months', '6 months', '9 months', '12 months', 'Q1 2024', 'Q2 2024', 'Q3 2024']);
  const successMetrics = randomElement([
    'Revenue: ₦50M, Users: 5000, NPS: 50',
    'Customers: 1000, Retention: 80%, Revenue: ₦30M',
    'Market share: 15%, Growth: 40%, Profitability: 20%',
    'Partnerships: 10, Revenue: ₦100M, Users: 50000'
  ]);
  
  const status = randomElement(['pending', 'active', 'completed', 'failed']);
  const targetDate = new Date(Date.now() + randomInt(30, 365) * 24 * 60 * 60 * 1000);
  const imageUrl = randomBoolean(0.5) ? generateStockImageUrl(campaign.category, index) : null;
  
  return {
    campaign_id: campaign.id,
    title,
    description,
    target_amount: targetAmount,
    current_amount: 0,
    deliverables,
    timeline,
    success_metrics: successMetrics,
    status,
    order_index: index + 1,
    target_date: targetDate,
    image_url: imageUrl
  };
}

/**
 * Create milestones for campaigns
 * @param {mysql.Connection} connection - Database connection object
 * @param {Array} campaigns - Array of campaigns
 * @returns {Promise<number>} Number of milestones created
 */
async function createMilestones(connection, campaigns) {
  console.log('🎯 Creating milestones...');
  
  try {
    let milestoneCount = 0;
    
    // Process all campaigns in a single transaction
    await connection.beginTransaction();
    
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      // Reduce to 2 milestones per campaign instead of 2-4
      const milestonesPerCampaign = 2;
      
      for (let j = 0; j < milestonesPerCampaign; j++) {
        const milestone = generateMilestone(campaign, j, milestonesPerCampaign);
        
        await connection.query(
          `INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, current_amount, deliverables, timeline, success_metrics, status, order_index, target_date, image_url, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            milestone.campaign_id,
            milestone.title,
            milestone.description,
            milestone.target_amount,
            milestone.current_amount,
            milestone.deliverables,
            milestone.timeline,
            milestone.success_metrics,
            milestone.status,
            milestone.order_index,
            milestone.target_date,
            milestone.image_url
          ]
        );
        
        milestoneCount++;
      }
      
      // Log progress every 10 campaigns
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ Processed ${i + 1} campaigns...`);
      }
    }
    
    await connection.commit();
    console.log(`✅ Created ${milestoneCount} milestones successfully\n`);
    
    return milestoneCount;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (e) {
      // Connection might already be closed
    }
    console.error('❌ Error creating milestones:', error.message);
    throw error;
  }
}

// =============================================
// TASK 12: COLLABORATOR GENERATOR MODULE
// =============================================

/**
 * Generate a single collaborator
 * @param {Object} campaign - Campaign object
 * @param {number} index - Collaborator index
 * @param {Object} user - Optional user to link
 * @returns {Object} Collaborator data object
 */
function generateCollaborator(campaign, index, user = null) {
  let name, profileImageUrl, description, email, phoneNumber;
  
  if (user) {
    name = user.fullName;
    profileImageUrl = user.profileImageUrl;
    description = user.bio;
    email = user.email;
    phoneNumber = user.phoneNumber;
  } else {
    const firstName = randomElement(NIGERIAN_FIRST_NAMES);
    const lastName = randomElement(NIGERIAN_LAST_NAMES);
    name = `${firstName} ${lastName}`;
    profileImageUrl = randomElement(STOCK_IMAGE_URLS);
    description = generateDescription(150, 400);
    email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    phoneNumber = `+234${randomInt(700, 999)}${randomInt(1000000, 9999999)}`;
  }
  
  const role = randomElement(PROFESSIONAL_ROLES);
  
  return {
    campaign_id: campaign.id,
    name,
    role,
    description,
    email,
    phoneNumber,
    profile_image_url: profileImageUrl,
    linkedin_url: null,
    order_index: index + 1
  };
}

/**
 * Create collaborators for campaigns
 * @param {mysql.Connection} connection - Database connection object
 * @param {Array} campaigns - Array of campaigns
 * @param {Array} users - Array of users
 * @returns {Promise<number>} Number of collaborators created
 */
async function createCollaborators(connection, campaigns, users) {
  console.log('👥 Creating collaborators...');
  
  try {
    let collaboratorCount = 0;
    let userLinkedCount = 0;
    let campaignsWithUserCollaborators = 0;
    
    // Process all campaigns in a single transaction
    await connection.beginTransaction();
    
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      // Reduce to 1-2 collaborators per campaign instead of 1-4
      const collaboratorsPerCampaign = randomInt(1, 2);
      
      for (let j = 0; j < collaboratorsPerCampaign; j++) {
        let user = null;
        
        // Link some collaborators to existing users (at least 10 campaigns)
        if (campaignsWithUserCollaborators < 10 && j === 0 && randomBoolean(0.5)) {
          user = randomElement(users);
          userLinkedCount++;
          if (j === 0) campaignsWithUserCollaborators++;
        }
        
        const collaborator = generateCollaborator(campaign, j, user);
        
        await connection.query(
          `INSERT INTO campaign_collaborators (campaign_id, name, role, description, email, phoneNumber, profile_image_url, linkedin_url, order_index, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            collaborator.campaign_id,
            collaborator.name,
            collaborator.role,
            collaborator.description,
            collaborator.email,
            collaborator.phoneNumber,
            collaborator.profile_image_url,
            collaborator.linkedin_url,
            collaborator.order_index
          ]
        );
        
        collaboratorCount++;
      }
      
      // Log progress every 10 campaigns
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ Processed ${i + 1} campaigns...`);
      }
    }
    
    await connection.commit();
    console.log(`✅ Created ${collaboratorCount} collaborators (${userLinkedCount} linked to users)\n`);
    
    return collaboratorCount;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (e) {
      // Connection might already be closed
    }
    console.error('❌ Error creating collaborators:', error.message);
    throw error;
  }
}

// =============================================
// TASK 13: INVESTMENT GENERATOR MODULE
// =============================================

/**
 * Generate investments for a campaign
 * @param {Object} campaign - Campaign object
 * @param {Array} investors - Array of investor users
 * @returns {Array} Array of investment data objects
 */
function generateInvestments(campaign, investors) {
  const investments = [];
  
  if (campaign.current_amount <= 0) {
    return investments;
  }
  
  let remainingAmount = campaign.current_amount;
  const investorCount = Math.max(1, Math.floor(campaign.current_amount / campaign.minimum_investment));
  
  for (let i = 0; i < investorCount && remainingAmount > 0; i++) {
    const investor = randomElement(investors);
    
    // Ensure min is less than max
    const minAmount = Math.min(campaign.minimum_investment, remainingAmount);
    const maxAmount = Math.min(campaign.maximum_investment, remainingAmount);
    const actualMax = Math.max(minAmount, maxAmount);
    
    const amount = Math.min(
      remainingAmount,
      randomInt(minAmount, actualMax)
    );
    
    const platformFee = amount * 0.025;
    const netAmount = amount - platformFee;
    const paymentReference = `SEED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const investmentDate = randomDate(campaign.start_date, new Date());
    
    investments.push({
      campaign_id: campaign.id,
      investor_id: investor.id,
      amount,
      investment_type: 'campaign',
      payment_reference: paymentReference,
      payment_status: 'completed',
      payment_gateway: randomElement(PAYMENT_GATEWAYS),
      transaction_fee: 0,
      platform_fee: platformFee,
      net_amount: netAmount,
      investment_date: investmentDate,
      payment_confirmed_at: investmentDate
    });
    
    remainingAmount -= amount;
  }
  
  return investments;
}

/**
 * Create investments for campaigns
 * @param {mysql.Connection} connection - Database connection object
 * @param {Array} campaigns - Array of campaigns
 * @param {Array} investors - Array of investor users
 * @returns {Promise<number>} Number of investments created
 */
async function createInvestments(connection, campaigns, investors) {
  console.log('💰 Creating investments...');
  
  try {
    let investmentCount = 0;
    let totalInvestmentAmount = 0;
    
    // Process all campaigns in a single transaction
    await connection.beginTransaction();
    
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      const investments = generateInvestments(campaign, investors);
      
      for (const investment of investments) {
        await connection.query(
          `INSERT INTO investments (campaign_id, investor_id, amount, investment_type, payment_reference, payment_status, payment_gateway, transaction_fee, platform_fee, net_amount, investment_date, payment_confirmed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            investment.campaign_id,
            investment.investor_id,
            investment.amount,
            investment.investment_type,
            investment.payment_reference,
            investment.payment_status,
            investment.payment_gateway,
            investment.transaction_fee,
            investment.platform_fee,
            investment.net_amount,
            investment.investment_date,
            investment.payment_confirmed_at
          ]
        );
        
        investmentCount++;
        totalInvestmentAmount += investment.amount;
      }
      
      // Log progress every 10 campaigns
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ Processed ${i + 1} campaigns...`);
      }
    }
    
    await connection.commit();
    console.log(`✅ Created ${investmentCount} investments (Total: ₦${totalInvestmentAmount.toLocaleString()})\n`);
    
    return { investmentCount, totalInvestmentAmount };
  } catch (error) {
    try {
      await connection.rollback();
    } catch (e) {
      // Connection might already be closed
    }
    console.error('❌ Error creating investments:', error.message);
    throw error;
  }
}

// =============================================
// TASK 14: LOGGING AND SUMMARY MODULE
// =============================================

/**
 * Display seeding summary
 * @param {Object} summary - Summary statistics
 */
function displaySummary(summary) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DATABASE SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n✅ Seeding completed successfully!\n`);
  console.log(`Users Created:              ${summary.usersCreated}`);
  console.log(`Campaigns Created:          ${summary.campaignsCreated}`);
  console.log(`  - Featured:               ${summary.featuredCampaigns}`);
  console.log(`  - Drafts:                 ${summary.draftCampaigns}`);
  console.log(`  - Completed:              ${summary.completedCampaigns}`);
  console.log(`Campaign Images Created:    ${summary.imagesCreated}`);
  console.log(`Milestones Created:         ${summary.milestonesCreated}`);
  console.log(`Collaborators Created:      ${summary.collaboratorsCreated}`);
  console.log(`Investments Created:        ${summary.investmentsCreated}`);
  console.log(`Total Investment Amount:    ₦${summary.totalInvestmentAmount.toLocaleString()}`);
  console.log(`\nExecution Time:             ${summary.executionTime.toFixed(2)} seconds`);
  console.log('='.repeat(60) + '\n');
}

// =============================================
// TASK 15: MAIN ORCHESTRATOR AND ERROR HANDLING
// =============================================

/**
 * Main seeding function
 * Orchestrates all phases of the seeding process
 */
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
  
  const startTime = Date.now();
  let connection;
  
  try {
    // Connect to database
    connection = await connectToDatabase();
    
    // Cleanup existing data
    await cleanupExistingData(connection);
    
    // Create users
    const users = await createUsers(connection);
    const founders = users.filter(u => u.userType === 'founder');
    const investors = users.filter(u => u.userType === 'investor');
    
    // Create campaigns
    const campaigns = await createCampaigns(connection, founders);
    
    // Create campaign images
    const imagesCreated = await createCampaignImages(connection, campaigns);
    
    // Create milestones
    const milestonesCreated = await createMilestones(connection, campaigns);
    
    // Create collaborators
    const collaboratorsCreated = await createCollaborators(connection, campaigns, users);
    
    // Create investments
    const investmentStats = await createInvestments(connection, campaigns, investors);
    
    // Calculate summary statistics
    const featuredCampaigns = campaigns.filter(c => c.is_featured).length;
    const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
    
    const executionTime = (Date.now() - startTime) / 1000;
    
    const summary = {
      usersCreated: users.length,
      campaignsCreated: campaigns.length,
      featuredCampaigns,
      draftCampaigns,
      completedCampaigns,
      imagesCreated,
      milestonesCreated,
      collaboratorsCreated,
      investmentsCreated: investmentStats.investmentCount,
      totalInvestmentAmount: investmentStats.totalInvestmentAmount,
      executionTime
    };
    
    displaySummary(summary);
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during database seeding:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  connectToDatabase,
  cleanupExistingData,
  createUsers,
  createCampaigns,
  createCampaignImages,
  createMilestones,
  createCollaborators,
  createInvestments,
  generateUser,
  generateCampaign,
  generateMilestone,
  generateCollaborator,
  generateStockImageUrl,
  generateVideoUrl
};
