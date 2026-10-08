import React, { useState } from 'react';
import { useBranding } from '../../context/BrandingContext';
import officialLogo from '../../assets/images/logo-karang-taruna.png';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md', onClick }) => {
  const { logoUrl } = useBranding();
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const clickableClass = onClick ? 'cursor-pointer select-none active:scale-95 transition-transform' : '';
  const activeLogoSrc = (!imgError && logoUrl) ? logoUrl : officialLogo;

  return (
    <div
      onClick={onClick}
      className={`${dimensions} rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${clickableClass} ${className}`}
    >
      <img
        src={activeLogoSrc}
        alt="Logo Resmi Karang Taruna Kelurahan Manis Jaya"
        className="w-full h-full object-contain drop-shadow-sm select-none"
        onError={() => {
          if (!imgError && logoUrl) {
            setImgError(true);
          }
        }}
      />
    </div>
  );
};

