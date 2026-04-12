import ApiService from './apiService';
import { API_URL } from '../config/apiUrl';

const API_BASE_URL = API_URL;

class CampaignService {
  /**
   * Get all campaigns with optional filters (for dashboard)
   */
  static async getAllCampaigns(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'All Categories') {
        params.append('category', filters.category);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.page) {
        params.append('page', filters.page);
      }
      if (filters.limit) {
        params.append('limit', filters.limit);
      }
      if (filters.featured) {
        params.append('featured', filters.featured);
      }
      
      const url = `${API_BASE_URL}/campaigns${params.toString() ? '?' + params.toString() : ''}`;
      console.log('🔍 Fetching campaigns from:', url);
      
      const response = await ApiService.get(url);
      
      // Handle response format
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      throw error;
    }
  }

  /**
   * Get campaign by ID
   */
  static async getCampaignById(id) {
    try {
      console.log(`👀 Getting campaign ${id}`);
      
      const response = await ApiService.get(`${API_BASE_URL}/campaigns/${id}`);
      
      // Handle response format
      if (response && response.data) {
        return response.data;
      } else if (response && response.id) {
        return response;
      } else {
        throw new Error('Campaign not found');
      }
    } catch (error) {
      console.error('❌ Error fetching campaign:', error);
      throw error;
    }
  }

  /**
   * Get featured campaigns
   */
  static async getFeaturedCampaigns(limit = 6) {
    try {
      console.log('⭐ Fetching featured campaigns');
      
      const response = await ApiService.get(`${API_BASE_URL}/campaigns/featured?limit=${limit}`);
      
      // Handle response format
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('No featured campaigns found');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching featured campaigns:', error);
      return []; // Don't throw, just return empty array
    }
  }

  /**
   * Create a new campaign
   */
  static async createCampaign(campaignData) {
    try {
      console.log('📝 Creating campaign with data:', campaignData);
      
      const response = await ApiService.post(`${API_BASE_URL}/campaigns`, campaignData);
      
      console.log('✅ Campaign created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaigns created by the current user (for founders)
   */
  static async getCreatedCampaigns() {
    try {
      const response = await ApiService.get(`${API_BASE_URL}/campaigns/user/my-campaigns`);
      
      const raw = (response && response.data) ? response.data
                : (response && (response.drafts || response.all)) ? response
                : { drafts: [], submitted: [], approved: [], rejected: [], all: [] };

      // Normalize camelCase → snake_case so CampaignCard can read the fields
      const normalize = (list) => (list || []).map(c => ({
        ...c,
        main_image_url:    c.main_image_url    || c.mainImageUrl    || null,
        target_amount:     c.target_amount     ?? c.targetAmount    ?? 0,
        current_amount:    c.current_amount    ?? c.currentAmount   ?? 0,
        minimum_investment:c.minimum_investment?? c.minimumInvestment?? 0,
        view_count:        c.view_count        ?? c.viewCount       ?? 0,
        favorite_count:    c.favorite_count    ?? c.favoriteCount   ?? 0,
        is_featured:       c.is_featured       ?? c.isFeatured      ?? false,
        founder_name:      c.founder_name      || c.founderName     || '',
        founder_company:   c.founder_company   || c.founderCompany  || '',
        founder_avatar:    c.founder_avatar    || c.founderAvatar   || null,
        created_at:        c.created_at        || c.createdAt       || null,
        admin_comments:    c.admin_comments    || c.adminComments   || null,
      }));

      return {
        drafts:    normalize(raw.drafts),
        submitted: normalize(raw.submitted),
        approved:  normalize(raw.approved),
        rejected:  normalize(raw.rejected),
        all:       normalize(raw.all),
      };
    } catch (error) {
      console.error('❌ Error fetching created campaigns:', error);
      return { drafts: [], submitted: [], approved: [], rejected: [], all: [] };
    }
  }

  /**
   * Get campaigns the user has viewed recently
   */
  static async getViewedCampaigns() {
    try {
      console.log('👀 Fetching viewed campaigns');
      
      const response = await ApiService.get(`${API_BASE_URL}/campaigns/user/viewed`);
      
      // Handle response format
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching viewed campaigns:', error);
      return []; // Don't throw, just return empty array
    }
  }

  /**
   * Get campaigns the user has favorited
   */
  static async getFavoriteCampaigns() {
    try {
      console.log('❤️ Fetching favorite campaigns');
      
      const response = await ApiService.get(`${API_BASE_URL}/campaigns/user/favorites`);
      
      // Handle response format
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching favorite campaigns:', error);
      return []; // Don't throw, just return empty array
    }
  }

  /**
   * Get campaigns the user has funded (for investors)
   */
  static async getFundedCampaigns() {
    try {
      console.log('💰 Fetching funded campaigns');
      
      const response = await ApiService.get(`${API_BASE_URL}/campaigns/user/funded`);
      
      // Handle response format
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching funded campaigns:', error);
      return []; // Don't throw, just return empty array
    }
  }

  /**
   * Toggle favorite status for a campaign
   */
  static async toggleFavoriteCampaign(campaignId) {
    try {
      console.log(`💖 Toggling favorite for campaign ${campaignId}`);
      
      const response = await ApiService.post(`${API_BASE_URL}/campaigns/${campaignId}/favorite`);
      
      // Handle response format
      if (response && typeof response.isFavorited === 'boolean') {
        return response.isFavorited;
      } else if (response && response.data && typeof response.data.isFavorited === 'boolean') {
        return response.data.isFavorited;
      } else {
        // Default to true if we can't determine the status
        return true;
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Track a campaign view
   */
  static async trackCampaignView(campaignId) {
    try {
      console.log(`👁️ Tracking view for campaign ${campaignId}`);
      
      await ApiService.post(`${API_BASE_URL}/campaigns/${campaignId}/view`);
      
      console.log('✅ View tracked successfully');
    } catch (error) {
      console.error('❌ Error tracking view:', error);
      // Don't throw error for view tracking failures - it's not critical
    }
  }

  /**
   * Upload campaign image
   */
  static async uploadCampaignImage(campaignId, imageFile) {
    try {
      console.log(`📸 Uploading image for campaign ${campaignId}`);
      
      const formData = new FormData();
      formData.append('campaignImage', imageFile);
      
      const response = await ApiService.uploadFiles(
        `${API_BASE_URL}/campaigns/${campaignId}/image`,
        { campaignImage: imageFile }
      );
      
      console.log('✅ Image uploaded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error uploading campaign image:', error);
      throw error;
    }
  }

  /**
   * Update existing campaign
   */
  static async updateCampaign(campaignId, campaignData) {
    try {
      console.log('🔄 ===== FRONTEND UPDATE CAMPAIGN START =====');
      console.log('📝 Campaign ID:', campaignId);
      console.log('📦 Campaign Data:', JSON.stringify(campaignData, null, 2));
      
      const response = await ApiService.put(`${API_BASE_URL}/campaigns/${campaignId}`, campaignData);
      
      console.log('✅ Campaign updated successfully!');
      console.log('📤 Response:', JSON.stringify(response, null, 2));
      console.log('🔄 ===== FRONTEND UPDATE CAMPAIGN END =====');
      
      return response;
    } catch (error) {
      console.error('❌ ===== FRONTEND UPDATE CAMPAIGN ERROR =====');
      console.error('❌ Error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ =========================================');
      throw error;
    }
  }

  /**
   * Delete campaign
   */
  static async deleteCampaign(campaignId) {
    try {
      console.log(`🗑️ Deleting campaign ${campaignId}`);
      
      await ApiService.delete(`${API_BASE_URL}/campaigns/${campaignId}`);
      
      console.log('✅ Campaign deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Get all campaign data for My Campaigns page
   * Returns different data based on user type
   */
static async getAllMyCampaignsData(user) {
  try {
    if (!user) {
      throw new Error('User is required');
    }

    const isFounder = user.userType?.toLowerCase() === 'founder';
    const isInvestor = user.userType?.toLowerCase() === 'investor';

    console.log(`📊 Loading My Campaigns data for ${user.userType}`);

    const data = {
      viewed: [],
      favorites: [],
      created: { drafts: [], submitted: [], approved: [], rejected: [], all: [] },
      funded: []
    };

    // Load data in parallel for better performance
    const promises = [];

    // Always load viewed and favorites for all users
    promises.push(
      this.getViewedCampaigns()
        .then(result => { data.viewed = result; })
        .catch(error => {
          console.error('Error loading viewed campaigns:', error);
          data.viewed = [];
        })
    );

    promises.push(
      this.getFavoriteCampaigns()
        .then(result => { data.favorites = result; })
        .catch(error => {
          console.error('Error loading favorite campaigns:', error);
          data.favorites = [];
        })
    );

    // Load user-type specific data
    if (isFounder) {
      promises.push(
        this.getCreatedCampaigns()
          .then(result => { data.created = result; })
          .catch(error => {
            console.error('Error loading created campaigns:', error);
            data.created = { drafts: [], submitted: [], approved: [], rejected: [], all: [] };
          })
      );
    }

    if (isInvestor) {
      promises.push(
        this.getFundedCampaigns()
          .then(result => { data.funded = result; })
          .catch(error => {
            console.error('Error loading funded campaigns:', error);
            data.funded = [];
          })
      );
    }

    await Promise.all(promises);

    return data;
  } catch (error) {
    console.error('❌ Error loading My Campaigns data:', error);
    return {
      viewed: [],
      favorites: [],
      created: { drafts: [], submitted: [], approved: [], rejected: [], all: [] },
      funded: []
    };
  }
}

  // ============= BACKWARD COMPATIBILITY METHODS =============

  /**
   * Toggle favorite (alias for toggleFavoriteCampaign)
   */
  static async toggleFavorite(campaignId) {
    return this.toggleFavoriteCampaign(campaignId);
  }

  /**
   * Track view (alias for trackCampaignView)
   */
  static async trackView(campaignId) {
    return this.trackCampaignView(campaignId);
  }

  /**
   * Get campaigns (alias for getAllCampaigns)
   */
  static async getCampaigns(filters = {}) {
    return this.getAllCampaigns(filters);
  }

  // ============= UTILITY METHODS =============

  /**
   * Format campaign data for consistent frontend use
   */
  static formatCampaignData(campaign) {
    if (!campaign) return null;

    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      location: campaign.location,
      targetAmount: campaign.target_amount || campaign.targetAmount,
      currentAmount: campaign.current_amount || campaign.currentAmount || 0,
      minimumInvestment: campaign.minimum_investment || campaign.minimumInvestment,
      mainImageUrl: campaign.main_image_url || campaign.mainImageUrl,
      videoUrl: campaign.video_url || campaign.videoUrl,
      status: campaign.status,
      isFeatured: campaign.is_featured || campaign.isFeatured || false,
      viewCount: campaign.view_count || campaign.viewCount || 0,
      favoriteCount: campaign.favorite_count || campaign.favoriteCount || 0,
      founderName: campaign.founder_name || campaign.founderName,
      founderCompany: campaign.founder_company || campaign.founderCompany,
      founderAvatar: campaign.founder_avatar || campaign.founderAvatar,
      createdAt: campaign.created_at || campaign.createdAt,
      updatedAt: campaign.updated_at || campaign.updatedAt,
      submittedAt: campaign.submitted_at || campaign.submittedAt,
      approvedAt: campaign.approved_at || campaign.approvedAt
    };
  }

  /**
   * Clear any cached data (for future use)
   */
  static clearCache() {
    console.log('🧹 Clearing campaign cache');
    // Future implementation for caching
  }
}

export default CampaignService;