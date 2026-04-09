import React, { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp, Users, Target, Award } from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const navigate = CustomNav();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hero background images - using campaign-related stock photos
  const heroImages = [
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200', // Team collaboration
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200', // Startup workspace
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200', // Business meeting
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200', // Office work
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200', // Team success
  ];

  // Auto-scroll background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStartCampaignClick = () => {
    if (user?.userType?.toLowerCase() === "founder") {
      navigate('/pages/CreateCampaign');
    } else if (user?.userType?.toLowerCase() === "investor") {
      navigate('/Register');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="relative py-32 overflow-hidden">
      {/* Auto-scrolling Background Images */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={image}
              alt={`Hero background ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-green-900/90" />
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Join 2,847+ funded startups</span>
            </div>
            
            <h1 className="text-5xl md:text-5xl font-extrabold text-white leading-tight">
              Fund your startup dream with our{' '}
              <span className="text-green-400">continental investor network</span>
            </h1>
            
            <p className="text-xl text-gray-300 font-inter leading-relaxed">
              Connect with verified investors, showcase your innovation, and get the funding you need to turn your vision into reality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleStartCampaignClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-full flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
              >
                <span>Start Campaign</span>
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-8 py-4 rounded-full border-2 border-white/30 transition-all"
              >
                Explore Startups
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-white text-sm">18K+ Investors</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-400" />
                <span className="text-white text-sm">94% Success Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-400" />
                <span className="text-white text-sm">$142M+ Funded</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Compact Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
              <div className="text-4xl font-bold text-white mb-2">$142M+</div>
              <div className="text-green-300 text-sm font-medium mb-1">Total Funded</div>
              <div className="text-green-400 text-xs">12.5% this month</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
              <div className="text-4xl font-bold text-white mb-2">2,847</div>
              <div className="text-green-300 text-sm font-medium mb-1">Startups Funded</div>
              <div className="text-green-400 text-xs">85 new this week</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
              <div className="text-4xl font-bold text-white mb-2">18,392</div>
              <div className="text-green-300 text-sm font-medium mb-1">Active Investors</div>
              <div className="text-green-400 text-xs">245 joined today</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
              <div className="text-4xl font-bold text-white mb-2">94%</div>
              <div className="text-green-300 text-sm font-medium mb-1">Success Rate</div>
              <div className="text-green-400 text-xs">2.4% improvement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentImageIndex 
                ? 'bg-green-400 w-8' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
