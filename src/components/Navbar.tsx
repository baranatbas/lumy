'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteSettings } from '@/lib/db';
import LumyLogo, { isDarkColor } from './LumyLogo';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  settings: SiteSettings;
}

export default function Navbar({ settings }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDarkNavbar = isDarkColor(settings.theme?.siteBg);

  return (
    <header
      style={{
        backgroundColor: isDarkNavbar ? 'rgba(18, 18, 20, 0.55)' : 'rgba(255, 255, 255, 0.65)',
        borderColor: isDarkNavbar ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.4)',
      }}
      className="sticky top-0 z-40 backdrop-blur-lg border-b shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center">
            <LumyLogo
              variant={isDarkNavbar ? 'dark' : 'light'}
              logoUrl={settings.logoUrl}
              brandName={settings.brandName || 'lumy TOYS'}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-10">
            <a
              href="#process"
              style={{ color: 'var(--text-muted)' }}
              className="text-[11px] lg:text-xs font-bold tracking-[0.2em] uppercase hover:opacity-100 transition-opacity"
            >
              {settings.navProcess || settings.processKicker || 'SÜRECİMİZ'}
            </a>
            <a
              href="#products"
              style={{ color: 'var(--text-muted)' }}
              className="text-[11px] lg:text-xs font-bold tracking-[0.2em] uppercase hover:opacity-100 transition-opacity"
            >
              {settings.navCatalog || 'ÜRÜNLER'}
            </a>
            <a
              href="#why-lumy"
              style={{ color: 'var(--text-muted)' }}
              className="text-[11px] lg:text-xs font-bold tracking-[0.2em] uppercase hover:opacity-100 transition-opacity"
            >
              {settings.navWhy || settings.whyKicker || 'NEDEN LUMY?'}
            </a>
            <a
              href="#contact"
              style={{ color: 'var(--text-muted)' }}
              className="text-[11px] lg:text-xs font-bold tracking-[0.2em] uppercase hover:opacity-100 transition-opacity"
            >
              {settings.navContact || 'İLETİŞİM'}
            </a>
          </nav>


          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: 'var(--text-main)' }}
              className="p-2.5 rounded-xl hover:bg-current/5"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Slide-down */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: isDarkNavbar ? 'rgba(18, 18, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDarkNavbar ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          }}
          className="md:hidden border-b px-6 py-6 space-y-4 shadow-xl backdrop-blur-xl"
        >
          <nav className="flex flex-col space-y-3">
            <a
              href="#process"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-main)' }}
              className="text-xs font-bold tracking-[0.2em] uppercase py-2"
            >
              {settings.navProcess || settings.processKicker || 'SÜRECİMİZ'}
            </a>
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-main)' }}
              className="text-xs font-bold tracking-[0.2em] uppercase py-2"
            >
              {settings.navCatalog || 'ÜRÜNLER'}
            </a>
            <a
              href="#why-lumy"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-main)' }}
              className="text-xs font-bold tracking-[0.2em] uppercase py-2"
            >
              {settings.navWhy || settings.whyKicker || 'NEDEN LUMY?'}
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--text-main)' }}
              className="text-xs font-bold tracking-[0.2em] uppercase py-2"
            >
              {settings.navContact || 'İLETİŞİM'}
            </a>
          </nav>

        </div>
      )}
    </header>
  );
}
