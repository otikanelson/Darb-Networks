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
    try { await CampaignService.trackView(campaignId); } catch { }
  };

  const [spotlight, ...rest] = campaigns;

  // Custom Compact Mobile Row for list view
  const CompactMobileRow = ({ campaign }) => {
    const progress = Math.min(
      Math.round(((campaign.raisedAmount || campaign.currentAmount || 0) / (campaign.targetAmount || campaign.goalAmount || 1)) * 100),
      100
    );

    return (
      <div
        onClick={() => {
          handleViewClick(campaign.id || campaign._id);
          navigate(`/campaigns/${campaign.id || campaign._id}`);
        }}
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <img
          src={campaign.imageUrl || campaign.coverImage || '/placeholder.jpg'}
          alt={campaign.title}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
        />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
            {campaign.category || 'Startup'}
          </span>
          <h4 className="text-sm font-bold text-gray-900 truncate leading-snug">
            {campaign.title}
          </h4>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-600">{progress}%</span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-1" />
      </div>
    );
  };

  return (
    <section className="py-12 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-6 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center space-x-2 mb-1 sm:mb-2">
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
          <div className="flex justify-center py-12 sm:py-24">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : error || campaigns.length === 0 ? (
          <div className="text-center py-12 sm:py-24">
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
          <>
            {/* --- MOBILE COMPACT LIST VIEW (< sm) --- */}
            <div className="flex flex-col gap-3 sm:hidden">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id || campaign._id}
                  campaign={campaign}
                  size="compact" // or whatever compact size prop CampaignCard expects
                  onFavoriteToggle={handleFavoriteToggle}
                  onViewClick={handleViewClick}
                />
              ))}
            </div>

            {/* --- DESKTOP GRID VIEW (>= sm) --- */}
            <div className="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Spotlight + promo panel */}
              {spotlight && (
                <motion.div
                  className="lg:col-span-2 flex flex-col gap-6"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                  <CampaignCard
                    campaign={spotlight}
                    size="preview"
                    onFavoriteToggle={handleFavoriteToggle}
                    onViewClick={handleViewClick}
                  />

                  {/* Filler promo panel */}
                  <div className="flex-1 bg-gray-900 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex-1">
                      <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest mb-2">Why invest on Darb?</p>
                      <h3 className="text-white font-bold text-lg leading-snug mb-4">
                        Milestone-based funding keeps your capital protected.
                      </h3>
                      <div className="flex flex-col gap-2">
                        {[
                          { icon: ShieldCheck, text: 'Funds released only on verified milestones' },
                          { icon: TrendingUp, text: 'Real-time campaign analytics' },
                          { icon: Users, text: '18K+ verified investors on the platform' },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text} className="flex items-center gap-2 text-gray-300 text-sm">
                            <Icon className="h-4 w-4 text-primary-400 flex-shrink-0" />
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/register')}
                      className="flex-shrink-0 self-start sm:self-center inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all"
                    >
                      Get started
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Side stack */}
              <div className="flex flex-col gap-6">
                {rest.slice(0, 2).map((campaign, i) => (
                  <motion.div
                    key={campaign.id || campaign._id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.12 }}
                  >
                    <CampaignCard
                      campaign={campaign}
                      size="preview"
                      onFavoriteToggle={handleFavoriteToggle}
                      onViewClick={handleViewClick}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mobile View All Button */}
        {campaigns.length > 0 && (
          <div className="text-center mt-6 sm:mt-10 md:hidden">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center justify-center space-x-2"
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