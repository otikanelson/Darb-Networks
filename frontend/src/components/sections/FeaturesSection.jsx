import React from 'react';
import { ShieldCheck, BarChart3, Globe2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Globe2,
    title: 'Continental Investor Network',
    description: 'Access a curated network of verified investors from Nigeria, Kenya, Ghana, South Africa, and beyond — all in one place.',
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    icon: ShieldCheck,
    title: 'Milestone-Based Funding',
    description: 'Funds are held in escrow and released as you hit pre-defined milestones, giving investors confidence and founders accountability.',
    accent: 'text-primary-600 bg-primary-50',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track investor engagement, funding progress, and campaign performance with a live dashboard built for founders.',
    accent: 'text-purple-600 bg-purple-50',
  },
  {
    icon: Zap,
    title: 'Fast Campaign Launch',
    description: 'Go from idea to live campaign in under an hour. Our guided editor handles the structure so you can focus on your story.',
    accent: 'text-orange-600 bg-orange-50',
  },
];

const FeaturesSection = () => (
  <section className="py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Why Darb</span>
        <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Built for African startups</h2>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Every feature is designed around the unique challenges and opportunities of the African startup ecosystem.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, title, description, accent }, i) => (
          <motion.div
            key={title}
            className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-md transition-all duration-200 cursor-default"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center mb-5`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
