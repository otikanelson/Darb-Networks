const db = require("../models");

// Get all campaigns for admin review
exports.getAllCampaignsForReview = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    
    console.log('🔍 DEBUG: Admin controller called with:', { status, page, limit });
    
    let whereClause = '';
    let replacements = [];
    
    // Fix: Only filter by status if it's not 'all'
    if (status !== 'all') {
      whereClause = 'WHERE c.status = ?';
      replacements.push(status);
    }
    
    const offset = (page - 1) * limit;
    
    console.log('🔍 DEBUG: SQL where clause:', whereClause);
    console.log('🔍 DEBUG: SQL replacements:', replacements);
    
    const campaigns = await db.sequelize.query(
      `SELECT c.*, 
              u.fullName as founder_name, 
              u.email as founder_email,
              u.companyName as founder_company,
              u.phoneNumber as founder_phone,
              u.address as founder_address,
              admin.fullName as reviewed_by_name
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       LEFT JOIN users admin ON c.reviewed_by = admin.id
       ${whereClause}
       ORDER BY 
         CASE 
           WHEN c.status = 'submitted' THEN 1 
           WHEN c.status = 'draft' THEN 2 
           WHEN c.status = 'approved' THEN 3 
           WHEN c.status = 'rejected' THEN 4 
           ELSE 5 
         END,
         c.submitted_at DESC, 
         c.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: db.sequelize.QueryTypes.SELECT,
        logging: console.log // This will show the actual SQL query
      }
    );

    console.log('🔍 DEBUG: Found campaigns:', campaigns.length);
    console.log('🔍 DEBUG: First campaign:', campaigns[0]);

    // Get total count
    const [countResult] = await db.sequelize.query(
      `SELECT COUNT(*) as total FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       ${whereClause}`,
      {
        replacements: replacements,
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log('🔍 DEBUG: Total count:', countResult.total);

    // Get status counts
    const statusCounts = await db.sequelize.query(
      `SELECT 
         status,
         COUNT(*) as count
       FROM campaigns 
       GROUP BY status`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    console.log('🔍 DEBUG: Status counts:', statusCounts);

    const responseData = {
      success: true,
      data: campaigns,
      pagination: {
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult.total / limit)
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {})
    };

    console.log('🔍 DEBUG: Sending response:', responseData);

    res.status(200).send(responseData);

  } catch (error) {
    console.error('🔍 DEBUG: Get campaigns for review error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaigns',
      error: error.message
    });
  }
};

// Get campaign details for admin review
exports.getCampaignForReview = async (req, res) => {
  try {
    const { id } = req.params;

    const [campaign] = await db.sequelize.query(
      `SELECT c.*, 
              u.fullName as founder_name, 
              u.email as founder_email,
              u.companyName as founder_company,
              u.phoneNumber as founder_phone,
              u.address as founder_address,
              u.bvn as founder_bvn,
              u.profileImageUrl as founder_avatar,
              admin.fullName as reviewed_by_name
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       LEFT JOIN users admin ON c.reviewed_by = admin.id
       WHERE c.id = ?`,
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

    res.status(200).send({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('Get campaign for review error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching campaign',
      error: error.message
    });
  }
};

// Approve campaign
exports.approveCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;
    const { comments, isFeatured = false } = req.body;

    // Verify campaign exists and is submitted
    const [campaign] = await db.sequelize.query(
      'SELECT id, status FROM campaigns WHERE id = ?',
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

    if (campaign.status !== 'submitted') {
      return res.status(400).send({
        success: false,
        message: 'Only submitted campaigns can be approved'
      });
    }

    // Update campaign status
    await db.sequelize.query(
      `UPDATE campaigns 
       SET status = 'approved', 
           approved_at = NOW(), 
           reviewed_by = ?, 
           admin_comments = ?,
           is_featured = ?
       WHERE id = ?`,
      {
        replacements: [adminId, comments || '', isFeatured, id],
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // Get updated campaign
    const [updatedCampaign] = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name 
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       WHERE c.id = ?`,
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      message: 'Campaign approved successfully',
      data: updatedCampaign
    });

  } catch (error) {
    console.error('Approve campaign error:', error);
    res.status(500).send({
      success: false,
      message: 'Error approving campaign',
      error: error.message
    });
  }
};

// Reject campaign
exports.rejectCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;
    const { comments } = req.body;

    if (!comments || !comments.trim()) {
      return res.status(400).send({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Verify campaign exists and is submitted
    const [campaign] = await db.sequelize.query(
      'SELECT id, status FROM campaigns WHERE id = ?',
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

    if (campaign.status !== 'submitted') {
      return res.status(400).send({
        success: false,
        message: 'Only submitted campaigns can be rejected'
      });
    }

    // Update campaign status
    await db.sequelize.query(
      `UPDATE campaigns 
       SET status = 'rejected', 
           reviewed_by = ?, 
           admin_comments = ?
       WHERE id = ?`,
      {
        replacements: [adminId, comments, id],
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // Get updated campaign
    const [updatedCampaign] = await db.sequelize.query(
      `SELECT c.*, u.fullName as founder_name 
       FROM campaigns c 
       JOIN users u ON c.founder_id = u.id 
       WHERE c.id = ?`,
      {
        replacements: [id],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      message: 'Campaign rejected successfully',
      data: updatedCampaign
    });

  } catch (error) {
    console.error('Reject campaign error:', error);
    res.status(500).send({
      success: false,
      message: 'Error rejecting campaign',
      error: error.message
    });
  }
};

// Toggle featured status
exports.toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    // Verify campaign exists and is approved
    const [campaign] = await db.sequelize.query(
      'SELECT id, status, is_featured FROM campaigns WHERE id = ?',
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

    if (campaign.status !== 'approved') {
      return res.status(400).send({
        success: false,
        message: 'Only approved campaigns can be featured'
      });
    }

    // Update featured status
    await db.sequelize.query(
      'UPDATE campaigns SET is_featured = ? WHERE id = ?',
      {
        replacements: [isFeatured, id],
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    res.status(200).send({
      success: true,
      message: `Campaign ${isFeatured ? 'added to' : 'removed from'} featured list`,
      data: { isFeatured }
    });

  } catch (error) {
    console.error('Toggle featured status error:', error);
    res.status(500).send({
      success: false,
      message: 'Error updating featured status',
      error: error.message
    });
  }
};

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get campaign counts by status
    const statusCounts = await db.sequelize.query(
      `SELECT 
         status,
         COUNT(*) as count
       FROM campaigns 
       GROUP BY status`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get user counts by type
    const userCounts = await db.sequelize.query(
      `SELECT 
         userType,
         COUNT(*) as count
       FROM users 
       GROUP BY userType`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get recent activity
    const recentActivity = await db.sequelize.query(
      `SELECT 
         c.id,
         c.title,
         c.status,
         c.created_at,
         c.submitted_at,
         c.approved_at,
         u.fullName as founder_name
       FROM campaigns c
       JOIN users u ON c.founder_id = u.id
       ORDER BY 
         CASE 
           WHEN c.submitted_at IS NOT NULL THEN c.submitted_at
           ELSE c.created_at
         END DESC
       LIMIT 10`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get total funding amounts
    const [fundingStats] = await db.sequelize.query(
      `SELECT 
         COUNT(*) as total_campaigns,
         SUM(target_amount) as total_target,
         SUM(current_amount) as total_raised,
         AVG(view_count) as avg_views
       FROM campaigns 
       WHERE status = 'approved'`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      data: {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}),
        userCounts: userCounts.reduce((acc, item) => {
          acc[item.userType] = item.count;
          return acc;
        }, {}),
        recentActivity,
        fundingStats
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Get all users for admin management
exports.getAllUsers = async (req, res) => {
  try {
    const { userType = 'all', page = 1, limit = 20 } = req.query;
    
    let whereClause = "WHERE userType != 'admin'"; // Don't show admin users
    let replacements = [];
    
    if (userType !== 'all') {
      whereClause += ' AND userType = ?';
      replacements.push(userType);
    }
    
    const offset = (page - 1) * limit;
    
    const users = await db.sequelize.query(
      `SELECT 
         id, email, fullName, userType, companyName, 
         phoneNumber, isActive, isVerified, createdAt,
         (SELECT COUNT(*) FROM campaigns WHERE founder_id = users.id) as campaign_count
       FROM users 
       ${whereClause}
       ORDER BY createdAt DESC 
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, parseInt(limit), parseInt(offset)],
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Get total count
    const [countResult] = await db.sequelize.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      {
        replacements: replacements,
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).send({
      success: true,
      data: users,
      pagination: {
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult.total / limit)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

module.exports = {
  getAllCampaignsForReview: exports.getAllCampaignsForReview,
  getCampaignForReview: exports.getCampaignForReview,
  approveCampaign: exports.approveCampaign,
  rejectCampaign: exports.rejectCampaign,
  toggleFeaturedStatus: exports.toggleFeaturedStatus,
  getDashboardStats: exports.getDashboardStats,
  getAllUsers: exports.getAllUsers
};