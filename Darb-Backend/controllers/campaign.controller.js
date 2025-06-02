const db = require("../models");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CampaignStatsService = require('../services/campaignStatsService');

// Configure multer for campaign image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/campaigns/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'campaign-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ================= CAMPAIGN CRUD OPERATIONS =================

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    const founderId = req.userId;
    
    // ===================================
    // DEBUGGING: Add extensive logging
    // ===================================
    
    console.log('🔍 DEBUG: Campaign creation started');
    console.log('🔍 DEBUG: req.userId:', req.userId);
    console.log('🔍 DEBUG: founderId:', founderId);
    console.log('🔍 DEBUG: Request headers:', {
      authorization: req.headers.authorization,
      'x-access-token': req.headers['x-access-token']
    });
    
    // Verify the user from the database
    const [userCheck] = await db.sequelize.query(
      'SELECT id, email, fullName, userType FROM users WHERE id = ?',
      {
        replacements: [founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    console.log('🔍 DEBUG: User from database:', userCheck);
    
    if (!userCheck) {
      console.error('❌ DEBUG: User not found in database!');
      return res.status(404).send({
        success: false,
        message: 'User not found'
      });
    }
    
    if (userCheck.userType !== 'founder') {
      console.error('❌ DEBUG: User is not a founder:', userCheck.userType);
      return res.status(403).send({
        success: false,
        message: 'Only founders can create campaigns'
      });
    }
    
    console.log('✅ DEBUG: User verification passed');
    console.log('📝 DEBUG: Creating campaign with request body:', req.body);
    
    const {
      title,
      description,
      category,
      location,
      targetAmount,
      minimumInvestment,
      problemStatement,
      solution,
      businessPlan,
      videoUrl,
      isDraft
    } = req.body;

    // Validation for required fields (skip for drafts)
    if (!isDraft) {
      const requiredFields = ['title', 'description', 'category', 'location', 'targetAmount', 'minimumInvestment'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          console.log(`❌ DEBUG: Missing required field: ${field}`);
          return res.status(400).send({
            success: false,
            message: `${field} is required`
          });
        }
      }
    }

    // Determine status
    const status = isDraft ? 'draft' : 'submitted';
    const submittedAt = isDraft ? null : new Date();

    console.log(`💾 DEBUG: Saving campaign with status: ${status}`);
    console.log(`💾 DEBUG: Using founderId: ${founderId} for campaign creation`);

    // Create campaign with EXPLICIT founder_id logging
    const [result] = await db.sequelize.query(
      `INSERT INTO campaigns 
       (title, description, category, location, target_amount, minimum_investment, 
        problem_statement, solution, business_plan, video_url, founder_id, status, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          title || '',
          description || '',
          category || '',
          location || '',
          parseFloat(targetAmount) || 0,
          parseFloat(minimumInvestment) || 0,
          problemStatement || '',
          solution || '',
          businessPlan || '',
          videoUrl || '',
          founderId,
          status,
          submittedAt
        ],
        type: db.sequelize.QueryTypes.INSERT,
        logging: console.log
      }
    );

    const campaignId = result;
    console.log(`✅ DEBUG: Campaign created with ID: ${campaignId}`);
    
    // Immediately verify the campaign was created correctly
    const [verifyCreation] = await db.sequelize.query(
      `SELECT c.id, c.title, c.founder_id, c.status, u.fullName as founder_name, u.email as founder_email
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       WHERE c.id = ?`,
      {
        replacements: [campaignId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    console.log('🔍 DEBUG: Campaign verification after creation:', verifyCreation);
    
    if (verifyCreation.founder_id !== founderId) {
      console.error('❌ DEBUG: CRITICAL ERROR - founder_id mismatch!');
      console.error('Expected:', founderId);
      console.error('Actual:', verifyCreation.founder_id);
    }

    // Get the created campaign with founder details
    const [campaign] = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.email as founder_email
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       WHERE c.id = ?`,
      {
        replacements: [campaignId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log('📤 DEBUG: Sending response:', {
      campaignId: campaign.id,
      founderId: campaign.founder_id,
      founderName: campaign.founder_name,
      status: campaign.status
    });

    res.status(201).send({
      success: true,
      message: isDraft ? 'Campaign saved as draft' : 'Campaign submitted for approval',
      data: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        location: campaign.location,
        targetAmount: campaign.target_amount,
        minimumInvestment: campaign.minimum_investment,
        status: campaign.status,
        founderName: campaign.founder_name,
        founderId: campaign.founder_id,
        createdAt: campaign.created_at
      }
    });

  } catch (error) {
    console.error('❌ DEBUG: Create campaign error:', error);
    res.status(500).send({
      success: false,
      message: 'Error creating campaign',
      error: error.message
    });
  }
};

// Upload campaign image
const uploadCampaignImage = [
  upload.single('campaignImage'), // This expects 'campaignImage' field name
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const founderId = req.userId;
      
      console.log(`📸 Uploading image for campaign ${campaignId}`);
      console.log('📁 File received:', req.file);
      console.log('📝 Request body:', req.body);
      
      if (!req.file) {
        console.log('❌ No file in request');
        return res.status(400).send({
          success: false,
          message: 'No image file provided'
        });
      }

      // Verify campaign belongs to this founder OR allow if admin
      const [campaign] = await db.sequelize.query(
        'SELECT id, founder_id, status FROM campaigns WHERE id = ?',
        {
          replacements: [campaignId],
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!campaign) {
        console.log('❌ Campaign not found');
        return res.status(404).send({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Check ownership (founder can upload to their campaigns, admin can upload to any)
      const [user] = await db.sequelize.query(
        'SELECT userType FROM users WHERE id = ?',
        {
          replacements: [founderId],
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (campaign.founder_id !== founderId && user.userType !== 'admin') {
        console.log('❌ Unauthorized access');
        return res.status(403).send({
          success: false,
          message: 'Unauthorized to upload image for this campaign'
        });
      }

      const imageUrl = `/uploads/campaigns/${req.file.filename}`;
      console.log('🔗 Generated image URL:', imageUrl);

      // Update campaign with image URL
      await db.sequelize.query(
        'UPDATE campaigns SET main_image_url = ? WHERE id = ?',
        {
          replacements: [imageUrl, campaignId],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      console.log(`✅ Image uploaded successfully: ${imageUrl}`);

      res.status(200).send({
        success: true,
        message: 'Image uploaded successfully',
        data: { 
          imageUrl,
          campaignId: campaignId
        }
      });

    } catch (error) {
      console.error('❌ Upload campaign image error:', error);
      
      // Clean up uploaded file if there was an error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('🧹 Cleaned up uploaded file after error');
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      
      res.status(500).send({
        success: false,
        message: 'Error uploading image',
        error: error.message
      });
    }
  }
];

const createCampaignData = async (founderId, campaignData) => {
  const status = campaignData.isDraft ? 'draft' : 'submitted';
  const submittedAt = campaignData.isDraft ? null : new Date();

  const [result] = await db.sequelize.query(
    `INSERT INTO campaigns 
     (title, description, category, location, target_amount, minimum_investment, 
      problem_statement, solution, business_plan, video_url, founder_id, status, submitted_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    {
      replacements: [
        campaignData.title || '',
        campaignData.description || '',
        campaignData.category || '',
        campaignData.location || '',
        parseFloat(campaignData.targetAmount) || 0,
        parseFloat(campaignData.minimumInvestment) || 0,
        campaignData.problemStatement || '',
        campaignData.solution || '',
        campaignData.businessPlan || '',
        campaignData.videoUrl || '',
        founderId,
        status,
        submittedAt
      ],
      type: db.sequelize.QueryTypes.INSERT
    }
  );

  const campaignId = result;
  
  // Get the created campaign
  const [campaign] = await db.sequelize.query(
    `SELECT c.*, u.fullName as founder_name
     FROM campaigns c 
     JOIN users u ON c.founder_id = u.id 
     WHERE c.id = ?`,
    {
      replacements: [campaignId],
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    category: campaign.category,
    location: campaign.location,
    targetAmount: campaign.target_amount,
    minimumInvestment: campaign.minimum_investment,
    status: campaign.status,
    founderName: campaign.founder_name,
    createdAt: campaign.created_at
  };
};

const createCampaignWithImage = async (req, res) => {
  try {
    const founderId = req.userId;
    
    console.log('📝 Creating campaign with image');
    console.log('📁 Files received:', req.files);
    console.log('📝 Form data:', req.body);
    
    // First create the campaign
    const campaignData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      location: req.body.location,
      targetAmount: req.body.targetAmount,
      minimumInvestment: req.body.minimumInvestment,
      problemStatement: req.body.problemStatement,
      solution: req.body.solution,
      businessPlan: req.body.businessPlan,
      videoUrl: req.body.videoUrl,
      isDraft: req.body.isDraft === 'true'
    };

    // Create campaign first
    const campaign = await createCampaignData(founderId, campaignData);
    
    // If image was uploaded, save it
    if (req.files && req.files.campaignImage) {
      const imageFile = req.files.campaignImage[0];
      const imageUrl = `/uploads/campaigns/${imageFile.filename}`;
      
      await db.sequelize.query(
        'UPDATE campaigns SET main_image_url = ? WHERE id = ?',
        {
          replacements: [imageUrl, campaign.id],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );
      
      campaign.mainImageUrl = imageUrl;
    }

    res.status(201).send({
      success: true,
      message: campaignData.isDraft ? 'Campaign saved as draft' : 'Campaign submitted for approval',
      data: campaign
    });

  } catch (error) {
    console.error('❌ Create campaign with image error:', error);
    res.status(500).send({
      success: false,
      message: 'Error creating campaign',
      error: error.message
    });
  }
};

// Update campaign (founder only, draft campaigns only)
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const founderId = req.userId;
    const updateData = req.body;

    console.log(`📝 Updating campaign ${id} for founder ${founderId}`);
    console.log('📝 Update data:', updateData);

    // Verify campaign belongs to this founder
    const [campaign] = await db.sequelize.query(
      'SELECT id, status, founder_id FROM campaigns WHERE id = ? AND founder_id = ?',
      {
        replacements: [id, founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or unauthorized'
      });
    }

    // Only allow updates to draft and rejected campaigns
    if (!['draft', 'rejected'].includes(campaign.status)) {
      return res.status(400).send({
        success: false,
        message: 'Only draft and rejected campaigns can be updated'
      });
    }

    // Determine new status based on isDraft flag
    const newStatus = updateData.isDraft ? 'draft' : 'submitted';
    const submittedAt = updateData.isDraft ? null : new Date();

    // Build update query with proper field mapping
    const updates = [];
    const values = [];

    // Handle all possible fields
    const fieldMappings = {
      title: 'title',
      description: 'description', 
      category: 'category',
      location: 'location',
      targetAmount: 'target_amount',
      minimumInvestment: 'minimum_investment',
      problemStatement: 'problem_statement',
      solution: 'solution',
      businessPlan: 'business_plan',
      videoUrl: 'video_url'
    };

    // Add fields that have been provided
    Object.entries(fieldMappings).forEach(([frontendField, dbField]) => {
      if (updateData[frontendField] !== undefined) {
        updates.push(`${dbField} = ?`);
        
        // Handle numeric fields
        if (['targetAmount', 'minimumInvestment'].includes(frontendField)) {
          values.push(parseFloat(updateData[frontendField]) || 0);
        } else {
          values.push(updateData[frontendField] || '');
        }
      }
    });

    // Always update status and timestamps
    updates.push('status = ?');
    values.push(newStatus);
    
    if (submittedAt) {
      updates.push('submitted_at = ?');
      values.push(submittedAt);
    } else {
      updates.push('submitted_at = NULL');
    }

    // Clear admin review fields when resubmitting
    if (newStatus === 'submitted') {
      updates.push('reviewed_by = NULL');
      updates.push('admin_comments = NULL');
      updates.push('approved_at = NULL');
      updates.push('rejected_at = NULL');
    }

    // Add updated_at timestamp
    updates.push('updated_at = NOW()');

    // Add campaign ID for WHERE clause
    values.push(id);

    console.log('📝 SQL Updates:', updates.join(', '));
    console.log('📝 SQL Values:', values);

    // Execute update
    await db.sequelize.query(
      `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`,
      {
        replacements: values,
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // Get updated campaign with founder details
    const [updatedCampaign] = await db.sequelize.query(
      `SELECT * FROM campaign_details WHERE id = ?`,
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log('✅ Campaign updated successfully');

    res.status(200).send({
      success: true,
      message: newStatus === 'draft' ? 'Campaign saved as draft' : 'Campaign submitted for approval',
      data: {
        id: updatedCampaign.id,
        title: updatedCampaign.title,
        status: updatedCampaign.status,
        founderName: updatedCampaign.founder_name,
        updatedAt: updatedCampaign.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Update campaign error:', error);
    res.status(500).send({
      success: false,
      message: 'Error updating campaign',
      error: error.message
    });
  }
};

// Delete campaign (founder only, draft campaigns only)
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const founderId = req.userId;

    console.log(`🗑️ Deleting campaign ${id} for founder ${founderId}`);

    // Verify campaign belongs to this founder and is still a draft
    const [campaign] = await db.sequelize.query(
      'SELECT id, status, main_image_url FROM campaigns WHERE id = ? AND founder_id = ?',
      {
        replacements: [id, founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or unauthorized'
      });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).send({
        success: false,
        message: 'Only draft campaigns can be deleted'
      });
    }

    // Delete associated image file if it exists
    if (campaign.main_image_url) {
      const imagePath = path.join(__dirname, '..', campaign.main_image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete campaign (CASCADE will handle related records)
    await db.sequelize.query(
      'DELETE FROM campaigns WHERE id = ?',
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.DELETE
      }
    );

    console.log('✅ Campaign deleted successfully');

    res.status(200).send({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete campaign error:', error);
    res.status(500).send({
      success: false,
      message: 'Error deleting campaign',
      error: error.message
    });
  }
};

// ================= CAMPAIGN RETRIEVAL METHODS =================

// Get campaigns by founder (user's own campaigns)
const getMyCampaigns = async (req, res) => {
  try {
    const founderId = req.userId;
    
    console.log(`📋 Getting all campaigns for founder: ${founderId}`);
    
    const campaigns = await db.sequelize.query(
      `SELECT * FROM campaign_details WHERE founder_id = ? ORDER BY created_at DESC`,
      {
        replacements: [founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Separate campaigns by status for frontend
    const categorizedCampaigns = {
      drafts: campaigns.filter(c => c.status === 'draft'),
      submitted: campaigns.filter(c => c.status === 'submitted'),
      approved: campaigns.filter(c => c.status === 'approved'),
      rejected: campaigns.filter(c => c.status === 'rejected'),
      all: campaigns
    };

    console.log(`✅ Found campaigns:`, {
      total: campaigns.length,
      drafts: categorizedCampaigns.drafts.length,
      submitted: categorizedCampaigns.submitted.length,
      approved: categorizedCampaigns.approved.length,
      rejected: categorizedCampaigns.rejected.length
    });

    // Format for frontend WITH profile pictures
    const formatCampaign = (campaign) => {
      
      console.log(`Campaign ${campaign.id} - Founder: ${campaign.founder_name}, Profile: ${campaign.founder_avatar}`);

      return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      location: campaign.location,
      target_amount: campaign.target_amount,
      current_amount: campaign.current_amount,
      minimum_investment: campaign.minimum_investment,
      viewed_at: campaign.viewed_at,  
      status: campaign.status,
      main_image_url: campaign.main_image_url,
      view_count: campaign.view_count,
      favorite_count: campaign.favorite_count,
      is_featured: campaign.is_featured,
      founder_name: campaign.founder_name,
      founder_company: campaign.founder_company,
      founder_avatar: campaign.founder_avatar,
      founder_email: campaign.founder_email,
      created_at: campaign.created_at,
      submittedAt: campaign.submitted_at,
      approvedAt: campaign.approved_at,
      rejectedAt: campaign.rejected_at,
      adminComments: campaign.admin_comments
    };
  };

    const formattedResponse = {
      drafts: categorizedCampaigns.drafts.map(formatCampaign),
      submitted: categorizedCampaigns.submitted.map(formatCampaign),
      approved: categorizedCampaigns.approved.map(formatCampaign),
      rejected: categorizedCampaigns.rejected.map(formatCampaign),
      all: categorizedCampaigns.all.map(formatCampaign)
    };

    res.status(200).send({
      success: true,
      data: formattedResponse
    });

  } catch (error) {
    console.error('❌ Get my campaigns error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaigns',
      error: error.message
    });
  }
};

// Get all approved campaigns (for dashboard)
const getAllCampaigns = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 12, featured } = req.query;
    
    console.log('🔍 Getting all campaigns with filters:', { category, status, search, featured });
    
    let whereClause = "WHERE status = 'approved'";
    let replacements = [];
    
    if (category && category !== 'All Categories') {
      whereClause += " AND category = ?";
      replacements.push(category);
    }
    
    if (featured === 'true') {
      whereClause += " AND is_featured = TRUE";
    }
    
    if (search) {
      whereClause += " AND (title LIKE ? OR c.description LIKE ?)";
      replacements.push(`%${search}%`, `%${search}%`);
    }
    
    const offset = (page - 1) * limit;
    
    const campaigns = await db.sequelize.query(
      `SELECT * FROM campaign_details 
       ${whereClause}
       ORDER BY is_featured DESC, created_at DESC 
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log(`✅ Found ${campaigns.length} approved campaigns`);

    const formattedCampaigns = campaigns.map(campaign => {
      console.log(`Campaign ${campaign.id} - Founder: ${campaign.founder_name}, Profile: ${campaign.founder_avatar}`);

      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        location: campaign.location,
        target_amount: campaign.target_amount,
        current_amount: campaign.current_amount,
        minimum_investment: campaign.minimum_investment,
        main_image_url: campaign.main_image_url,
        view_count: campaign.view_count,
        favorite_count: campaign.favorite_count,
        is_featured: campaign.is_featured,
        founder_name: campaign.founder_name,
        founder_company: campaign.founder_company,
        founder_avatar: campaign.founder_avatar,
        founder_email: campaign.founder_email,
        created_at: campaign.created_at
      };
    });

    res.status(200).send({
      success: true,
      data: formattedCampaigns
    });

  } catch (error) {
    console.error('❌ Get all campaigns error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaigns',
      error: error.message
    });
  }
};

// Get campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || null;
    const ipAddress = req.ip;

    console.log(`👀 Getting campaign ${id} for user ${userId || 'anonymous'}`);

    // Get campaign details using the view
    const [campaign] = await db.sequelize.query(
      `SELECT * FROM campaign_details WHERE id = ?`,
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user can edit this campaign
    const canEdit = userId && 
                   userId === campaign.founder_id && 
                   ['draft', 'rejected'].includes(campaign.status);

    // Check if user has favorited this campaign
    let isFavorited = false;
    if (userId) {
      const [favorite] = await db.sequelize.query(
        'SELECT id FROM campaign_favorites WHERE campaign_id = ? AND user_id = ?',
        {
          replacements: [id, userId],
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      isFavorited = !!favorite;
    }

    // Track view automatically (only for approved campaigns or owner viewing their own)
    if (campaign.status === 'approved' || userId === campaign.founder_id) {
      try {
        if (userId) {
          // For logged-in users, prevent duplicate views on same day
          await db.sequelize.query(
            `INSERT INTO campaign_views (campaign_id, user_id, ip_address) 
             SELECT ?, ?, ? 
             WHERE NOT EXISTS (
               SELECT 1 FROM campaign_views 
               WHERE campaign_id = ? AND user_id = ? 
               AND DATE(viewed_at) = CURDATE()
             )`,
            {
              replacements: [id, userId, ipAddress, id, userId],
              type: db.sequelize.QueryTypes.INSERT
            }
          );
        } else {
          // For anonymous users, prevent duplicate views from same IP within 1 hour
          await db.sequelize.query(
            `INSERT INTO campaign_views (campaign_id, ip_address) 
             SELECT ?, ? 
             WHERE NOT EXISTS (
               SELECT 1 FROM campaign_views 
               WHERE campaign_id = ? AND ip_address = ? 
               AND viewed_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
             )`,
            {
              replacements: [id, ipAddress, id, ipAddress],
              type: db.sequelize.QueryTypes.INSERT
            }
          );
        }

        // Update view count
        await CampaignStatsService.updateViewCount(id);
      } catch (viewError) {
        console.error('Error tracking view:', viewError);
      }
    }

    // Format for frontend with all needed information
    const formattedCampaign = {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      location: campaign.location,
      targetAmount: campaign.target_amount,
      currentAmount: campaign.current_amount,
      minimumInvestment: campaign.minimum_investment,
      problemStatement: campaign.problem_statement,
      solution: campaign.solution,
      businessPlan: campaign.business_plan,
      videoUrl: campaign.video_url,
      mainImageUrl: campaign.main_image_url,
      status: campaign.status,
      isFeatured: campaign.is_featured,
      viewCount: campaign.view_count,
      favoriteCount: campaign.favorite_count,
      investorCount: campaign.investor_count,
      canEdit: canEdit,
      isFavorited: isFavorited, // Add this for the frontend
      adminComments: campaign.admin_comments,
      creator: {
        id: campaign.founder_id,
        name: campaign.founder_name,
        company: campaign.founder_company,
        email: campaign.founder_email,
        avatar: campaign.founder_avatar
      },
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      submittedAt: campaign.submitted_at,
      approvedAt: campaign.approved_at,
      rejectedAt: campaign.rejected_at
    };

    res.status(200).send({
      success: true,
      data: formattedCampaign
    });

  } catch (error) {
    console.error('❌ Get campaign by ID error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaign',
      error: error.message
    });
  }
};

const getRelatedCampaigns = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;

    console.log(`🔗 Getting related campaigns for campaign ${id}`);

    // First get the current campaign's category
    const [currentCampaign] = await db.sequelize.query(
      'SELECT category FROM campaigns WHERE id = ?',
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!currentCampaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Get related campaigns from same category
    const relatedCampaigns = await db.sequelize.query(
      `SELECT * FROM campaign_details 
       WHERE status = 'approved' 
       AND category = ? 
       AND id != ?
       ORDER BY view_count DESC, created_at DESC
       LIMIT ?`,
      {
        replacements: [currentCampaign.category, id, parseInt(limit)],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Format campaigns
    const formattedCampaigns = relatedCampaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      location: campaign.location,
      target_amount: campaign.target_amount,
      current_amount: campaign.current_amount,
      minimum_investment: campaign.minimum_investment,
      main_image_url: campaign.main_image_url,
      view_count: campaign.view_count,
      favorite_count: campaign.favorite_count,
      is_featured: campaign.is_featured,
      founder_name: campaign.founder_name,
      founder_company: campaign.founder_company,
      founder_avatar: campaign.founder_avatar,
      created_at: campaign.created_at
    }));

    res.status(200).send({
      success: true,
      data: formattedCampaigns
    });

  } catch (error) {
    console.error('❌ Get related campaigns error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching related campaigns',
      error: error.message
    });
  }
};

const getCampaignForEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const founderId = req.userId;

    console.log(`✏️ Getting campaign ${id} for editing by founder ${founderId}`);

    // Get campaign details with ownership verification
    const [campaign] = await db.sequelize.query(
      `SELECT * FROM campaign_details WHERE id = ? AND founder_id = ?`,
      {
        replacements: [id, founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or you do not have permission to edit it'
      });
    }

    // Check if campaign can be edited
    if (!['draft', 'rejected'].includes(campaign.status)) {
      return res.status(400).send({
        success: false,
        message: 'Only draft and rejected campaigns can be edited',
        allowedStatuses: ['draft', 'rejected'],
        currentStatus: campaign.status
      });
    }

    // Format for editing (include all fields)
    const editableCampaign = {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      location: campaign.location,
      targetAmount: campaign.target_amount,
      minimumInvestment: campaign.minimum_investment,
      problemStatement: campaign.problem_statement,
      solution: campaign.solution,
      businessPlan: campaign.business_plan,
      videoUrl: campaign.video_url,
      mainImageUrl: campaign.main_image_url,
      status: campaign.status,
      adminComments: campaign.admin_comments,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      submittedAt: campaign.submitted_at,
      rejectedAt: campaign.rejected_at
    };

    res.status(200).send({
      success: true,
      data: editableCampaign
    });

  } catch (error) {
    console.error('❌ Get campaign for edit error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaign for editing',
      error: error.message
    });
  }
};

const getCampaignAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const founderId = req.userId;

    console.log(`📊 Getting analytics for campaign ${id}`);

    // Verify ownership
    const [campaign] = await db.sequelize.query(
      'SELECT founder_id FROM campaigns WHERE id = ?',
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign || campaign.founder_id !== founderId) {
      return res.status(403).send({
        success: false,
        message: 'Access denied - you can only view analytics for your own campaigns'
      });
    }

    // Get view analytics
    const viewAnalytics = await db.sequelize.query(
      `SELECT 
         DATE(viewed_at) as date,
         COUNT(*) as views
       FROM campaign_views 
       WHERE campaign_id = ? 
       AND viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(viewed_at)
       ORDER BY date DESC`,
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get favorite analytics
    const favoriteAnalytics = await db.sequelize.query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as favorites
       FROM campaign_favorites 
       WHERE campaign_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get overall stats
    const [overallStats] = await db.sequelize.query(
      `SELECT 
         view_count,
         favorite_count,
         current_amount,
         target_amount,
         (current_amount / target_amount * 100) as funding_percentage
       FROM campaigns 
       WHERE id = ?`,
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      data: {
        overall: overallStats || {},
        viewsOverTime: viewAnalytics,
        favoritesOverTime: favoriteAnalytics
      }
    });

  } catch (error) {
    console.error('❌ Get campaign analytics error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaign analytics',
      error: error.message
    });
  }
};

// Get featured campaigns
const getFeaturedCampaigns = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    console.log(`⭐ Getting ${limit} featured campaigns`);
    
    // FIXED: Use campaign_details view
    const campaigns = await db.sequelize.query(
      `SELECT * FROM campaign_details
       WHERE status = 'approved' AND is_featured = true
       ORDER BY view_count DESC, created_at DESC
       LIMIT ?`,
      {
        replacements: [parseInt(limit)],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log(`✅ Found ${campaigns.length} featured campaigns`);

    // FIXED: Format with correct profile pictures
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      location: campaign.location,
      target_amount: campaign.target_amount,
      current_amount: campaign.current_amount,
      minimum_investment: campaign.minimum_investment,
      main_image_url: campaign.main_image_url,
      view_count: campaign.view_count,
      favorite_count: campaign.favorite_count,
      is_featured: campaign.is_featured,
      founder_name: campaign.founder_name,
      founder_company: campaign.founder_company,
      founder_avatar: campaign.founder_avatar,
      founder_email: campaign.founder_email,
      created_at: campaign.created_at
    }));

    res.status(200).send({
      success: true,
      data: formattedCampaigns
    });

  } catch (error) {
    console.error('❌ Get featured campaigns error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching featured campaigns',
      error: error.message
    });
  }
};

// ================= USER INTERACTION METHODS =================

// Get user's viewed campaigns
const getViewedCampaigns = async (req, res) => {
  try {
    const userId = req.userId;
    
    console.log(`👀 Getting viewed campaigns for user: ${userId}`);
    
    // FIXED: Use campaign_details view and proper JOIN
    const viewedCampaigns = await db.sequelize.query(
      `SELECT cd.*, MAX(cv.viewed_at) as viewed_at
       FROM campaign_details cd
       JOIN campaign_views cv ON cd.id = cv.campaign_id
       WHERE cv.user_id = ? AND cd.status = 'approved'
       GROUP BY cd.id
       ORDER BY MAX(cv.viewed_at) DESC
       LIMIT 50`,
      {
        replacements: [userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log(`✅ Found ${viewedCampaigns.length} unique viewed campaigns`);

    // FIXED: Format with correct profile pictures
    const formattedCampaigns = viewedCampaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      location: campaign.location,
      target_amount: campaign.target_amount,
      current_amount: campaign.current_amount,
      minimum_investment: campaign.minimum_investment,
      main_image_url: campaign.main_image_url,
      view_count: campaign.view_count,
      favorite_count: campaign.favorite_count,
      is_featured: campaign.is_featured,
      founder_name: campaign.founder_name,
      founder_company: campaign.founder_company,
      founder_avatar: campaign.founder_avatar,
      founder_email: campaign.founder_email,
      created_at: campaign.created_at,
      viewed_at: campaign.viewed_at
    }));

    res.status(200).send({
      success: true,
      data: formattedCampaigns
    });

  } catch (error) {
    console.error('❌ Get viewed campaigns error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching viewed campaigns',
      error: error.message
    });
  }
};

// Get user's favorite campaigns
const getFavoriteCampaigns = async (req, res) => {
  try {
    const userId = req.userId;
    
    console.log(`❤️ Getting favorite campaigns for user: ${userId}`);
    
    // Use campaign_details view
    const favoriteCampaigns = await db.sequelize.query(
      `SELECT cd.*, cf.created_at as favorited_at
       FROM campaign_details cd
       JOIN campaign_favorites cf ON cd.id = cf.campaign_id
       WHERE cf.user_id = ? AND cd.status = 'approved'
       ORDER BY cf.created_at DESC`,
      {
        replacements: [userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log(`✅ Found ${favoriteCampaigns.length} unique favorite campaigns`);

    // FIXED: Format with correct profile pictures
    const formattedCampaigns = favoriteCampaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      location: campaign.location,
      target_amount: campaign.target_amount,
      current_amount: campaign.current_amount,
      minimum_investment: campaign.minimum_investment,
      main_image_url: campaign.main_image_url,
      view_count: campaign.view_count,
      favorite_count: campaign.favorite_count,
      is_featured: campaign.is_featured,
      founder_name: campaign.founder_name,
      founder_company: campaign.founder_company,
      founder_avatar: campaign.founder_avatar,
      founder_email: campaign.founder_email,
      created_at: campaign.created_at,
      favorited_at: campaign.favorited_at
    }));

    res.status(200).send({
      success: true,
      data: formattedCampaigns
    });

  } catch (error) {
    console.error('❌ Get favorite campaigns error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching favorite campaigns',
      error: error.message
    });
  }
};

// Get funded campaigns (for investors)
const getFundedCampaigns = async (req, res) => {
  try {
    const userId = req.userId;
    
    console.log(`💰 Getting funded campaigns for investor: ${userId}`);
    
    // Placeholder - returns empty array until payment system is implemented
    res.status(200).send({
      success: true,
      data: [],
      message: "Investments tracking will be implemented when payment system is ready"
    });

  } catch (error) {
    console.error('❌ Get funded campaigns error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching funded campaigns',
      error: error.message
    });
  }
};

// Toggle favorite campaign
const toggleFavorite = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.userId;
    
    console.log(`💖 Toggling favorite for campaign ${campaignId}, user ${userId}`);

    // Verify campaign exists
    const [campaign] = await db.sequelize.query(
      'SELECT id, title FROM campaigns WHERE id = ?',
      {
        replacements: [campaignId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!campaign) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if already favorited
    const [existingFavorite] = await db.sequelize.query(
      'SELECT id FROM campaign_favorites WHERE campaign_id = ? AND user_id = ?',
      {
        replacements: [campaignId, userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    let isFavorited;
    let message;

    if (existingFavorite) {
      // Remove from favorites
      await db.sequelize.query(
        'DELETE FROM campaign_favorites WHERE campaign_id = ? AND user_id = ?',
        {
          replacements: [campaignId, userId],
          type: db.sequelize.QueryTypes.DELETE
        }
      );
      isFavorited = false;
      message = 'Campaign removed from favorites';
      console.log(`❌ Removed from favorites`);
    } else {
      // Add to favorites
      await db.sequelize.query(
        'INSERT INTO campaign_favorites (campaign_id, user_id) VALUES (?, ?)',
        {
          replacements: [campaignId, userId],
          type: db.sequelize.QueryTypes.INSERT
        }
      );
      isFavorited = true;
      message = 'Campaign added to favorites';
      console.log(`✅ Added to favorites`);
    }

    // Update favorite count manually
    await CampaignStatsService.updateFavoriteCount(campaignId);

    // Get updated favorite count
    const [updatedCampaign] = await db.sequelize.query(
      'SELECT favorite_count FROM campaigns WHERE id = ?',
      {
        replacements: [campaignId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      message: message,
      data: { 
        isFavorited,
        favoriteCount: updatedCampaign.favorite_count
      }
    });

  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    res.status(500).send({
      success: false,
      message: 'Error toggling favorite',
      error: error.message
    });
  }
};

// Track campaign view
const trackCampaignView = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.userId || null;
    const ipAddress = req.ip;
    
    console.log(`👁️ Tracking view for campaign ${campaignId}, user ${userId || 'anonymous'}`);

    // Insert view record (with duplicate prevention)
    try {
      if (userId) {
        // For logged-in users, prevent duplicate views on same day
        await db.sequelize.query(
          `INSERT INTO campaign_views (campaign_id, user_id, ip_address) 
           SELECT ?, ?, ? 
           WHERE NOT EXISTS (
             SELECT 1 FROM campaign_views 
             WHERE campaign_id = ? AND user_id = ? 
             AND DATE(viewed_at) = CURDATE()
           )`,
          {
            replacements: [campaignId, userId, ipAddress, campaignId, userId],
            type: db.sequelize.QueryTypes.INSERT
          }
        );
      } else {
        // For anonymous users, prevent duplicate views from same IP within 1 hour
        await db.sequelize.query(
          `INSERT INTO campaign_views (campaign_id, ip_address) 
           SELECT ?, ? 
           WHERE NOT EXISTS (
             SELECT 1 FROM campaign_views 
             WHERE campaign_id = ? AND ip_address = ? 
             AND viewed_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
           )`,
          {
            replacements: [campaignId, ipAddress, campaignId, ipAddress],
            type: db.sequelize.QueryTypes.INSERT
          }
        );
      }

      // Update view count manually
      await CampaignStatsService.updateViewCount(campaignId);

    } catch (viewError) {
      console.error('Error tracking view:', viewError);
      // Don't fail the request if view tracking fails
    }

    res.status(200).send({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('❌ Track view error:', error);
    res.status(500).send({
      success: false,
      message: 'Error tracking view',
      error: error.message
    });
  }
};

const getCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await CampaignStatsService.getCampaignStats(id);
    
    if (!stats) {
      return res.status(404).send({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.status(200).send({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Get campaign stats error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaign statistics',
      error: error.message
    });
  }
};

// NEW: Admin endpoint to recalculate all stats
const recalculateAllStats = async (req, res) => {
  try {
    console.log('🔄 Admin requested stats recalculation');
    
    const result = await CampaignStatsService.recalculateAllCampaignStats();
    
    res.status(200).send({
      success: true,
      message: `Successfully recalculated statistics for ${result.campaignsUpdated} campaigns`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error recalculating stats:', error);
    res.status(500).send({
      success: false,
      message: 'Error recalculating campaign statistics',
      error: error.message
    });
  }
};

// ================= EXPORTS =================

module.exports = {
  // CRUD Operations
  createCampaign,
  uploadCampaignImage,
  updateCampaign,
  deleteCampaign,
  
  // Campaign Retrieval
  getMyCampaigns,
  getAllCampaigns,
  getCampaignById,
  getFeaturedCampaigns,
  
  // User Interactions
  getViewedCampaigns,
  getFavoriteCampaigns,
  getFundedCampaigns,
  toggleFavorite,
  getRelatedCampaigns,
  getCampaignAnalytics,
  trackCampaignView,
  getCampaignStats,
  recalculateAllStats,
  getCampaignForEdit
};