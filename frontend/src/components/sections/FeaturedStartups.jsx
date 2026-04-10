import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { CustomNav } from '../../hooks/CustomNavigation';
import CampaignCard from '../ui/CampaignCard';
import CampaignService from '../../services/CampaignService';
import { useAuth } from '../../context/AuthContext';

const FeaturedStartups = () => {
  const navigate = CustomNav();
  const { isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await CampaignService.getFeaturedCampaigns(4);
        setCampaigns(data);
      } catch (e) {
        console.error('Error fetching featured campaigns:', e);
        setError('Failed to load featured campaigns');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleFavoriteToggle = async (campaignId) => {
    if (!isAuthenticated()) { alert('Please log in to save campaigns'); return false; }
    try { return await CampaignService.toggleFavorite(campaignId); } catch { return false; }
  };

  const handleViewClick = async (campaignId) => {
    try { await CampaignService.trackView(campaignId); } catch {}
  };

  const [spotlight, ...rest] = campaigns;

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Featured Projects</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Trending Startups</h2>
            <p className="text-gray-500 mt-2">Innovative African startups making waves right now</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
          </div>
        ) : error || campaigns.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg mb-6">{error || 'No featured campaigns yet.'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full inline-flex items-center space-x-2"
            >
              <span>Browse All Startups</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spotlight */}
            {spotlight && (
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <CampaignCard
                  campaign={spotlight}
                  size="featured"
                  onFavoriteToggle={handleFavoriteToggle}
                  onViewClick={handleViewClick}
                />
              </motion.div>
            )}

            {/* Side stack */}
            <div className="flex flex-col gap-6">
              {rest.slice(0, 2).map((campaign, i) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.12 }}
                >
                  <CampaignCard
                    campaign={campaign}
                    size="compact"
                    onFavoriteToggle={handleFavoriteToggle}
                    onViewClick={handleViewClick}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile view all */}
        {campaigns.length > 0 && (
          <div className="text-center mt-10 md:hidden">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full inline-flex items-center space-x-2"
            >
              <span>View All Campaigns</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedStartups;
