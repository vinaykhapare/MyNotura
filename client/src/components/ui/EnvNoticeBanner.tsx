import React, { useState } from 'react';
import { Database, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const EnvNoticeBanner: React.FC = () => {
  const { isConfigured } = useAuth();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('mynotura_env_notice_dismissed') === 'true';
  });

  if (isConfigured || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('mynotura_env_notice_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div className="bg-[#0A0A0A] border-b border-[#1A1A1A] px-4 py-2 text-xs text-[#A0A0A0] transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#A0A0A0] shrink-0" />
          <span>
            <strong className="font-medium text-[#FFFFFF]">Local Demo Mode:</strong>{' '}
            Writing notes locally. Connect Supabase by adding <code className="text-[#FFFFFF] bg-[#111111] px-1 py-0.5 rounded text-[11px]">VITE_SUPABASE_URL</code> in <code className="text-[#FFFFFF] bg-[#111111] px-1 py-0.5 rounded text-[11px]">.env</code> for cloud sync.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#FFFFFF] hover:underline"
          >
            Connect Supabase
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleDismiss}
            className="text-[#666666] hover:text-[#FFFFFF] p-0.5 rounded transition-colors"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
