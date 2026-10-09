'use client';

import React from 'react';
import { SiteSettings, Product } from '@/lib/db';

interface HeroProps {
  settings: SiteSettings;
  heroProduct?: Product | null;
}

export default function Hero({ settings, heroProduct }: HeroProps) {
  const kicker = settings.heroKicker || 'ÖZEL TASARIM & MARKA PELUŞLARI';
  const title = settings.heroTitle || 'Fikirlerinizi sarılası peluşlara dönüştürüyoruz.';

  // Prioritize the full photographic studio banner matching the mockup
  const heroImage =
    settings.heroImageUrl ||
    settings.heroCustomImageUrl ||
    (settings.heroProductId && heroProduct?.image) ||
    '/images/hero_hedgehog_banner.jpg';

  return (
    <section
      style={{ backgroundColor: 'var(--site-bg)' }}
      className="relative w-full min-h-[480px] sm:min-h-[520px] md:min-h-[440px] md:aspect-[16/9] max-h-[660px] lg:max-h-[700px] xl:max-h-[740px] -mt-20 sm:-mt-24 flex items-center overflow-hidden transition-colors border-b border-stone-300/80"
    >
      {/* Full-Width Background Scene Image */}
      <div className="absolute inset-0 z-0">
        {settings.heroMobileImageUrl ? (
          <>
            {/* Mobile Cropped Image (< md) */}
            <img
              src={settings.heroMobileImageUrl}
              alt={title}
              className="md:hidden w-full h-full object-cover object-center select-none"
            />
            {/* Desktop Image (>= md) */}
            <img
              src={heroImage}
              alt={title}
              className="hidden md:block w-full h-full object-cover object-[center_30%] select-none"
            />
          </>
        ) : (
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover object-[center_30%] select-none"
          />
        )}
        {/* Adjustable overlay on mobile so text is legible or fully transparent if disabled */}
        {(typeof settings.heroMobileOverlayOpacity === 'number' ? settings.heroMobileOverlayOpacity : 35) > 0 && (
          <div
            style={{
              background: 'linear-gradient(to right, var(--site-bg) 0%, transparent 75%)',
              opacity: (typeof settings.heroMobileOverlayOpacity === 'number' ? settings.heroMobileOverlayOpacity : 35) / 100,
            }}
            className="absolute inset-0 lg:hidden pointer-events-none"
          />
        )}
      </div>

      {/* Floating Editorial Content on the Left */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10">
        <div className="max-w-md sm:max-w-lg lg:max-w-xl space-y-4 sm:space-y-5 text-left">
          
          {/* Small Uppercase Kicker */}
          <div className="inline-block">
            <span
              style={{ color: 'var(--text-muted)' }}
              className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase"
            >
              {kicker}
            </span>
          </div>

          {/* Main Headline */}
          <h1
            style={{ color: 'var(--text-main)' }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[50px] font-medium tracking-[-0.02em] leading-[1.15]"
          >
            {title}
          </h1>

        </div>
      </div>
    </section>
  );
}
