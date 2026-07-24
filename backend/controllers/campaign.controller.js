const db = require("../models");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const CampaignStatsService = require('../services/campaignStatsService');

// Helper to build image URLs
const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.includes('cloudinary')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

// Standardized campaign card formatter
const formatCampaignCard = (campaign) => {
  if (!campaign) return null;

  const rawImage = campaign.main_image_url || campaign.coverImage || campaign.cover_image || campaign.image;
  const processedImage = buildImageUrl(rawImage);

  // Founder Name Resolution
  const founderName = campaign.founder_name || campaign.fullName || campaign.founderName || campaign.founder?.fullName;

  return {
    id: campaign.id,
    title: campaign.title,
    subtitle: campaign.subtitle || '',
    description: campaign.description || '',
    category: campaign.category || '',
    location: campaign.location || '',
    country: campaign.country || 'Nigeria',

    // Amount & Progress Fields (Supports both camelCase & snake_case)
    targetAmount: parseFloat(campaign.target_amount || campaign.targetAmount || 0),
    target_amount: parseFloat(campaign.target_amount || campaign.targetAmount || 0),
    currentAmount: parseFloat(campaign.current_amount || campaign.currentAmount || campaign.raised || 0),
    current_amount: parseFloat(campaign.current_amount || campaign.currentAmount || campaign.raised || 0),
    minimumInvestment: parseFloat(campaign.minimum_investment || campaign.minimumInvestment || 0),
    maximumInvestment: campaign.maximum_investment ? parseFloat(campaign.maximum_investment) : null,

    status: campaign.status || 'draft',

    // Images (Supports both camelCase & snake_case)
    coverImage: processedImage,
    cover_image: processedImage,
    mainImageUrl: processedImage,
    main_image_url: processedImage,
    image: processedImage,

    daysLeft: campaign.days_left ?? campaign.days_remaining ?? campaign.daysLeft ?? 30,
    viewsCount: campaign.view_count || campaign.viewCount || campaign.views_count || 0,
    favoriteCount: campaign.favorite_count || campaign.favoriteCount || 0,
    adminComments: campaign.admin_comments || campaign.adminComments || null,
    createdAt: campaign.created_at || campaign.createdAt,
    submittedAt: campaign.submitted_at || campaign.submittedAt || null,
    approvedAt: campaign.approved_at || campaign.approvedAt || null,
    rejectedAt: campaign.rejected_at || campaign.rejectedAt || null,

    // Founder Details (Checks top-level and nested structures)
    fullName: founderName && founderName !== 'Anonymous' ? founderName : 'Brian Okeke',
    founder: {
      id: campaign.founder_id || campaign.founderId || campaign.founder?.id,
      fullName: founderName && founderName !== 'Anonymous' ? founderName : 'Brian Okeke',
      companyName: campaign.founder_company || campaign.companyName || campaign.founder?.companyName || '',
      profileImageUrl: buildImageUrl(campaign.founder_avatar || campaign.profileImageUrl || campaign.founder?.profileImageUrl)
    }
  };
};

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
});

// ================= PUBLIC RETRIEVAL & DISCOVERY =================

const getFeaturedCampaigns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const featuredCampaigns = await db.sequelize.query(
      `SELECT 
         c.*, 
         COALESCE(u.fullName, '') AS founder_name, 
         COALESCE(u.companyName, '') AS founder_company, 
         u.profileImageUrl AS founder_avatar,
         ROUND((c.current_amount / NULLIF(c.target_amount, 0)) * 100, 2) AS progress_percentage
       FROM campaigns c
       JOIN users u ON c.founder_id = u.id
       WHERE c.status = 'approved' AND c.is_featured = TRUE
       ORDER BY c.view_count DESC, c.current_amount DESC
       LIMIT ?`,
      {
        replacements: [limit],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    return res.status(200).json({
      success: true,
      data: featuredCampaigns.map(formatCampaignCard)
    });
  } catch (error) {
    console.error("🔥 Error in getFeaturedCampaigns:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching featured campaigns",
      error: error.message
    });
  }
};

// Get recent campaigns
const getRecentCampaigns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const recentRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar
       FROM campaigns c
       JOIN users u ON c.founder_id = u.id
       WHERE c.status = 'approved'
       ORDER BY c.createdAt DESC
       LIMIT ?`,
      { replacements: [limit], type: db.sequelize.QueryTypes.SELECT }
    );

    res.status(200).send({
      success: true,
      data: recentRaw.map(formatCampaignCard)
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching recent campaigns', error: error.message });
  }
};

// Search campaigns
const searchCampaigns = async (req, res) => {
  try {
    const { q, category } = req.query;
    let querySql = `
      SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar
      FROM campaigns c
      JOIN users u ON c.founder_id = u.id
      WHERE c.status = 'approved'
    `;
    const replacements = [];

    if (q) {
      querySql += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.location LIKE ?)`;
      const term = `%${q}%`;
      replacements.push(term, term, term);
    }

    if (category && category !== 'all') {
      querySql += ` AND c.category = ?`;
      replacements.push(category);
    }

    querySql += ` ORDER BY c.createdAt DESC LIMIT 20`;

    const resultsRaw = await db.sequelize.query(querySql, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT
    });

    res.status(200).send({
      success: true,
      data: resultsRaw.map(formatCampaignCard)
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error searching campaigns', error: error.message });
  }
};

// Get all approved public campaigns (Safe Raw SQL implementation)
const getAllCampaigns = async (req, res) => {
  try {
    const { status = 'approved', category, search } = req.query;

    let querySql = `
      SELECT 
        c.*, 
        u.fullName AS founder_name, 
        u.companyName AS founder_company, 
        u.profileImageUrl AS founder_avatar
      FROM campaigns c
      LEFT JOIN users u ON c.founder_id = u.id
      WHERE 1=1
    `;

    const replacements = [];

    if (status && status !== 'all') {
      querySql += ` AND c.status = ?`;
      replacements.push(status);
    }

    if (category) {
      querySql += ` AND c.category = ?`;
      replacements.push(category);
    }

    if (search) {
      querySql += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
      replacements.push(`%${search}%`, `%${search}%`);
    }

    querySql += ` ORDER BY c.createdAt DESC`;

    const rawCampaigns = await db.sequelize.query(querySql, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT
    });

    const formattedCampaigns = rawCampaigns.map(formatCampaignCard);

    return res.status(200).json({
      success: true,
      count: formattedCampaigns.length,
      data: formattedCampaigns,
      campaigns: formattedCampaigns
    });

  } catch (error) {
    console.error('Error in getAllCampaigns:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns',
      error: error.message
    });
  }
};

// Get single campaign details
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userId || null;

    const [campaign] = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar
       FROM campaigns c
       JOIN users u ON c.founder_id = u.id
       WHERE c.id = ?`,
      { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!campaign) {
      return res.status(404).send({ success: false, message: 'Campaign not found' });
    }

    if (campaign.status !== 'approved') {
      if (!currentUserId) {
        return res.status(403).send({ success: false, message: 'Unauthorized access to unapproved campaign' });
      }
      const [user] = await db.sequelize.query(
        'SELECT userType FROM users WHERE id = ?',
        { replacements: [currentUserId], type: db.sequelize.QueryTypes.SELECT }
      );
      if (campaign.founder_id !== currentUserId && user?.userType !== 'admin') {
        return res.status(403).send({ success: false, message: 'Unauthorized access to campaign' });
      }
    }

    const milestones = await db.sequelize.query(
      'SELECT * FROM campaign_milestones WHERE campaign_id = ? ORDER BY order_index ASC',
      { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
    );

    const galleryImages = await db.sequelize.query(
      'SELECT id, image_url, image_type, order_index FROM campaign_images WHERE campaign_id = ? ORDER BY order_index ASC',
      { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
    );

    let isFavorited = false;
    if (currentUserId) {
      const [fav] = await db.sequelize.query(
        'SELECT id FROM campaign_favorites WHERE campaign_id = ? AND user_id = ?',
        { replacements: [id, currentUserId], type: db.sequelize.QueryTypes.SELECT }
      );
      isFavorited = !!fav;
    }

    const formatted = formatCampaignCard(campaign);

    res.status(200).send({
      success: true,
      data: {
        ...formatted,
        problemStatement: campaign.problem_statement,
        solution: campaign.solution,
        businessPlan: campaign.business_plan,
        marketAnalysis: campaign.market_analysis,
        competitiveAdvantage: campaign.competitive_advantage,
        financialProjections: campaign.financial_projections,
        teamInformation: campaign.team_information,
        risksAndChallenges: campaign.risks_and_challenges,
        videoUrl: campaign.video_url,
        documents: campaign.documents ? (typeof campaign.documents === 'string' ? JSON.parse(campaign.documents) : campaign.documents) : [],
        milestones,
        galleryImages: galleryImages.map(img => ({ ...img, image_url: buildImageUrl(img.image_url) })),
        isFavorited
      }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error retrieving campaign', error: error.message });
  }
};

// Get related campaigns (same category, exclude current)
const getRelatedCampaigns = async (req, res) => {
  try {
    const { id } = req.params;

    const [current] = await db.sequelize.query(
      'SELECT category FROM campaigns WHERE id = ?',
      { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!current) {
      return res.status(404).send({ success: false, message: 'Campaign not found' });
    }

    const relatedRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar
       FROM campaigns c
       JOIN users u ON c.founder_id = u.id
       WHERE c.category = ? AND c.id != ? AND c.status = 'approved'
       ORDER BY c.createdAt DESC
       LIMIT 4`,
      { replacements: [current.category, id], type: db.sequelize.QueryTypes.SELECT }
    );

    res.status(200).send({
      success: true,
      data: relatedRaw.map(formatCampaignCard)
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching related campaigns', error: error.message });
  }
};

// ================= USER-SPECIFIC CAMPAIGN ROUTES =================

// Get campaigns created by logged-in founder
const getMyCampaigns = async (req, res) => {
  try {
    const founderId = req.userId;

    const campaignsRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       WHERE c.founder_id = ? 
       ORDER BY c.createdAt DESC`,
      { replacements: [founderId], type: db.sequelize.QueryTypes.SELECT }
    );

    const formatted = campaignsRaw.map(formatCampaignCard);

    res.status(200).send({
      success: true,
      data: {
        all: formatted,
        drafts: formatted.filter(c => c.status === 'draft'),
        submitted: formatted.filter(c => c.status === 'submitted'),
        approved: formatted.filter(c => c.status === 'approved'),
        rejected: formatted.filter(c => c.status === 'rejected')
      }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching campaigns', error: error.message });
  }
};

// Get campaigns viewed by logged-in user
const getViewedCampaigns = async (req, res) => {
  try {
    const userId = req.userId;

    const viewedRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar, MAX(cv.viewed_at) as last_viewed
       FROM campaign_views cv
       JOIN campaigns c ON cv.campaign_id = c.id
       JOIN users u ON c.founder_id = u.id
       WHERE cv.user_id = ?
       GROUP BY c.id, u.id
       ORDER BY last_viewed DESC
       LIMIT 20`,
      { replacements: [userId], type: db.sequelize.QueryTypes.SELECT }
    );

    res.status(200).send({
      success: true,
      data: viewedRaw.map(formatCampaignCard)
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching viewed campaigns', error: error.message });
  }
};

// Get user's favorite campaigns
const getFavoriteCampaigns = async (req, res) => {
  try {
    const userId = req.userId;

    const favoritesRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar
       FROM campaign_favorites cf
       JOIN campaigns c ON cf.campaign_id = c.id
       JOIN users u ON c.founder_id = u.id
       WHERE cf.user_id = ?
       ORDER BY cf.createdAt DESC`,
      { replacements: [userId], type: db.sequelize.QueryTypes.SELECT }
    );

    res.status(200).send({
      success: true,
      data: favoritesRaw.map(formatCampaignCard)
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching favorite campaigns', error: error.message });
  }
};

// Get user's funded campaigns
const getFundedCampaigns = async (req, res) => {
  try {
    const userId = req.userId;

    const fundedRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar, MAX(inv.created_at) as last_invested
       FROM investments inv
       JOIN campaigns c ON inv.campaign_id = c.id
       JOIN users u ON c.founder_id = u.id
       WHERE inv.investor_id = ? AND inv.status = 'completed'
       GROUP BY c.id, u.id
       ORDER BY last_invested DESC`,
      { replacements: [userId], type: db.sequelize.QueryTypes.SELECT }
    ).catch(() => []);

    res.status(200).send({
      success: true,
      data: fundedRaw.map(formatCampaignCard)
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching funded campaigns', error: error.message });
  }
};

// Combined endpoint for batch loading on My Campaigns page
const getAllMyCampaignsData = async (req, res) => {
  try {
    const userId = req.userId;

    const createdRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar
       FROM campaigns c
       JOIN users u ON c.founder_id = u.id
       WHERE c.founder_id = ?
       ORDER BY c.createdAt DESC`,
      { replacements: [userId], type: db.sequelize.QueryTypes.SELECT }
    );
    const formattedCreated = createdRaw.map(formatCampaignCard);

    const viewedRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar, MAX(cv.viewed_at) as last_viewed
       FROM campaign_views cv
       JOIN campaigns c ON cv.campaign_id = c.id
       JOIN users u ON c.founder_id = u.id
       WHERE cv.user_id = ?
       GROUP BY c.id, u.id
       ORDER BY last_viewed DESC
       LIMIT 20`,
      { replacements: [userId], type: db.sequelize.QueryTypes.SELECT }
    );

    const favoritesRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar
       FROM campaign_favorites cf
       JOIN campaigns c ON cf.campaign_id = c.id
       JOIN users u ON c.founder_id = u.id
       WHERE cf.user_id = ?
       ORDER BY cf.createdAt DESC`,
      { replacements: [userId], type: db.sequelize.QueryTypes.SELECT }
    );

    const fundedRaw = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.companyName as founder_company, u.profileImageUrl as founder_avatar, MAX(inv.created_at) as last_invested
       FROM investments inv
       JOIN campaigns c ON inv.campaign_id = c.id
       JOIN users u ON c.founder_id = u.id
       WHERE inv.investor_id = ? AND inv.status = 'completed'
       GROUP BY c.id, u.id
       ORDER BY last_invested DESC`,
      { replacements: [userId], type: db.sequelize.QueryTypes.SELECT }
    ).catch(() => []);

    res.status(200).send({
      success: true,
      data: {
        created: {
          all: formattedCreated,
          drafts: formattedCreated.filter(c => c.status === 'draft'),
          submitted: formattedCreated.filter(c => c.status === 'submitted'),
          approved: formattedCreated.filter(c => c.status === 'approved'),
          rejected: formattedCreated.filter(c => c.status === 'rejected')
        },
        viewed: viewedRaw.map(formatCampaignCard),
        favorites: favoritesRaw.map(formatCampaignCard),
        funded: fundedRaw.map(formatCampaignCard)
      }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching aggregated my-campaigns data', error: error.message });
  }
};

// ================= CAMPAIGN CRUD & EDITING =================

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    const founderId = req.userId;

    const [userCheck] = await db.sequelize.query(
      'SELECT id, email, fullName, userType FROM users WHERE id = ?',
      { replacements: [founderId], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!userCheck) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    if (userCheck.userType !== 'founder') {
      return res.status(403).send({ success: false, message: 'Only founders can create campaigns' });
    }

    const {
      title, description, category, location, country,
      targetAmount, minimumInvestment, maximumInvestment,
      problemStatement, solution, businessPlan, marketAnalysis,
      competitiveAdvantage, financialProjections, teamInformation,
      risksAndChallenges, videoUrl, endDate, durationDays, isDraft, documents
    } = req.body;

    const isDraftBool = isDraft === true || isDraft === 'true';

    if (!isDraftBool) {
      const requiredFields = ['title', 'description', 'category', 'location', 'country', 'targetAmount', 'minimumInvestment'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).send({ success: false, message: `${field} is required` });
        }
      }
    }

    const status = isDraftBool ? 'draft' : 'submitted';
    const submittedAt = isDraftBool ? null : new Date();

    const documentsJson = documents && Array.isArray(documents) && documents.length > 0
      ? JSON.stringify(documents)
      : null;

    const values = [
      title || '', description || '', category || '', location || '', country || 'Nigeria',
      parseFloat(targetAmount) || 0,
      parseFloat(String(minimumInvestment || '').replace(/,/g, '')) || 0,
      maximumInvestment ? parseFloat(String(maximumInvestment).replace(/,/g, '')) : null,
      problemStatement || '', solution || '', businessPlan || '', marketAnalysis || '',
      competitiveAdvantage || '', financialProjections || '', teamInformation || '',
      risksAndChallenges || '', videoUrl || '', documentsJson, endDate || null,
      durationDays ? parseInt(durationDays) : 90, founderId, status, submittedAt
    ];

    const [result] = await db.sequelize.query(
      `INSERT INTO campaigns 
       (title, description, category, location, country, target_amount, minimum_investment, maximum_investment,
        problem_statement, solution, business_plan, market_analysis, competitive_advantage,
        financial_projections, team_information, risks_and_challenges,
        video_url, documents, end_date, duration_days, founder_id, status, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      { replacements: values, type: db.sequelize.QueryTypes.INSERT }
    );

    const campaignId = result;

    const [campaign] = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name, u.email as founder_email
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       WHERE c.id = ?`,
      { replacements: [campaignId], type: db.sequelize.QueryTypes.SELECT }
    );

    if (Array.isArray(req.body.milestones) && req.body.milestones.length > 0) {
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
      } catch (err) {
        console.warn('Milestone save failed:', err.message);
      }
    }

    res.status(201).send({
      success: true,
      message: isDraftBool ? 'Campaign saved as draft' : 'Campaign submitted for approval',
      data: formatCampaignCard(campaign)
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error creating campaign', error: error.message });
  }
};

// Upload campaign image
const uploadCampaignImage = [
  upload.single('campaignImage'),
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const founderId = req.userId;
      const { isGallery } = req.query;

      if (!req.file) {
        return res.status(400).send({ success: false, message: 'No image file provided' });
      }

      const [campaign] = await db.sequelize.query(
        'SELECT id, founder_id, status FROM campaigns WHERE id = ?',
        { replacements: [campaignId], type: db.sequelize.QueryTypes.SELECT }
      );

      if (!campaign) {
        return res.status(404).send({ success: false, message: 'Campaign not found' });
      }

      const [user] = await db.sequelize.query(
        'SELECT userType FROM users WHERE id = ?',
        { replacements: [founderId], type: db.sequelize.QueryTypes.SELECT }
      );

      if (campaign.founder_id !== founderId && user.userType !== 'admin') {
        return res.status(403).send({ success: false, message: 'Unauthorized to upload image for this campaign' });
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'darb/campaigns', resource_type: 'image' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        stream.end(req.file.buffer);
      });
      const imageUrl = uploadResult.secure_url;

      if (isGallery === 'true') {
        const [maxOrder] = await db.sequelize.query(
          'SELECT COALESCE(MAX(order_index), -1) as max_order FROM campaign_images WHERE campaign_id = ?',
          { replacements: [campaignId], type: db.sequelize.QueryTypes.SELECT }
        );
        const orderIndex = (maxOrder?.max_order ?? -1) + 1;

        await db.sequelize.query(
          `INSERT INTO campaign_images (campaign_id, image_url, image_type, filename, order_index)
           VALUES (?, ?, 'gallery', ?, ?)`,
          { replacements: [campaignId, imageUrl, req.file.originalname, orderIndex], type: db.sequelize.QueryTypes.INSERT }
        );
      } else {
        await db.sequelize.query(
          'UPDATE campaigns SET main_image_url = ? WHERE id = ?',
          { replacements: [imageUrl, campaignId], type: db.sequelize.QueryTypes.UPDATE }
        );
      }

      res.status(200).send({
        success: true,
        message: 'Image uploaded successfully',
        data: { imageUrl, campaignId, isGallery: isGallery === 'true' }
      });
    } catch (error) {
      res.status(500).send({ success: false, message: 'Error uploading image', error: error.message });
    }
  }
];

// Get campaign specifically formatted for edit screen
const getCampaignForEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const founderId = req.userId;

    const [campaign] = await db.sequelize.query(
      'SELECT * FROM campaigns WHERE id = ? AND founder_id = ?',
      { replacements: [id, founderId], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!campaign) {
      return res.status(404).send({ success: false, message: 'Campaign not found or unauthorized' });
    }

    if (!['draft', 'rejected'].includes(campaign.status)) {
      return res.status(400).send({ success: false, message: 'Only draft or rejected campaigns can be edited' });
    }

    const milestones = await db.sequelize.query(
      'SELECT * FROM campaign_milestones WHERE campaign_id = ? ORDER BY order_index ASC',
      { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
    );

    res.status(200).send({
      success: true,
      data: {
        ...formatCampaignCard(campaign),
        problemStatement: campaign.problem_statement,
        solution: campaign.solution,
        businessPlan: campaign.business_plan,
        marketAnalysis: campaign.market_analysis,
        competitiveAdvantage: campaign.competitive_advantage,
        financialProjections: campaign.financial_projections,
        teamInformation: campaign.team_information,
        risksAndChallenges: campaign.risks_and_challenges,
        videoUrl: campaign.video_url,
        documents: campaign.documents ? (typeof campaign.documents === 'string' ? JSON.parse(campaign.documents) : campaign.documents) : [],
        milestones
      }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error retrieving campaign for edit', error: error.message });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const founderId = req.userId;
    const updateData = req.body;

    const [campaign] = await db.sequelize.query(
      'SELECT id, founder_id, status FROM campaigns WHERE id = ? AND founder_id = ?',
      { replacements: [id, founderId], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!campaign) {
      return res.status(404).send({ success: false, message: 'Campaign not found or unauthorized' });
    }

    if (!['draft', 'rejected'].includes(campaign.status)) {
      return res.status(400).send({ success: false, message: 'Cannot edit approved campaigns' });
    }

    const isDraftBool = updateData.isDraft === true || updateData.isDraft === 'true';
    const newStatus = isDraftBool ? 'draft' : 'submitted';
    const submittedAt = isDraftBool ? null : new Date();

    const updates = [];
    const values = [];

    const fieldMappings = {
      title: 'title',
      description: 'description',
      category: 'category',
      location: 'location',
      country: 'country',
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

    if (updateData.documents !== undefined) {
      updates.push('documents = ?');
      const documentsJson = updateData.documents && Array.isArray(updateData.documents) && updateData.documents.length > 0
        ? JSON.stringify(updateData.documents)
        : null;
      values.push(documentsJson);
    }

    const numericFields = ['targetAmount', 'minimumInvestment', 'maximumInvestment', 'durationDays'];
    const nullableDateFields = ['endDate'];

    Object.entries(fieldMappings).forEach(([frontendField, dbField]) => {
      if (updateData[frontendField] === undefined) return;

      let shouldSkip = false;
      if (isDraftBool) {
        const value = updateData[frontendField];
        if (numericFields.includes(frontendField)) {
          const parsed = parseFloat(String(value || '').replace(/,/g, ''));
          if (!parsed || parsed === 0 || isNaN(parsed)) shouldSkip = true;
        }
        if (!shouldSkip && !numericFields.includes(frontendField) && !nullableDateFields.includes(frontendField)) {
          if (value === '' || value === null) shouldSkip = true;
        }
        if (!shouldSkip && nullableDateFields.includes(frontendField)) {
          if (!value || value === '') shouldSkip = true;
        }
      }

      if (shouldSkip) return;

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

    updates.push('status = ?');
    values.push(newStatus);

    if (submittedAt) {
      updates.push('submitted_at = ?');
      values.push(submittedAt);
    } else {
      updates.push('submitted_at = NULL');
    }

    if (newStatus === 'submitted') {
      updates.push('reviewed_by = NULL');
      updates.push('admin_comments = NULL');
      updates.push('approved_at = NULL');
      updates.push('rejected_at = NULL');
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const sql = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`;
    await db.sequelize.query(sql, { replacements: values, type: db.sequelize.QueryTypes.UPDATE });

    if (Array.isArray(req.body.milestones)) {
      try {
        await db.sequelize.query('DELETE FROM campaign_milestones WHERE campaign_id = ?', { replacements: [id], type: db.sequelize.QueryTypes.DELETE });
        for (let i = 0; i < req.body.milestones.length; i++) {
          const m = req.body.milestones[i];
          if (!m.title?.trim()) continue;
          await db.sequelize.query(
            `INSERT INTO campaign_milestones (campaign_id, title, description, target_amount, order_index, target_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            {
              replacements: [id, m.title.trim(), m.description?.trim() || '', parseFloat(String(m.amount || 0).replace(/,/g, '')) || 0, i, m.targetDate || null],
              type: db.sequelize.QueryTypes.INSERT,
            }
          );
        }
      } catch (_) { }
    }

    res.status(200).send({
      success: true,
      message: newStatus === 'draft' ? 'Campaign saved as draft' : 'Campaign submitted for approval',
      data: { id: parseInt(id), status: newStatus }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error updating campaign', error: error.message });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const founderId = req.userId;

    const [campaign] = await db.sequelize.query(
      'SELECT id, founder_id, status FROM campaigns WHERE id = ? AND founder_id = ?',
      { replacements: [id, founderId], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!campaign) {
      return res.status(404).send({ success: false, message: 'Campaign not found or unauthorized' });
    }

    if (campaign.status === 'approved') {
      return res.status(400).send({ success: false, message: 'Cannot delete approved campaigns. Please contact support.' });
    }

    await db.sequelize.query('DELETE FROM campaigns WHERE id = ?', { replacements: [id], type: db.sequelize.QueryTypes.DELETE });

    res.status(200).send({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error deleting campaign', error: error.message });
  }
};

// ================= FAVORITES, VIEWS & INTERACTION =================

// Toggle favorite status
const toggleFavorite = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.userId;

    const [campaign] = await db.sequelize.query(
      'SELECT id, favorite_count FROM campaigns WHERE id = ?',
      { replacements: [campaignId], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!campaign) {
      return res.status(404).send({ success: false, message: 'Campaign not found' });
    }

    const [existingFav] = await db.sequelize.query(
      'SELECT id FROM campaign_favorites WHERE campaign_id = ? AND user_id = ?',
      { replacements: [campaignId, userId], type: db.sequelize.QueryTypes.SELECT }
    );

    let isFavorited = false;

    if (existingFav) {
      await db.sequelize.query(
        'DELETE FROM campaign_favorites WHERE campaign_id = ? AND user_id = ?',
        { replacements: [campaignId, userId], type: db.sequelize.QueryTypes.DELETE }
      );
      await db.sequelize.query(
        'UPDATE campaigns SET favorite_count = GREATEST(0, COALESCE(favorite_count, 1) - 1) WHERE id = ?',
        { replacements: [campaignId], type: db.sequelize.QueryTypes.UPDATE }
      );
      isFavorited = false;
    } else {
      await db.sequelize.query(
        'INSERT INTO campaign_favorites (campaign_id, user_id) VALUES (?, ?)',
        { replacements: [campaignId, userId], type: db.sequelize.QueryTypes.INSERT }
      );
      await db.sequelize.query(
        'UPDATE campaigns SET favorite_count = COALESCE(favorite_count, 0) + 1 WHERE id = ?',
        { replacements: [campaignId], type: db.sequelize.QueryTypes.UPDATE }
      );
      isFavorited = true;
    }

    res.status(200).send({
      success: true,
      message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
      data: { isFavorited }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error toggling favorite', error: error.message });
  }
};

// Track view count
const trackCampaignView = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.userId || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';

    const [campaign] = await db.sequelize.query(
      'SELECT id FROM campaigns WHERE id = ?',
      { replacements: [campaignId], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!campaign) {
      return res.status(404).send({ success: false, message: 'Campaign not found' });
    }

    await db.sequelize.query(
      'INSERT INTO campaign_views (campaign_id, user_id, ip_address) VALUES (?, ?, ?)',
      { replacements: [campaignId, userId, ipAddress], type: db.sequelize.QueryTypes.INSERT }
    );

    await db.sequelize.query(
      'UPDATE campaigns SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
      { replacements: [campaignId], type: db.sequelize.QueryTypes.UPDATE }
    );

    res.status(200).send({ success: true, message: 'View tracked successfully' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error tracking view', error: error.message });
  }
};

// ================= STATS & ANALYTICS =================

// Get founder dashboard stats
const getFounderStats = async (req, res) => {
  try {
    const founderId = req.userId;

    if (CampaignStatsService && typeof CampaignStatsService.getFounderDashboardStats === 'function') {
      const stats = await CampaignStatsService.getFounderDashboardStats(founderId);
      return res.status(200).send({ success: true, data: stats });
    }

    const [stats] = await db.sequelize.query(
      `SELECT 
        COUNT(id) as total_campaigns,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as active_campaigns,
        COALESCE(SUM(current_amount), 0) as total_raised,
        COALESCE(SUM(view_count), 0) as total_views,
        COALESCE(SUM(favorite_count), 0) as total_favorites
       FROM campaigns WHERE founder_id = ?`,
      { replacements: [founderId], type: db.sequelize.QueryTypes.SELECT }
    );

    res.status(200).send({ success: true, data: stats });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching founder stats', error: error.message });
  }
};

// Get individual campaign stats
const getCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [stats] = await db.sequelize.query(
      `SELECT id, target_amount, current_amount, view_count, favorite_count, status
       FROM campaigns WHERE id = ?`,
      { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!stats) {
      return res.status(404).send({ success: false, message: 'Campaign stats not found' });
    }

    res.status(200).send({
      success: true,
      data: {
        targetAmount: parseFloat(stats.target_amount || 0),
        current_amount: parseFloat(stats.current_amount || 0),
        viewCount: parseInt(stats.view_count || 0),
        favoriteCount: parseInt(stats.favorite_count || 0),
        status: stats.status
      }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching campaign stats', error: error.message });
  }
};

// Get single campaign analytics
const getCampaignAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const founderId = req.userId;

    const [campaign] = await db.sequelize.query(
      'SELECT id FROM campaigns WHERE id = ? AND founder_id = ?',
      { replacements: [id, founderId], type: db.sequelize.QueryTypes.SELECT }
    );

    if (!campaign) {
      return res.status(404).send({ success: false, message: 'Campaign not found or unauthorized' });
    }

    if (CampaignStatsService && typeof CampaignStatsService.getCampaignAnalytics === 'function') {
      const analytics = await CampaignStatsService.getCampaignAnalytics(id);
      return res.status(200).send({ success: true, data: analytics });
    }

    res.status(200).send({
      success: true,
      data: { message: 'Analytics data' }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching campaign analytics', error: error.message });
  }
};

// ================= EXPORTS =================

module.exports = {
  // Discovery & Public
  getFeaturedCampaigns,
  getRecentCampaigns,
  searchCampaigns,
  getAllCampaigns,
  getCampaignById,
  getRelatedCampaigns,

  // User Specific
  getMyCampaigns,
  getViewedCampaigns,
  getFavoriteCampaigns,
  getFundedCampaigns,
  getAllMyCampaignsData,

  // CRUD & Editing
  createCampaign,
  uploadCampaignImage,
  getCampaignForEdit,
  updateCampaign,
  deleteCampaign,

  // Interactions
  toggleFavorite,
  trackCampaignView,

  // Analytics & Stats
  getFounderStats,
  getCampaignStats,
  getCampaignAnalytics
};