import React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />,
    info: <Info className="w-3.5 h-3.5 text-[#A0A0A0] shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#111111] border border-[#1A1A1A] text-[#FFFFFF] rounded-lg shadow-xl text-xs font-sans animate-in slide-in-from-bottom-2 duration-150">
      {icons[type]}
      <span className="font-medium text-[#EAEAEA]">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-[#666666] hover:text-[#FFFFFF] p-0.5 rounded transition-colors cursor-pointer"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
