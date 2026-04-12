import React from 'react';
import { ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { CustomNav } from '../../hooks/CustomNavigation';
import { useAuth } from '../../context/AuthContext';
import CountrySelector from '../ui/CountrySelector';
import WavingFlag from '../ui/WavingFlag';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

const HeroSection = () => {
  const navigate = CustomNav();
  const { user } = useAuth();

  const handleCampaignClick = () => {
    if (user?.userType?.toLowerCase() === 'founder') {
      navigate('/pages/CreateCampaign');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-950">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1600&q=80"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900/95 to-primary-950/80" />
        {/* Decorative blobs — subtle slow pulse */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary-400/5 rounded-full blur-2xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Country Selector - Top Right */}
      <div className="absolute top-8 right-8 z-20">
        <CountrySelector variant="hero" />
      </div>

      {/* Waving Flag - Larger, Faded Background, No Pole */}
      <div 
        className="absolute right-8 top-1/2 z-0 opacity-20 pointer-events-none" 
        style={{ 
          transform: 'translateY(-50%) rotate(-12deg) scaleX(-1)',
          transformOrigin: 'center center'
        }}
      >
        <WavingFlag />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-24 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div {...fadeUp(0)} className="inline-flex items-center space-x-2 bg-primary-500/15 border border-primary-500/25 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-primary-300 text-sm font-medium">Africa's leading startup funding platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6">
            Fund your startup
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-tertiary-300">
              with confidence.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p {...fadeUp(0.2)} className="text-xl text-gray-300 leading-relaxed mb-10 max-w-xl">
            Connect with verified investors across the continent, showcase your innovation, and get the funding you need to grow.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCampaignClick}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-full flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
            >
              <span>Start Your Campaign</span>
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/8 backdrop-blur-sm hover:bg-secondary-600/20 text-white font-semibold px-8 py-4 rounded-full border border-secondary-400/30 transition-all flex items-center justify-center space-x-2"
            >
              <Play size={16} className="fill-white" />
              <span>Explore Startups</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
