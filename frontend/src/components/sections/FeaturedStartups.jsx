import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, Users } from 'lucide-react';
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
        const data = await CampaignService.getFeaturedCampaigns(3); // Grab top 3 for uniform grid
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
    try { await CampaignService.trackView(campaignId); } catch { }
  };

  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
              <span className="text-primary-600 font-semibold text-xs sm:text-sm uppercase tracking-widest">
                Featured Projects
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">Trending Startups</h2>
            <p className="text-xs sm:text-base text-gray-500 mt-1 sm:mt-2">
              Innovative African startups making waves right now
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : error || campaigns.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm sm:text-lg mb-6">{error || 'No featured campaigns yet.'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 inline-flex items-center space-x-2 rounded-lg"
            >
              <span>Browse All Startups</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Clean, Uniform Grid (3 equal cards with natural uncropped aspect ratios) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.slice(0, 3).map((campaign, index) => (
                <motion.div
                  key={campaign.id || campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <CampaignCard
                    campaign={campaign}
                    onFavoriteToggle={handleFavoriteToggle}
                    onViewClick={handleViewClick}
                  />
                </motion.div>
              ))}
            </div>

            {/* Full Width Value Banner Below Grid */}
            <motion.div 
              className="bg-gray-900 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-2xl">
                <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest mb-1">
                  Why invest on Darb?
                </p>
                <h3 className="text-white font-bold text-lg sm:text-xl leading-snug mb-3">
                  Milestone-based funding keeps your capital protected.
                </h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {[
                    { icon: ShieldCheck, text: 'Funds released on verified milestones' },
                    { icon: TrendingUp, text: 'Real-time campaign analytics' },
                    { icon: Users, text: '18K+ verified investors' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
                      <Icon className="h-4 w-4 text-primary-400 flex-shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/register')}
                className="flex-shrink-0 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        )}

        {/* Mobile View All Button */}
        {campaigns.length > 0 && (
          <div className="text-center mt-8 md:hidden">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center space-x-2"
            >
              <span>View All Campaigns</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedStartups;