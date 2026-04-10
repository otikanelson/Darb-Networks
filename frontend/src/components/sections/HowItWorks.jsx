import React from 'react';
import { FileText, Users2, Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CustomNav } from '../../hooks/CustomNavigation';

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Create Your Campaign',
    description: 'Build a compelling campaign page with your pitch, financials, and milestones. Our guided editor makes it simple.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Users2,
    step: '02',
    title: 'Get Matched with Investors',
    description: 'Our platform surfaces your campaign to verified investors who align with your industry and funding stage.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Get Funded & Grow',
    description: 'Receive funds as you hit milestones. Track progress, communicate with investors, and scale your startup.',
    color: 'bg-purple-50 text-purple-600',
  },
];

const HowItWorks = () => {
  const navigate = CustomNav();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">How it works</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">From idea to funded in 3 steps</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            We've simplified the fundraising journey so you can focus on building, not paperwork.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 z-0" />

          {steps.map(({ icon: Icon, step, title, description, color }, i) => (
            <motion.div
              key={step}
              className="relative z-10 flex flex-col items-center text-center group"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-9 w-9" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
