import React from 'react';

interface AppIconProps {
  size?: number | string;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  size = 32,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Subtle dark matte base */}
        <rect width="40" height="40" rx="10" fill="#0A0A0A" />
        <rect width="40" height="40" rx="10" stroke="#1A1A1A" strokeWidth="1" />

        {/* Handcrafted Writing Monogram (Quill tip & journal spine forming 'N') */}
        <path
          d="M11 28V12L19.5 24L28.5 12V28"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Nib slit node */}
        <circle cx="19.5" cy="24" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
