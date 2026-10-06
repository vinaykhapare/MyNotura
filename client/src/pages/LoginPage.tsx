import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { EnvNoticeBanner } from '../components/ui/EnvNoticeBanner';

interface LoginPageProps {
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode }) => {
  const location = useLocation();
  const mode = initialMode || (location.pathname === '/register' ? 'register' : 'login');

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#FFFFFF]">
      <EnvNoticeBanner />
      <div className="flex-1 flex items-center justify-center p-6">
        <AuthForm initialMode={mode} />
      </div>
      <footer className="py-6 text-center text-xs font-sans text-[#444444]">
        © {new Date().getFullYear()} MyNotura • A Quiet Place to Write
      </footer>
    </div>
  );
};
