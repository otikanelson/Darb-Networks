import React, { useState } from 'react';
import { Rocket, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CustomNav } from '../../hooks/CustomNavigation';
import { useAuth } from '../../context/AuthContext';

const SplitCTA = () => {
  const navigate = CustomNav();
  const { user } = useAuth();
  const [hovered, setHovered] = useState(null);

  const handleCampaignClick = () => {
    if (user?.userType?.toLowerCase() === 'founder') {
      navigate('/pages/CreateCampaign');
    } else {
      navigate('/register');
    }
  };

  // flex-grow values: expanded card gets 1.6, shrunk card gets 0.4
  const founderGrow  = hovered === 'investor' ? 0.6 : hovered === 'founder' ? 1.4 : 1;
  const investorGrow = hovered === 'founder'  ? 0.6 : hovered === 'investor' ? 1.4 : 1;

  return (
    <section className="py-4 sm:py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row rounded-2xl sm:rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Founder side */}
          <motion.div
            className="bg-gray-900 p-8 sm:p-10 md:p-12 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] cursor-pointer overflow-hidden"
            style={{ flexGrow: founderGrow, flexBasis: 0 }}
            animate={{ flexGrow: founderGrow }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            onMouseEnter={() => setHovered('founder')}
            onMouseLeave={() => setHovered(null)}
          >
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Ready to launch?</h3>
              <motion.p
                className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-sm"
                animate={{ opacity: hovered === 'investor' ? 0.4 : 1 }}
                transition={{ duration: 0.3 }}
              >
                Create your campaign in minutes and get in front of thousands of verified investors across Africa.
              </motion.p>
            </div>
            <button
              onClick={handleCampaignClick}
              className="mt-6 sm:mt-8 self-start inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all transform hover:scale-105 text-sm sm:text-base"
            >
              <span>Launch Your Campaign</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </motion.div>

          {/* Investor side */}
          <motion.div
            className="bg-primary-700 p-8 sm:p-10 md:p-12 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] cursor-pointer overflow-hidden"
            style={{ flexGrow: investorGrow, flexBasis: 0 }}
            animate={{ flexGrow: investorGrow }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            onMouseEnter={() => setHovered('investor')}
            onMouseLeave={() => setHovered(null)}
          >
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/15 rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Start investing today.</h3>
              <motion.p
                className="text-primary-100 text-sm sm:text-base leading-relaxed max-w-sm"
                animate={{ opacity: hovered === 'founder' ? 0.4 : 1 }}
                transition={{ duration: 0.3 }}
              >
                Discover high-potential African startups and invest with confidence through our milestone-based funding model.
              </motion.p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 sm:mt-8 self-start inline-flex items-center space-x-2 bg-white hover:bg-primary-50 text-primary-700 font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all transform hover:scale-105 text-sm sm:text-base"
            >
              <span>Explore Startups</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SplitCTA;
