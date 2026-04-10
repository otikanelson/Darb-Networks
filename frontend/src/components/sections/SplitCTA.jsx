import React from 'react';
import { Rocket, TrendingUp, ArrowRight } from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';

const SplitCTA = () => {
  const navigate = CustomNav();

  return (
    <section className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl overflow-hidden">
          {/* Founder side */}
          <div className="bg-gray-900 p-12 flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Rocket className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">
                Ready to launch?
              </h3>
              <p className="text-gray-400 leading-relaxed max-w-sm">
                Create your campaign in minutes and get in front of thousands of verified investors across Africa.
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="mt-8 self-start inline-flex items-center space-x-2 bg-green-500 hover:bg-green-400 text-white font-bold px-7 py-3.5 rounded-full transition-all transform hover:scale-105"
            >
              <span>Launch Your Campaign</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Investor side */}
          <div className="bg-green-700 p-12 flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">
                Start investing today.
              </h3>
              <p className="text-green-100 leading-relaxed max-w-sm">
                Discover high-potential African startups and invest with confidence through our milestone-based funding model.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-8 self-start inline-flex items-center space-x-2 bg-white hover:bg-green-50 text-green-700 font-bold px-7 py-3.5 rounded-full transition-all transform hover:scale-105"
            >
              <span>Explore Startups</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SplitCTA;
