import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#FFFFFF] text-[#000000] hover:bg-[#EAEAEA] active:bg-[#D4D4D4] shadow-sm',
    secondary:
      'bg-[#111111] text-[#FFFFFF] hover:bg-[#1A1A1A] border border-[#1A1A1A]',
    outline:
      'border border-[#1A1A1A] bg-transparent text-[#FFFFFF] hover:bg-[#111111] hover:border-[#262626]',
    ghost:
      'text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#111111]',
    danger:
      'bg-transparent text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
