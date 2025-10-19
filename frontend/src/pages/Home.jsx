import React from 'react';
import { Link } from 'react-router-dom';
import UnifiedNavbar from '../components/layout/Navbars';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import FeaturedStartups from '../components/sections/FeaturedStartups';
import UserCampaignsSection from '../components/sections/UserCampaignsSection';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar with Search Bar */}
      <UnifiedNavbar 
        variant="default" 
        showSearch={true} 
        showNavLinks={true}
      />
      
      <main>
        <HeroSection />
        <FeaturedStartups />
        <FeaturesSection />
        <UserCampaignsSection />  
      </main>
      
      {/* Call to Action Section */}
      <div className="px-4 py-2">
        <div className="md:flex flex-col items-center justify-center border-4 border-purple-400 bg-green-800 rounded-3xl py-12 px-8 text-center">
          <h2 className="text-4xl font-bold font-sans text-white mb-4">
            Got any questions for us?
          </h2>
          <p className="text-xl text-white font-inter max-w-2xl mx-auto">
            Help is here. Uncover answers to your burning questions in our&nbsp; 
            <Link to="/faq" className="text-purple-400 hover:text-purple-300 underline">
              help center
            </Link>
            &nbsp;or&nbsp;
            <Link to="/about" className="text-purple-400 hover:text-purple-300 underline"> 
              contact us!
            </Link>
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;