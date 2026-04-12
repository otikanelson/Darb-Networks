const db = require("../models");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const CampaignStatsService = require('../services/campaignStatsService');

// Helper to build image URLs
const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // If it's a Cloudinary URL path, return as is
  if (url.includes('cloudinary')) return url;
  // Otherwise, assume it's a local path
  return url.startsWith('/') ? url : `/${url}`;
};

// Cloudinary config (same as user controller)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage — no disk writes (required for Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
});

// ================= CAMPAIGN CRUD OPERATIONS =================

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    console.log('🆕 ===== CREATE CAMPAIGN START =====');
    const founderId = req.userId;
    console.log('👤 Founder ID:', founderId);
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    
    // Verify the user from the database
    const [userCheck] = await db.sequelize.query(
      'SELECT id, email, fullName, userType FROM users WHERE id = ?',
      {
        replacements: [founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    console.log('🔍 User check:', userCheck ? 'FOUND' : 'NOT FOUND');
    if (userCheck) {
      console.log('  - User type:', userCheck.userType);
      console.log('  - User name:', userCheck.fullName);
    }
    
    if (!userCheck) {
      console.log('❌ User not found');
      return res.status(404).send({
        success: false,
        message: 'User not found'
      });
    }
    
    if (userCheck.userType !== 'founder') {
      console.log('❌ User is not a founder');
      return res.status(403).send({
        success: false,
        message: 'Only founders can create campaigns'
      });
    }
    
    const {
      title,
      description,
      category,
      location,
      targetAmount,
      minimumInvestment,
      maximumInvestment,
      problemStatement,
      solution,
      businessPlan,
      marketAnalysis,
      competitiveAdvantage,
      financialProjections,
      teamInformation,
      risksAndChallenges,
      videoUrl,
      endDate,
      durationDays,
      isDraft
    } = req.body;

    console.log('🎯 isDraft:', isDraft, '(type:', typeof isDraft, ')');

    // Validation for required fields (skip for drafts)
    if (!isDraft) {
      console.log('✅ Validating required fields (not a draft)');
      const requiredFields = ['title', 'description', 'category', 'location', 'targetAmount', 'minimumInvestment'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          console.log(`❌ Missing required field: ${field}`);
          return res.status(400).send({
            success: false,
            message: `${field} is required`
          });
        }
      }
    } else {
      console.log('⏭️ Skipping validation (draft mode)');
    }

    // Determine status
    const isDraftBool = isDraft === true || isDraft === 'true';
    const status = isDraftBool ? 'draft' : 'submitted';
    const submittedAt = isDraftBool ? null : new Date();
    
    console.log('📊 Campaign status:', status);
    console.log('📅 Submitted at:', submittedAt);

    // Prepare values for insertion
    const values = [
      title || '',
      description || '',
      category || '',
      location || '',
      parseFloat(targetAmount) || 0,
      parseFloat(String(minimumInvestment || '').replace(/,/g, '')) || 0,
      maximumInvestment ? parseFloat(String(maximumInvestment).replace(/,/g, '')) : null,
      problemStatement || '',
      solution || '',
      businessPlan || '',
      marketAnalysis || '',
      competitiveAdvantage || '',
      financialProjections || '',
      teamInformation || '',
      risksAndChallenges || '',
      videoUrl || '',
      endDate || null,
      durationDays ? parseInt(durationDays) : 90,
      founderId,
      status,
      submittedAt
    ];

    console.log('📝 SQL Values:', JSON.stringify(values, null, 2));

    // Create campaign
    console.log('⚙️ Executing INSERT query...');
    const [result] = await db.sequelize.query(
      `INSERT INTO campaigns 
       (title, description, category, location, target_amount, minimum_investment, maximum_investment,
        problem_statement, solution, business_plan, market_analysis, competitive_advantage,
        financial_projections, team_information, risks_and_challenges,
        video_url, end_date, duration_days, founder_id, status, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: values,
        type: db.sequelize.QueryTypes.INSERT,
      }
    );

    const campaignId = result;
    console.log('✅ Campaign created with ID:', campaignId);
    
    // Immediately verify the campaign was created correctly
    console.log('🔍 Verifying campaign creation...');
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
    
    console.log('✅ Campaign verified:', verifyCreation ? 'YES' : 'NO');
    
    if (verifyCreation && verifyCreation.founder_id !== founderId) {
      console.log('⚠️ Warning: Founder ID mismatch!');
    }

    // Get the created campaign with founder details
    console.log('📊 Fetching campaign details...');
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

    // Save milestones if provided
    if (Array.isArray(req.body.milestones) && req.body.milestones.length > 0) {
      console.log('🎯 Processing milestones:', req.body.milestones.length, 'items');
      try {
        for (let i = 0; i < req.body.milestones.length; i++) {
          const m = req.body.milestones[i];
          if (!m.title?.trim()) continue;
          await db.sequelize.query(
            `INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, target_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                campaignId, m.title.trim(), m.description?.trim() || '',
                parseFloat(String(m.amount || 0).replace(/,/g, '')) || 0,
                i, m.targetDate || null,
              ],
              type: db.sequelize.QueryTypes.INSERT,
            }
          );
        }
        console.log('✅ Milestones saved');
      } catch (err) { 
        console.log('⚠️ Milestone save failed:', err.message);
      }
    }

    console.log('✅ Campaign creation successful!');
    console.log('📤 Sending response...');
    
    res.status(201).send({
      success: true,
      message: isDraftBool ? 'Campaign saved as draft' : 'Campaign submitted for approval',
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

    console.log('🆕 ===== CREATE CAMPAIGN END =====');

  } catch (error) {
    console.error('❌ ===== CREATE CAMPAIGN ERROR =====');
    console.error('❌ Error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ ===================================');
    
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
      const { isGallery } = req.query; // Check if this is a gallery image
      
      if (!req.file) {
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
        return res.status(403).send({
          success: false,
          message: 'Unauthorized to upload image for this campaign'
        });
      }

      // Upload buffer to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'darb/campaigns', resource_type: 'image' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        stream.end(req.file.buffer);
      });
      const imageUrl = uploadResult.secure_url;

      if (isGallery === 'true') {
        // Save to campaign_images table for gallery
        try {
          // Get the current max order_index
          const [maxOrder] = await db.sequelize.query(
            'SELECT COALESCE(MAX(order_index), -1) as max_order FROM campaign_images WHERE campaign_id = ?',
            {
              replacements: [campaignId],
              type: db.sequelize.QueryTypes.SELECT
            }
          );
          
          const orderIndex = (maxOrder?.max_order ?? -1) + 1;
          
          await db.sequelize.query(
            `INSERT INTO campaign_images (campaign_id, image_url, image_type, filename, order_index)
             VALUES (?, ?, 'gallery', ?, ?)`,
            {
              replacements: [campaignId, imageUrl, req.file.originalname, orderIndex],
              type: db.sequelize.QueryTypes.INSERT
            }
          );
        } catch (err) {
          console.error('Error saving to campaign_images:', err);
          // Continue anyway - image is uploaded to Cloudinary
        }
      } else {
        // Update main campaign image
        await db.sequelize.query(
          'UPDATE campaigns SET main_image_url = ? WHERE id = ?',
          {
            replacements: [imageUrl, campaignId],
            type: db.sequelize.QueryTypes.UPDATE
          }
        );
      }

      res.status(200).send({
        success: true,
        message: 'Image uploaded successfully',
        data: { 
          imageUrl,
          campaignId: campaignId,
          isGallery: isGallery === 'true'
        }
      });

    } catch (error) {
      
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
    console.log('🔄 ===== UPDATE CAMPAIGN START =====');
    const { id } = req.params;
    const founderId = req.userId;
    const updateData = req.body;

    console.log('📝 Campaign ID:', id);
    console.log('👤 Founder ID:', founderId);
    console.log('📦 Update Data:', JSON.stringify(updateData, null, 2));

    // Verify campaign belongs to this founder
    const [campaign] = await db.sequelize.query(
      'SELECT id, status, founder_id FROM campaigns WHERE id = ? AND founder_id = ?',
      {
        replacements: [id, founderId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log('🔍 Campaign found:', campaign ? 'YES' : 'NO');
    if (campaign) {
      console.log('📊 Campaign status:', campaign.status);
      console.log('👥 Campaign founder_id:', campaign.founder_id);
    }

    if (!campaign) {
      console.log('❌ Campaign not found or unauthorized');
      return res.status(404).send({
        success: false,
        message: 'Campaign not found or unauthorized'
      });
    }

    // Only allow updates to draft and rejected campaigns
    if (!['draft', 'rejected'].includes(campaign.status)) {
      console.log('❌ Invalid status for update:', campaign.status);
      return res.status(400).send({
        success: false,
        message: 'Only draft and rejected campaigns can be updated'
      });
    }

    // Determine new status based on isDraft flag (handles both boolean and string)
    const isDraftBool = updateData.isDraft === true || updateData.isDraft === 'true';
    const newStatus = isDraftBool ? 'draft' : 'submitted';
    const submittedAt = isDraftBool ? null : new Date();

    console.log('🎯 isDraft value:', updateData.isDraft, '(type:', typeof updateData.isDraft, ')');
    console.log('🎯 isDraftBool:', isDraftBool);
    console.log('🎯 New status:', newStatus);
    console.log('🎯 Submitted at:', submittedAt);

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
      maximumInvestment: 'maximum_investment',
      problemStatement: 'problem_statement',
      solution: 'solution',
      businessPlan: 'business_plan',
      marketAnalysis: 'market_analysis',
      competitiveAdvantage: 'competitive_advantage',
      financialProjections: 'financial_projections',
      teamInformation: 'team_information',
      risksAndChallenges: 'risks_and_challenges',
      videoUrl: 'video_url',
      endDate: 'end_date',
      durationDays: 'duration_days',
    };

    // Add fields that have been provided
    const numericFields = ['targetAmount', 'minimumInvestment', 'maximumInvestment', 'durationDays'];
    const nullableDateFields = ['endDate'];

    Object.entries(fieldMappings).forEach(([frontendField, dbField]) => {
      if (updateData[frontendField] === undefined) return;

      let shouldSkip = false;
      let skipReason = '';

      // For drafts, skip empty or zero values to avoid database constraints
      if (isDraftBool) {
        const value = updateData[frontendField];
        
        // Skip numeric fields that are 0, null, or empty
        if (numericFields.includes(frontendField)) {
          const parsed = parseFloat(String(value || '').replace(/,/g, ''));
          if (!parsed || parsed === 0 || isNaN(parsed)) {
            shouldSkip = true;
            skipReason = `numeric value: ${parsed}`;
          }
        }
        
        // Skip text fields that are empty strings
        if (!shouldSkip && !numericFields.includes(frontendField) && !nullableDateFields.includes(frontendField)) {
          if (value === '' || value === null) {
            shouldSkip = true;
            skipReason = 'empty text';
          }
        }
        
        // Skip date fields that are null or empty
        if (!shouldSkip && nullableDateFields.includes(frontendField)) {
          if (!value || value === '') {
            shouldSkip = true;
            skipReason = 'no date';
          }
        }
      }

      if (shouldSkip) {
        console.log(`⏭️ Skipping ${frontendField} for draft (${skipReason})`);
        return;
      }

      // Add to updates and values
      updates.push(`${dbField} = ?`);

      if (numericFields.includes(frontendField)) {
        const parsed = parseFloat(String(updateData[frontendField] || '').replace(/,/g, ''));
        values.push(isNaN(parsed) ? null : parsed);
      } else if (nullableDateFields.includes(frontendField)) {
        values.push(updateData[frontendField] || null);
      } else {
        values.push(updateData[frontendField] ?? '');
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

    // Add updatedAt timestamp (using camelCase as per schema)
    updates.push('updatedAt = NOW()');

    // Add campaign ID for WHERE clause
    values.push(id);

    const sql = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`;
    // Validate placeholder count matches values count
    const placeholderCount = (sql.match(/\?/g) || []).length;
    console.log('📝 SQL Query:', sql);
    console.log('📝 SQL placeholders:', placeholderCount, '| values:', values.length);
    console.log('📝 Values:', JSON.stringify(values, null, 2));
    
    if (placeholderCount !== values.length) {
      console.log('❌ SQL placeholder mismatch!');
      throw new Error(`SQL placeholder mismatch: ${placeholderCount} placeholders but ${values.length} values`);
    }

    console.log('⚙️ Executing SQL update...');
    // Execute update
    await db.sequelize.query(sql, {
        replacements: values,
        type: db.sequelize.QueryTypes.UPDATE
      }
    );
    console.log('✅ SQL update executed successfully');

    // Get updated campaign with founder details (non-critical — don't let this crash the response)
    let updatedCampaign = null;
    try {
      console.log('📊 Fetching updated campaign details...');
      [updatedCampaign] = await db.sequelize.query(
        `SELECT * FROM campaign_details WHERE id = ?`,
        { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
      );
      console.log('✅ Updated campaign fetched:', updatedCampaign ? 'YES' : 'NO');
    } catch (viewErr) {
      console.warn('⚠️ campaign_details view query failed:', viewErr.message);
    }

    // Replace milestones if provided
    if (Array.isArray(req.body.milestones)) {
      console.log('🎯 Processing milestones:', req.body.milestones.length, 'items');
      try {
        await db.sequelize.query(
          'DELETE FROM campaign_milestones WHERE campaign_id = ?',
          { replacements: [id], type: db.sequelize.QueryTypes.DELETE }
        );
        for (let i = 0; i < req.body.milestones.length; i++) {
          const m = req.body.milestones[i];
          if (!m.title?.trim()) continue;
          await db.sequelize.query(
            `INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, target_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                id, m.title.trim(), m.description?.trim() || '',
                parseFloat(String(m.amount || 0).replace(/,/g, '')) || 0,
                i, m.targetDate || null,
              ],
              type: db.sequelize.QueryTypes.INSERT,
            }
          );
        }
      } catch (_) { /* table may not exist yet */ }
    }

    console.log('✅ Campaign update successful!');
    console.log('📤 Sending response...');
    
    res.status(200).send({
      success: true,
      message: newStatus === 'draft' ? 'Campaign saved as draft' : 'Campaign submitted for approval',
      data: {
        id: updatedCampaign?.id || parseInt(id),
        title: updatedCampaign?.title,
        status: updatedCampaign?.status || newStatus,
        founderName: updatedCampaign?.founder_name,
        updatedAt: updatedCampaign?.updatedAt || updatedCampaign?.updated_at
      }
    });

    console.log('🔄 ===== UPDATE CAMPAIGN END =====');

  } catch (error) {
    console.error('❌ ===== UPDATE CAMPAIGN ERROR =====');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ ===================================');
    
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

    res.status(200).send({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
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
    
    const campaigns = await db.sequelize.query(
      `SELECT * FROM campaign_details WHERE founder_id = ? ORDER BY createdAt DESC`,
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

    // Format for frontend WITH profile pictures
    const formatCampaign = (campaign) => {

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
       ORDER BY is_featured DESC, createdAt DESC 
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    const formattedCampaigns = campaigns.map(campaign => {

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
      maximumInvestment: campaign.maximum_investment,
      // Rich content fields
      problemStatement: campaign.problem_statement,
      solution: campaign.solution,
      businessPlan: campaign.business_plan,
      marketAnalysis: campaign.market_analysis,
      competitiveAdvantage: campaign.competitive_advantage,
      financialProjections: campaign.financial_projections,
      teamInformation: campaign.team_information,
      risksAndChallenges: campaign.risks_and_challenges,
      // Media
      videoUrl: campaign.video_url,
      mainImageUrl: campaign.main_image_url,
      pitchDeckUrl: campaign.pitch_deck_url,
      // Status
      status: campaign.status,
      isFeatured: campaign.is_featured,
      isUrgent: campaign.is_urgent,
      // Stats
      viewCount: campaign.view_count,
      favoriteCount: campaign.favorite_count,
      investorCount: campaign.investor_count,
      shareCount: campaign.share_count,
      // Computed
      progressPercentage: campaign.progress_percentage,
      daysRemaining: campaign.days_remaining,
      totalDurationDays: campaign.total_duration_days,
      // Dates
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      durationDays: campaign.duration_days,
      // Permissions
      canEdit: canEdit,
      isFavorited: isFavorited,
      adminComments: campaign.admin_comments,
      rejectionReason: campaign.rejection_reason,
      // Creator
      creator: {
        id: campaign.founder_id,
        fullName: campaign.founder_name,
        company: campaign.founder_company,
        email: campaign.founder_email,
        profileImageUrl: campaign.founder_avatar,
        bio: campaign.founder_bio,
        website: campaign.founder_website,
        isVerified: campaign.founder_verified,
      },
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      submittedAt: campaign.submitted_at,
      approvedAt: campaign.approved_at,
      rejectedAt: campaign.rejected_at,
    };

    // Fetch milestones for this campaign
    let milestones = [];
    try {
      milestones = await db.sequelize.query(
        `SELECT id, title, description, target_amount, current_amount, status, order_index, target_date, completed_at
         FROM campaign_milestones WHERE campaign_id = ? ORDER BY order_index ASC`,
        { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
      );
    } catch (_) {
      // Table may not exist in all environments — degrade gracefully
    }
    formattedCampaign.milestones = milestones.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      targetAmount: m.target_amount,
      currentAmount: m.current_amount,
      status: m.status,
      orderIndex: m.order_index,
      targetDate: m.target_date,
      completedAt: m.completed_at,
    }));

    // Fetch gallery images for this campaign
    let galleryImages = [];
    try {
      const images = await db.sequelize.query(
        `SELECT image_url, caption, order_index 
         FROM campaign_images 
         WHERE campaign_id = ? AND image_type = 'gallery'
         ORDER BY order_index ASC`,
        { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
      );
      galleryImages = images.map(img => buildImageUrl(img.image_url));
    } catch (_) {
      // Table may not exist or no images — degrade gracefully
    }
    
    // If no gallery images, use main image as fallback
    if (galleryImages.length === 0 && campaign.main_image_url) {
      galleryImages = [buildImageUrl(campaign.main_image_url)];
    }
    
    formattedCampaign.galleryImages = galleryImages;

    res.status(200).send({
      success: true,
      data: formattedCampaign
    });

  } catch (error) {
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
       ORDER BY view_count DESC, createdAt DESC
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
         DATE(createdAt) as date,
         COUNT(*) as favorites
       FROM campaign_favorites 
       WHERE campaign_id = ?
       AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(createdAt)
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
    
    // FIXED: Use campaign_details view
    const campaigns = await db.sequelize.query(
      `SELECT * FROM campaign_details
       WHERE status = 'approved' AND is_featured = true
       ORDER BY view_count DESC, createdAt DESC
       LIMIT ?`,
      {
        replacements: [parseInt(limit)],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

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
    
    // Use campaign_details view
    const favoriteCampaigns = await db.sequelize.query(
      `SELECT cd.*, cf.createdAt as favorited_at
       FROM campaign_details cd
       JOIN campaign_favorites cf ON cd.id = cf.campaign_id
       WHERE cf.user_id = ? AND cd.status = 'approved'
       ORDER BY cf.createdAt DESC`,
      {
        replacements: [userId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

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
    
    // Placeholder - returns empty array until payment system is implemented
    res.status(200).send({
      success: true,
      data: [],
      message: "Investments tracking will be implemented when payment system is ready"
    });

  } catch (error) {
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
      // Don't fail the request if view tracking fails
    }

    res.status(200).send({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
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
    
    const result = await CampaignStatsService.recalculateAllCampaignStats();
    
    res.status(200).send({
      success: true,
      message: `Successfully recalculated statistics for ${result.campaignsUpdated} campaigns`,
      data: result
    });

  } catch (error) {
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