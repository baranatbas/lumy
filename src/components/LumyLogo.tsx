'use client';

import React from 'react';

interface LumyLogoProps {
  variant?: 'light' | 'dark';
  logoUrl?: string;
  brandName?: string;
  className?: string;
  showText?: boolean;
}

export function isDarkColor(color?: string): boolean {
  if (!color) return false;
  const hex = color.replace('#', '').trim();
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  return false;
}

export default function LumyLogo({
  variant = 'light',
  logoUrl,
  brandName = 'lumy TOYS',
  className = '',
}: LumyLogoProps) {
  // If custom logo is set in settings/admin
  if (logoUrl && logoUrl.trim() !== '') {
    return (
      <div className={`flex items-center select-none group ${className}`}>
        <img
          src={logoUrl}
          alt={brandName}
          className="h-11 sm:h-13 md:h-14 w-auto max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  const isDark = variant === 'dark';
  // Use the high-res colorful original logo as primary default
  const logoSrc = isDark ? '/images/lumy_logo_lime.png' : '/images/lumy_logo_color.png';

  return (
    <div className={`flex items-center select-none group ${className}`}>
      <img
        src={logoSrc}
        alt={brandName}
        className="h-11 sm:h-13 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
