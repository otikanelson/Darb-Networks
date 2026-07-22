import React, { useEffect, useRef, useState } from 'react';
import { Rocket, ShieldCheck, Zap, Layers, ArrowUpRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

// Smooth Counter for early stage real numbers
const Counter = ({ end, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const frameRef = useRef(null);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
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

// Truthful, launch-focused stats
const stats = [
  {
    icon: Rocket,
    value: 100,
    suffix: '%',
    label: 'Platform Security',
    subtext: 'Audited smart contracts'
  },
  {
    icon: ShieldCheck,
    value: 1,
    suffix: '',
    label: 'Pilot Campaign Live',
    subtext: 'Vetted startup onboarding'
  },
  {
    icon: Layers,
    value: 10,
    prefix: '₦',
    suffix: 'k+',
    label: 'Initial Pilot Commitment',
    subtext: 'First milestone in progress'
  },
  {
    icon: Zap,
    value: 2026,
    suffix: '',
    label: 'Official Launch Phase',
    subtext: 'Early investor access open'
  },
];

const LaunchProofSection = () => {
  return (
    <section className="bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden relative border-y border-slate-200">
      {/* Soft background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-secondary-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Visual Growth / Target Graph Card */}
          <motion.div
            className="lg:col-span-5 bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-2xl p-6 relative backdrop-blur-md"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Growth Roadmap</span>
                <h3 className="text-lg font-bold text-slate-900">Platform Launch Phase</h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                Live Beta
              </span>
            </div>

            {/* Visual SVG Target Graph */}
            <div className="h-48 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="300" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="70" x2="300" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="110" x2="300" y2="110" stroke="#CBD5E1" strokeWidth="1" />

                {/* Target Projection Curve */}
                <motion.path
                  d="M 0 110 Q 75 105, 150 70 T 300 15"
                  fill="none"
                  stroke="url(#light-gradient)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Area Gradient under graph */}
                <motion.path
                  d="M 0 110 Q 75 105, 150 70 T 300 15 L 300 110 L 0 110 Z"
                  fill="url(#light-area-gradient)"
                  opacity="0.3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.3 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />

                {/* Light Theme Gradients */}
                <defs>
                  <linearGradient id="light-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="light-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Current Stage Pulse Indicator */}
                <g transform="translate(150, 70)">
                  <circle r="6" fill="#0284c7" className="animate-ping opacity-75" />
                  <circle r="4" fill="#0284c7" />
                </g>
              </svg>

              {/* Callouts over Graph */}
              <div className="absolute top-2 right-0 bg-primary-50 border border-primary-200 text-primary-700 font-medium text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                Target: Next Cohort <ArrowUpRight className="w-3 h-3 text-primary-600" />
              </div>
              <div className="absolute bottom-6 left-1/3 bg-slate-100 border border-slate-300 text-slate-700 font-medium text-[10px] px-2 py-0.5 rounded shadow-sm">
                Current Stage
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Transparent deal flow</span>
              <span>Audited infrastructure</span>
            </div>
          </motion.div>

          {/* Right Column: Truthful Metrics Grid */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <span className="text-primary-600 font-bold text-sm tracking-wide uppercase">Built for trust</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Early access, verifiable milestones.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                We are actively onboarding our launch cohort of startups and investors. Join early to help fund the next wave of innovation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ icon: Icon, prefix, value, suffix, label, subtext }, i) => (
                <motion.div
                  key={label}
                  className="bg-white border border-slate-200/80 p-5 rounded-xl hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="w-9 h-9 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    <Counter end={value} prefix={prefix} suffix={suffix} />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-1">{label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{subtext}</div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LaunchProofSection;