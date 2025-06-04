import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import FeaturedStartups from '../components/sections/FeaturedStartups';
import UserCampaignsSection from '../components/sections/UserCampaignsSection';
import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
      <HeroSection />
        <FeaturedStartups />
        <FeaturesSection />
        <UserCampaignsSection />  
      </main>
      <div class="px-4 py-2">
        <div class="md:flex flex-col items-center justify-center border-4 border-purple-400  bg-green-800 rounded-3xl py-12 px-8 text-center">
          <h2 class="text-4xl font-bold font-sans text-white mb-4">Got any questions for us?</h2>
          <p class="text-xl text-white font-inter max-w-2xl mx-auto">
            Help is here. Uncover answers to your burning questions in our help center or contact us!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;