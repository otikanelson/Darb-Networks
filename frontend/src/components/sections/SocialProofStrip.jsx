import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Target, Award } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

// Animates a number from 0 to `end` once in view
const Counter = ({ end, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const frameRef = useRef(null);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [inView, end]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const stats = [
  { icon: TrendingUp, prefix: '$', value: 142,  suffix: 'M+', label: 'Total Funded' },
  { icon: Target,     prefix: '',  value: 2847, suffix: '',   label: 'Startups Funded' },
  { icon: Users,      prefix: '',  value: 18000,suffix: '+',  label: 'Active Investors' },
  { icon: Award,      prefix: '',  value: 94,   suffix: '%',  label: 'Success Rate' },
];

const SocialProofStrip = () => (
  <div className="bg-white border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
        {stats.map(({ icon: Icon, prefix, value, suffix, label }, i) => (
          <motion.div
            key={label}
            className="flex items-center justify-center gap-3 py-6 px-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900 leading-none">
                <Counter end={value} prefix={prefix} suffix={suffix} />
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default SocialProofStrip;
