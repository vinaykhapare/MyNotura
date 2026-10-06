import React from 'react';
import { AppIcon } from './AppIcon';

interface LogoProps {
  iconSize?: number;
  showWordmark?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  iconSize = 30,
  showWordmark = true,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <AppIcon size={iconSize} />
      {showWordmark && (
        <div className="flex items-baseline tracking-tight">
          <span className="font-serif text-lg font-normal text-[#A0A0A0] tracking-normal mr-0.5">My</span>
          <span className="font-serif text-lg font-semibold text-[#FFFFFF] tracking-tight">
            Notura
          </span>
        </div>
      )}
    </div>
  );
};
