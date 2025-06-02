// Create this file: services/campaignStatsService.js
// Helper service for updating campaign statistics

const db = require("../models");

class CampaignStatsService {
  /**
   * Update campaign view count
   */
  static async updateViewCount(campaignId) {
    try {
      await db.sequelize.query(
        `UPDATE campaigns 
         SET view_count = (
           SELECT COUNT(*) 
           FROM campaign_views 
           WHERE campaign_id = ?
         ) 
         WHERE id = ?`,
        {
          replacements: [campaignId, campaignId],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );
      console.log(`✅ Updated view count for campaign ${campaignId}`);
    } catch (error) {
      console.error('❌ Error updating view count:', error);
    }
  }

  /**
   * Update campaign favorite count
   */
  static async updateFavoriteCount(campaignId) {
    try {
      await db.sequelize.query(
        `UPDATE campaigns 
         SET favorite_count = (
           SELECT COUNT(*) 
           FROM campaign_favorites 
           WHERE campaign_id = ?
         ) 
         WHERE id = ?`,
        {
          replacements: [campaignId, campaignId],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );
      console.log(`✅ Updated favorite count for campaign ${campaignId}`);
    } catch (error) {
      console.error('❌ Error updating favorite count:', error);
    }
  }

  /**
   * Update campaign investment statistics
   */
  static async updateInvestmentStats(campaignId) {
    try {
      await db.sequelize.query(
        `UPDATE campaigns 
         SET 
           current_amount = (
             SELECT COALESCE(SUM(amount), 0) 
             FROM campaign_investments 
             WHERE campaign_id = ? AND payment_status = 'completed'
           ),
           investor_count = (
             SELECT COUNT(DISTINCT investor_id) 
             FROM campaign_investments 
             WHERE campaign_id = ? AND payment_status = 'completed'
           )
         WHERE id = ?`,
        {
          replacements: [campaignId, campaignId, campaignId],
          type: db.sequelize.QueryTypes.UPDATE
        }
      );
      console.log(`✅ Updated investment stats for campaign ${campaignId}`);
    } catch (error) {
      console.error('❌ Error updating investment stats:', error);
    }
  }

  /**
   * Update all statistics for a campaign
   */
  static async updateAllStats(campaignId) {
    try {
      await Promise.all([
        this.updateViewCount(campaignId),
        this.updateFavoriteCount(campaignId),
        this.updateInvestmentStats(campaignId)
      ]);
      console.log(`✅ Updated all stats for campaign ${campaignId}`);
    } catch (error) {
      console.error('❌ Error updating all stats:', error);
    }
  }

  /**
   * Recalculate statistics for all campaigns (maintenance function)
   */
  static async recalculateAllCampaignStats() {
    try {
      console.log('🔄 Recalculating all campaign statistics...');
      
      const campaigns = await db.sequelize.query(
        'SELECT id FROM campaigns',
        { type: db.sequelize.QueryTypes.SELECT }
      );

      for (const campaign of campaigns) {
        await this.updateAllStats(campaign.id);
      }

      console.log(`✅ Recalculated stats for ${campaigns.length} campaigns`);
      return { success: true, campaignsUpdated: campaigns.length };
      
    } catch (error) {
      console.error('❌ Error recalculating all campaign stats:', error);
      throw error;
    }
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(campaignId) {
    try {
      const [stats] = await db.sequelize.query(
        `SELECT 
           view_count,
           favorite_count,
           current_amount,
           investor_count,
           target_amount,
           (current_amount / target_amount * 100) as funding_percentage
         FROM campaigns 
         WHERE id = ?`,
        {
          replacements: [campaignId],
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return stats || {
        view_count: 0,
        favorite_count: 0,
        current_amount: 0,
        investor_count: 0,
        target_amount: 0,
        funding_percentage: 0
      };
    } catch (error) {
      console.error('❌ Error getting campaign stats:', error);
      return null;
    }
  }
}

module.exports = CampaignStatsService;