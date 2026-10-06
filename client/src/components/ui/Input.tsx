import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, type, showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const enablePasswordToggle = isPasswordField && (showPasswordToggle ?? true);

    const effectiveType = enablePasswordToggle
      ? (showPassword ? 'text' : 'password')
      : type;

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#A0A0A0] mb-1.5 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#666666]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            className={`w-full bg-[#0A0A0A] border border-[#1A1A1A] text-[#FFFFFF] placeholder:text-[#666666] text-sm rounded-lg px-3 py-2 transition-all duration-150 focus:outline-none focus:border-[#444444] focus:ring-1 focus:ring-[#444444] disabled:opacity-50 disabled:bg-[#000000] ${
              icon ? 'pl-9' : ''
            } ${enablePasswordToggle ? 'pr-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
            {...props}
          />
          {enablePasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 p-1 rounded text-[#666666] hover:text-[#FFFFFF] focus:outline-none transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 stroke-[1.75]" />
              ) : (
                <Eye className="w-4 h-4 stroke-[1.75]" />
              )}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

