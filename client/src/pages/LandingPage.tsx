import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { Footer } from '../components/landing/Footer';
import { EnvNoticeBanner } from '../components/ui/EnvNoticeBanner';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F1117] text-[#F5F7FA]">
      <EnvNoticeBanner />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};
