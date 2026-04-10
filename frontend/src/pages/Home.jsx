import React from 'react';
import UnifiedNavbar from '../components/layout/Navbars';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import SocialProofStrip from '../components/sections/SocialProofStrip';
import FeaturedStartups from '../components/sections/FeaturedStartups';
import HowItWorks from '../components/sections/HowItWorks';
import FeaturesSection from '../components/sections/FeaturesSection';
import Testimonials from '../components/sections/Testimonials';
import UserCampaignsSection from '../components/sections/UserCampaignsSection';
import SplitCTA from '../components/sections/SplitCTA';

const Home = () => (
  <div className="min-h-screen bg-white">
    <UnifiedNavbar variant="default" showSearch={true} showNavLinks={true} />

    <main>
      <HeroSection />
      <SocialProofStrip />
      <FeaturedStartups />
      <HowItWorks />
      <FeaturesSection />
      <Testimonials />
      <UserCampaignsSection />
      <SplitCTA />
    </main>

    <Footer />
  </div>
);

export default Home;
