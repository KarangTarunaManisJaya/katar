import React from 'react';
import { useBranding } from '../../context/BrandingContext';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md', onClick }) => {
  const { logoUrl } = useBranding();

  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const clickableClass = onClick ? 'cursor-pointer select-none' : '';

  if (logoUrl) {
    return (
      <div
        onClick={onClick}
        className={`${dimensions} rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${clickableClass} ${className}`}
      >
        <img
          src={logoUrl}
          alt="Logo Karang Taruna Manis Jaya"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Official Karang Taruna emblem matching the uploaded screenshot!
  return (
    <div
      onClick={onClick}
      className={`${dimensions} shrink-0 flex items-center justify-center ${clickableClass} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        <circle cx="50" cy="50" r="47" fill="#1e3a8a" stroke="#facc15" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="39" fill="#1d4ed8" stroke="#facc15" strokeWidth="1.8" strokeDasharray="3,1" />
        <circle cx="50" cy="50" r="29" fill="#dc2626" stroke="#facc15" strokeWidth="2" />
        <path d="M50 31 L54 44 L46 44 Z" fill="#facc15" />
        <path d="M48 44 L52 44 L51 67 L49 67 Z" fill="#f8fafc" />
        <circle cx="50" cy="50" r="10" fill="#facc15" opacity="0.35" />
        <path id="archLogo" d="M22,50 a28,28 0 1,1 56,0" fill="none" />
        <text fontSize="7" fill="#ffffff" fontWeight="bold" letterSpacing="0.8">
          <textPath href="#archLogo" startOffset="50%" textAnchor="middle">
            KARANG TARUNA
          </textPath>
        </text>
        <path d="M30 76 L70 76 L66 84 L34 84 Z" fill="#facc15" />
        <text x="50" y="82" fontSize="5.5" fill="#1e3a8a" fontWeight="bold" textAnchor="middle">
          MANIS JAYA
        </text>
      </svg>
    </div>
  );
};
