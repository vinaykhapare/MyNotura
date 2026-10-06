import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  return (
    <section className="pt-20 pb-20 sm:pt-28 sm:pb-28 text-center px-6 max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1A1A1A] bg-[#0A0A0A] text-xs font-sans text-[#A0A0A0] mb-8">
        <span>A personal digital notebook</span>
      </div>

      <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#FFFFFF] leading-[1.15] mb-6">
        A quiet place <br />
        <span className="italic text-[#E0E0E0]">for your thoughts.</span>
      </h1>

      <p className="font-serif text-lg sm:text-xl text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed mb-10">
        A distraction-free writing space for personal notes and reflections. No complex formatting, no cluttered toolbars. Just your words, automatically saved.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-20">
        <Link to="/register" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full sm:w-auto px-6">
            Start Writing Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Link to="/login" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-6">
            Sign In
          </Button>
        </Link>
      </div>

      {/* Realistic Editorial Journal Paper Mockup */}
      <div className="relative mx-auto max-w-2xl rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 sm:p-10 text-left shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#141414] mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#262626] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#262626] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#262626] inline-block" />
          </div>
          <span className="font-sans text-xs text-[#555555] flex items-center gap-1">
            <Check className="w-3 h-3 text-[#888888]" /> Saved
          </span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FFFFFF] mb-4">
          Morning Reflections on Simplicity
        </h3>
        <p className="font-serif text-base sm:text-lg text-[#CCCCCC] leading-[1.85]">
          There is a quiet power in having a dedicated space solely for thinking. In a world crowded with notifications, sidebars, and feature bloat, true luxury is empty space.
        </p>
        <p className="font-serif text-base sm:text-lg text-[#888888] leading-[1.85] mt-4">
          When the tools disappear, what remains is the clarity of the mind. Today&apos;s goal is not to do more, but to remove everything that doesn&apos;t matter...
        </p>
      </div>
    </section>
  );
};
