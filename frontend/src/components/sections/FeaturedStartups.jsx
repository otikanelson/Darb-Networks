// src/components/sections/FeaturedStartups.jsx - Kickstarter-style dynamic layout

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';
import CampaignCard from '../ui/CampaignCard';
import CampaignService from '../../services/CampaignService';
import { useAuth } from '../../context/AuthContext';

const FeaturedStartups = () => {
  const navigate = CustomNav();
  const { isAuthenticated } = useAuth();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Fetch featured campaigns
  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const campaigns = await CampaignService.getFeaturedCampaigns(9);
        setFeaturedCampaigns(campaigns);
      } catch (error) {
        console.error('Error fetching featured campaigns:', error);
        setError('Failed to load featured campaigns');
        setFeaturedCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedCampaigns();
  }, []);

  // Handle scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const updateScrollButtons = () => {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
      };

      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();

      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [featuredCampaigns]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -500, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 500, behavior: 'smooth' });
    }
  };

  const handleFavoriteToggle = async (campaignId) => {
    if (!isAuthenticated()) {
      alert('Please log in to save campaigns');
      return false;
    }
    
    try {
      return await CampaignService.toggleFavorite(campaignId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const handleViewClick = async (campaignId) => {
    try {
      await CampaignService.trackView(campaignId);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Create varied card sizes for Kickstarter-style layout
  const getCardStyle = (index) => {
    const patterns = [
      { width: 'w-80', marginTop: 'mt-0' },
      { width: 'w-96', marginTop: 'mt-8' },
      { width: 'w-80', marginTop: 'mt-4' },
      { width: 'w-[22rem]', marginTop: 'mt-0' },
      { width: 'w-80', marginTop: 'mt-6' },
      { width: 'w-96', marginTop: 'mt-2' },
    ];
    return patterns[index % patterns.length];
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-6 w-6 text-green-600" />
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wide">Featured Projects</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Trending Startups
            </h2>
            <p className="text-gray-600 mt-2">
              Discover innovative Nigerian startups making waves
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="hidden md:flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-4">{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors inline-flex items-center space-x-2"
            >
              <span>Browse All Startups</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : featuredCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-8">No featured campaigns available at the moment.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors inline-flex items-center space-x-2"
            >
              <span>Browse All Startups</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Scroll buttons */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-900 p-3 rounded-full shadow-xl border border-gray-200 transition-all transform hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 text-gray-900 p-3 rounded-full shadow-xl border border-gray-200 transition-all transform hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Gradient overlays for scroll indication */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            )}

            {/* Scrollable campaigns container with varied heights */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 px-12 items-start"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {featuredCampaigns.map((campaign, index) => {
                const style = getCardStyle(index);
                return (
                  <div
                    key={campaign.id}
                    className={`flex-none ${style.width} ${style.marginTop} transform transition-transform hover:-translate-y-2`}
                  >
                    <CampaignCard
                      campaign={campaign}
                      size="featured"
                      onFavoriteToggle={handleFavoriteToggle}
                      onViewClick={handleViewClick}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile view all button */}
        {featuredCampaigns.length > 0 && (
          <div className="text-center mt-8 md:hidden">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors inline-flex items-center space-x-2"
            >
              <span>View All Campaigns</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedStartups;
