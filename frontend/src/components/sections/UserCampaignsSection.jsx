import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CustomNav } from '../../hooks/CustomNavigation';
import CampaignService from '../../services/CampaignService';
import { buildImageUrl } from '../../config/apiUrl';

// ── Compact horizontal card used in the 2×2 grid ────────────────────────────
const CompactCard = ({ campaign, onClick }) => {
  const imageUrl = campaign.main_image_url
    ? campaign.main_image_url.startsWith('http')
      ? campaign.main_image_url
      : buildImageUrl(campaign.main_image_url)
    : '/assets/placeholder-campaign.jpg';

  const pct = Math.min(
    Math.round(((campaign.current_amount || 0) / (campaign.target_amount || 1)) * 100),
    100
  );

  const fmt = (n) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 bg-white/8 hover:bg-white/14 backdrop-blur-sm rounded-2xl p-3 cursor-pointer group transition-colors"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={imageUrl} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = '/assets/placeholder-campaign.jpg'; }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-primary-400 uppercase tracking-wide">{campaign.category}</span>
        <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 mt-0.5 group-hover:text-primary-300 transition-colors">
          {campaign.title}
        </h4>
        {/* Mini progress */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-primary-300 font-medium flex-shrink-0">{pct}%</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{fmt(campaign.current_amount)} raised</p>
      </div>
    </motion.div>
  );
};

// ── Hero tall card ────────────────────────────────────────────────────────────
const HeroCard = ({ campaign, onClick }) => {
  const imageUrl = campaign.main_image_url
    ? campaign.main_image_url.startsWith('http')
      ? campaign.main_image_url
      : buildImageUrl(campaign.main_image_url)
    : '/assets/placeholder-campaign.jpg';

  const pct = Math.min(
    Math.round(((campaign.current_amount || 0) / (campaign.target_amount || 1)) * 100),
    100
  );

  const fmt = (n) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.3 }}
      className="relative h-full min-h-[420px] rounded-3xl overflow-hidden cursor-pointer group"
    >
      <img src={imageUrl} alt={campaign.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => { e.target.src = '/assets/placeholder-campaign.jpg'; }} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Featured badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-yellow-400/90 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
        <Star className="h-3 w-3 fill-current" /> FEATURED
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="text-xs font-semibold text-primary-400 uppercase tracking-widest">{campaign.category}</span>
        <h3 className="text-2xl font-bold text-white mt-1 mb-2 leading-tight group-hover:text-primary-300 transition-colors">
          {campaign.title}
        </h3>
        <p className="text-gray-300 text-sm line-clamp-2 mb-4">{campaign.description}</p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{fmt(campaign.current_amount)} raised</span>
            <span className="text-primary-400 font-semibold">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-400 to-primary-300 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-500/30 flex items-center justify-center text-white text-xs font-bold">
              {(campaign.founder_name || 'A').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-300">{campaign.founder_name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-1 text-primary-400 text-sm font-semibold group-hover:gap-2 transition-all">
            <span>View</span><ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main section ──────────────────────────────────────────────────────────────
const UserCampaignsSection = () => {
  const { isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = CustomNav();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await CampaignService.getFeaturedCampaigns(5);
        // fallback to all campaigns if not enough featured
        if (data.length < 3) {
          const all = await CampaignService.getAllCampaigns({ limit: 5 });
          setCampaigns(all.slice(0, 5));
        } else {
          setCampaigns(data.slice(0, 5));
        }
      } catch {
        try {
          const all = await CampaignService.getAllCampaigns({ limit: 5 });
          setCampaigns(all.slice(0, 5));
        } catch { /* silent */ }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [hero, ...rest] = campaigns;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-primary-950" />
      <img src="/assets/featured-bg.png" alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary-400" />
              <span className="text-primary-400 font-semibold text-sm uppercase tracking-widest">Top Picks</span>
            </div>
            <h2 className="text-4xl font-bold text-white">Campaigns to Watch</h2>
            <p className="text-gray-400 mt-2">Hand-picked opportunities from across Africa</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors"
          >
            <span>Browse all</span><ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-6">No featured campaigns yet.</p>
            <button onClick={() => navigate('/dashboard')}
              className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-full inline-flex items-center gap-2">
              <span>Browse All Startups</span><ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Hero card — spans 2 cols */}
            {hero && (
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <HeroCard campaign={hero} onClick={() => navigate(`/campaign/${hero.id}`)} />
              </motion.div>
            )}

            {/* 2×2 compact grid — spans 3 cols */}
            <motion.div
              className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            >
              {rest.slice(0, 4).map((c, i) => (
                <motion.div key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                >
                  <CompactCard campaign={c} onClick={() => navigate(`/campaign/${c.id}`)} />
                </motion.div>
              ))}

              {/* CTA tile if fewer than 4 side campaigns */}
              {rest.length < 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  onClick={() => navigate('/dashboard')}
                  className="flex flex-col items-center justify-center gap-3 bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 rounded-2xl p-6 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-primary-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-primary-300 font-semibold text-sm text-center">Explore more startups</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="text-center mt-10 md:hidden">
          <button onClick={() => navigate('/dashboard')}
            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-full inline-flex items-center gap-2">
            <span>View All Campaigns</span><ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Sign-in nudge for guests */}
        {!isAuthenticated() && campaigns.length > 0 && (
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-sm">
              Want to save campaigns and track your investments?{' '}
              <button onClick={() => navigate('/register')}
                className="text-primary-400 hover:text-primary-300 font-semibold underline underline-offset-2">
                Create a free account
              </button>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default UserCampaignsSection;
