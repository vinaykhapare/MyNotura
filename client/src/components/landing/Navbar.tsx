import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#141414] bg-[#000000]/85 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <Logo iconSize={30} showWordmark={true} />
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/notes"
                className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-[#111111] hover:bg-[#181818] border border-[#222222] transition-colors group"
                title={user.user_metadata?.full_name || user.email || 'Your account'}
              >
                <div className="w-6 h-6 rounded-full bg-[#1F1F1F] text-[#FFFFFF] font-sans font-semibold text-[10px] flex items-center justify-center overflow-hidden shrink-0">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    ((user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'W').toUpperCase())
                  )}
                </div>
                <span className="text-xs font-sans text-[#DDDDDD] font-medium hidden sm:inline truncate max-w-[120px]">
                  {user?.user_metadata?.full_name || (user?.user_metadata?.username ? `@${user.user_metadata.username}` : user?.email?.split('@')[0])}
                </span>
              </Link>
              <Link to="/notes">
                <Button variant="primary" size="sm">
                  Open Journal
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Start Writing
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
