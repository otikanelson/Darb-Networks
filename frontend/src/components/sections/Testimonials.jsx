import React from 'react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      'We raised ₦45M in 6 weeks. The platform connected us with investors who actually understood our market. It changed everything for AgroSmart.',
    name: 'Chidi Okafor',
    role: 'Founder, AgroSmart Nigeria',
    avatar: 'CO',
    avatarBg: 'bg-green-100 text-green-700',
  },
  {
    quote:
      "I've invested in 12 startups through Darb. The milestone-based disbursement gives me confidence that my capital is being used responsibly.",
    name: 'Amina Bello',
    role: 'Angel Investor, Lagos',
    avatar: 'AB',
    avatarBg: 'bg-blue-100 text-blue-700',
  },
  {
    quote:
      'The campaign editor is intuitive and the team was incredibly supportive. We hit our funding goal 3 weeks ahead of schedule.',
    name: 'Tunde Adeyemi',
    role: 'Co-founder, EcoVehicle',
    avatar: 'TA',
    avatarBg: 'bg-purple-100 text-purple-700',
  },
];

const Testimonials = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Success stories</span>
        <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
          Founders and investors love Darb
        </h2>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Real people, real results. Here's what our community has to say.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map(({ quote, name, role, avatar, avatarBg }) => (
          <div
            key={name}
            className="bg-gray-50 rounded-2xl p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <Quote className="h-8 w-8 text-green-400 mb-4" />
              <p className="text-gray-700 leading-relaxed text-[15px]">"{quote}"</p>
            </div>
            <div className="flex items-center mt-8 space-x-3">
              <div className={`w-11 h-11 rounded-full ${avatarBg} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                {avatar}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{name}</div>
                <div className="text-gray-500 text-xs">{role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
