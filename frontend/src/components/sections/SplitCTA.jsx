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
    <section className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Founder side */}
          <motion.div
            className="bg-gray-900 p-12 flex flex-col justify-between min-h-[320px] cursor-pointer overflow-hidden"
            style={{ flexGrow: founderGrow, flexBasis: 0 }}
            animate={{ flexGrow: founderGrow }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            onMouseEnter={() => setHovered('founder')}
            onMouseLeave={() => setHovered(null)}
          >
            <div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Rocket className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 whitespace-nowrap">Ready to launch?</h3>
              <motion.p
                className="text-gray-400 leading-relaxed max-w-sm"
                animate={{ opacity: hovered === 'investor' ? 0.4 : 1 }}
                transition={{ duration: 0.3 }}
              >
                Create your campaign in minutes and get in front of thousands of verified investors across Africa.
              </motion.p>
            </div>
            <button
              onClick={handleCampaignClick}
              className="mt-8 self-start inline-flex items-center space-x-2 bg-green-500 hover:bg-green-400 text-white font-bold px-7 py-3.5 rounded-full transition-all transform hover:scale-105"
            >
              <span>Launch Your Campaign</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>

          {/* Investor side */}
          <motion.div
            className="bg-green-700 p-12 flex flex-col justify-between min-h-[320px] cursor-pointer overflow-hidden"
            style={{ flexGrow: investorGrow, flexBasis: 0 }}
            animate={{ flexGrow: investorGrow }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            onMouseEnter={() => setHovered('investor')}
            onMouseLeave={() => setHovered(null)}
          >
            <div>
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 whitespace-nowrap">Start investing today.</h3>
              <motion.p
                className="text-green-100 leading-relaxed max-w-sm"
                animate={{ opacity: hovered === 'founder' ? 0.4 : 1 }}
                transition={{ duration: 0.3 }}
              >
                Discover high-potential African startups and invest with confidence through our milestone-based funding model.
              </motion.p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-8 self-start inline-flex items-center space-x-2 bg-white hover:bg-green-50 text-green-700 font-bold px-7 py-3.5 rounded-full transition-all transform hover:scale-105"
            >
              <span>Explore Startups</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SplitCTA;
