import React from 'react';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

const stats = [
  { icon: TrendingUp, value: '$142M+', label: 'Total Funded' },
  { icon: Target,     value: '2,847',  label: 'Startups Funded' },
  { icon: Users,      value: '18K+',   label: 'Active Investors' },
  { icon: Award,      value: '94%',    label: 'Success Rate' },
];

const SocialProofStrip = () => (
  <div className="bg-white border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center justify-center gap-3 py-6 px-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900 leading-none">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SocialProofStrip;
