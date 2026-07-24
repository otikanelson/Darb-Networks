import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, ChevronLeft, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomNav } from '../../hooks/CustomNavigation';
import { useAuth } from '../../context/AuthContext';
import CountrySelector from '../ui/CountrySelector';
import WavingFlag from '../ui/WavingFlag';
import CampaignService from '../../services/CampaignService';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

const HeroSection = () => {
  const navigate = CustomNav();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch featured campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await CampaignService.getFeaturedCampaigns(10);
        setCampaigns(data);
      } catch (e) {
        console.error('Error fetching featured campaigns:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Transition to carousel after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCarousel(true);
      setIsPlaying(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll every 3 seconds when carousel is active
  useEffect(() => {
    if (!isPlaying || !showCarousel || campaigns.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, showCarousel, campaigns.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  // Fetch featured campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await CampaignService.getFeaturedCampaigns(10);
        setCampaigns(data);
      } catch (e) {
        console.error('Error fetching featured campaigns:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Transition to carousel after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCarousel(true);
      setIsPlaying(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll every 3 seconds when carousel is active
  useEffect(() => {
    if (!isPlaying || !showCarousel || campaigns.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, showCarousel, campaigns.length]);

  const handleCampaignClick = () => {
    if (user?.userType?.toLowerCase() === 'founder') {
      navigate('/pages/CreateCampaign');
    } else {
      navigate('/register');
    }
  };

  const currentCampaign = campaigns[currentIndex];

  // Truncate description to 150 characters
  const truncateDescription = (text, limit = 150) => {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  // Truncate title to 60 characters
  const truncateTitle = (text, limit = 60) => {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  // Get background image - use campaign image if available, otherwise use default
  const backgroundImage = showCarousel && currentCampaign?.main_image_url
    ? currentCampaign.main_image_url
    : 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  return (
    /* Height adjusted from h-[85vh] sm:h-[90vh] to min-h-screen */
    <div className="relative min-h-screen flex items-center overflow-hidden bg-gray-950">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900/95 to-primary-950/80" />
        {/* Decorative blobs — subtle slow pulse */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary-500/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-primary-400/5 blur-2xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Country Selector - Top Right */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20">
        <CountrySelector variant="hero" />
      </div>

      {/* Waving Flag - Larger, Faded Background, No Pole - Hidden on mobile */}
      <div
        className="hidden md:block absolute right-8 top-1/2 z-0 opacity-20 pointer-events-none"
        style={{
          transform: 'translateY(-50%) rotate(-12deg) scaleX(-1)',
          transformOrigin: 'center center'
        }}
      >
        <WavingFlag />
      </div>

      {/* Container padding adjusted for full screen height */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 sm:py-24 w-full">
        {/* Inner block height adjusted to fit increased space */}
        <div className="max-w-3xl min-h-[500px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!showCarousel ? (
              // Original Hero Content
              <motion.div
                key="original-hero"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Badge */}
                <motion.div {...fadeUp(0)} className="inline-flex items-center space-x-2 border border-primary-500/25 px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8">
                  <span className="text-primary-100 text-xs sm:text-sm animate-pulse">Africa's leading startup funding platform</span>
                </motion.div>

                {/* Headline */}
                <motion.h1 {...fadeUp(0.1)} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] sm:leading-[1.05] mb-4 sm:mb-6">
                  Fund your startup
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-tertiary-300">
                    with confidence.
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p {...fadeUp(0.2)} className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-8 sm:mb-10 max-w-xl">
                  Connect with verified investors across the continent, showcase your innovation, and get the funding you need to grow.
                </motion.p>

                {/* CTAs */}
                <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleCampaignClick}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 text-sm sm:text-base"
                  >
                    <span>Start Your Campaign</span>
                    <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-white/8 backdrop-blur-sm hover:bg-secondary-600/20 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Play size={14} className="sm:w-4 sm:h-4 fill-white" />
                    <span>Explore Startups</span>
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              // Carousel Content
              <motion.div
                key="carousel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {loading ? (
                  <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
                  </div>
                ) : (
                  (() => {
                    const hasCampaigns = campaigns && campaigns.length > 0;
                    const title = hasCampaigns
                      ? truncateTitle(currentCampaign?.title, 60)
                      : "Fund your startup with confidence.";
                    const description = hasCampaigns
                      ? truncateDescription(currentCampaign?.description, 150)
                      : "Connect with verified investors across the continent, showcase your innovation, and get the funding you need to grow.";

                    return (
                      <>
                        {/* Badge */}
                        <motion.div
                          className="inline-flex items-center space-x-2 border border-primary-500/25 px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8 backdrop-blur-sm"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <span className="text-primary-300 text-xs sm:text-sm font-medium animate-pulse">
                            {hasCampaigns ? "Featured Campaigns" : "African Startup Ecosystem"}
                          </span>
                        </motion.div>

                        {/* Animated Hero Content */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={hasCampaigns ? currentIndex : "default-hero"}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            {/* Headline */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.2] sm:leading-[1.1] mb-3 sm:mb-4">
                              {title}
                            </h1>

                            {/* Description */}
                            <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed mb-6 sm:mb-8 max-w-2xl">
                              {description}
                            </p>
                          </motion.div>
                        </AnimatePresence>

                        {/* CTAs */}
                        <motion.div
                          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <button
                            onClick={() => navigate(hasCampaigns ? `/campaign/${currentCampaign?.id}` : '/dashboard')}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 text-sm sm:text-base"
                          >
                            <span>{hasCampaigns ? "View Campaign" : "Explore Startups"}</span>
                            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 border border-white/20 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                          >
                            <span>{hasCampaigns ? "Explore More" : "Start a Campaign"}</span>
                          </button>
                        </motion.div>

                        {/* Carousel Navigation Controls - Only rendered if campaigns exist */}
                        {hasCampaigns && (
                          <motion.div
                            className="flex items-center gap-2 mt-12 sm:mt-16"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          >
                            <button
                              onClick={handlePrevious}
                              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm"
                              aria-label="Previous campaign"
                            >
                              <ChevronLeft size={16} />
                            </button>

                            <button
                              onClick={handleNext}
                              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm"
                              aria-label="Next campaign"
                            >
                              <ChevronRight size={16} />
                            </button>

                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm"
                              aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                              {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-white" />}
                            </button>

                            <div className="flex gap-1.5 ml-3">
                              {campaigns.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentIndex(index)}
                                  className={`h-1.5 rounded-full transition-all ${index === currentIndex
                                      ? 'bg-primary-400 w-5'
                                      : 'bg-white/25 w-1.5 hover:bg-white/40'
                                    }`}
                                  aria-label={`Go to campaign ${index + 1}`}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </>
                    );
                  })()
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;