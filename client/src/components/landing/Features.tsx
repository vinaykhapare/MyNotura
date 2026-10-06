import React from 'react';
import { Feather, Shield, Cloud } from 'lucide-react';

const FEATURES = [
  {
    icon: <Feather className="w-5 h-5 text-[#FFFFFF]" />,
    title: 'Pure Writing Experience',
    description: 'Type plain English text set in elegant Playfair Display. No markdown formatting, no toolbars, no distractions.',
  },
  {
    icon: <Cloud className="w-5 h-5 text-[#FFFFFF]" />,
    title: 'Continuous Auto-Save',
    description: 'Every thought is saved automatically as you write. Never worry about losing a sentence.',
  },
  {
    icon: <Shield className="w-5 h-5 text-[#FFFFFF]" />,
    title: 'Quiet & Private',
    description: 'Backed by Supabase with Row Level Security. Your personal journal entries belong solely to you.',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-20 border-t border-[#141414] bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-lg mx-auto mb-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#FFFFFF] mb-3">
            Just the page and your thoughts.
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#777777]">
            Carefully designed to remove all friction between thinking and writing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="p-7 rounded-xl border border-[#141414] bg-[#0A0A0A] hover:border-[#222222] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#111111] border border-[#1A1A1A] flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="font-serif text-base font-semibold text-[#FFFFFF] mb-2">
                {feature.title}
              </h3>
              <p className="font-sans text-xs text-[#888888] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
