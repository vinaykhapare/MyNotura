import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { AppIcon } from '../brand/AppIcon';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000] text-[#FFFFFF]">
        <div className="flex flex-col items-center gap-4">
          <AppIcon size={36} />
          <div className="flex items-center gap-2 text-xs font-sans text-[#666666]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFFFFF]" />
            <span>Opening notebook...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
