'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteSettings } from '@/lib/db';
import LumyLogo, { isDarkColor } from './LumyLogo';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, Send, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDarkFooter = isDarkColor(settings.theme?.footerBg || '#141414');

  const contactInfo = {
    email: settings.contact?.email || 'info@lumytoys.com',
    phone: settings.contact?.phone || settings.contact?.whatsapp || '+90 530 123 45 67',
    address: settings.contact?.address || 'İstanbul, Türkiye',
    instagram: settings.contact?.instagram || 'https://instagram.com/lumytoys',
    facebook: settings.contact?.facebook,
    linkedin: settings.contact?.linkedin || 'https://linkedin.com/company/lumytoys',
    showPhone: settings.contact?.showPhone !== false,
    showEmail: settings.contact?.showEmail !== false,
    showAddress: settings.contact?.showAddress !== false,
    showInstagram: settings.contact?.showInstagram !== false,
    showFacebook: settings.contact?.showFacebook !== false,
    showLinkedin: settings.contact?.showLinkedin !== false,
  };

  const tagline = settings.footerTagline || 'Özel bir şeyler üretelim. Ekibimizle hemen iletişime geçin.';
  const contactTitle = settings.footerContactTitle || 'BİZE ULAŞIN';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.contact.includes('@') ? formData.contact : '',
          phone: !formData.contact.includes('@') ? formData.contact : '',
          message: formData.message,
          type: 'customer'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', contact: '', message: '' });
      } else {
        setErrorMsg(data.error || 'Mesaj iletilemedi, lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      setErrorMsg('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      id="contact"
      style={{
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-text)',
      }}
      className="pt-20 pb-12 relative overflow-hidden transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-current/15">
          
          {/* Left Column: Brand & Interactive Contact Form */}
          <div className="lg:col-span-7 space-y-6">
            <Link href="/" className="inline-block group">
              <LumyLogo
                variant={isDarkFooter ? 'dark' : 'light'}
                logoUrl={settings.footerLogoUrl || settings.logoUrl}
                brandName={settings.brandName || 'lumy TOYS'}
              />
            </Link>

            <p
              style={{ color: 'var(--footer-text)', opacity: 0.8 }}
              className="text-xs sm:text-sm font-normal leading-relaxed max-w-md"
            >
              {tagline}
            </p>

            {/* Quick Contact Form */}
            <div className="bg-[#1C1C1C] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-800/80 shadow-xl max-w-lg">
              {submitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#84CC16]/20 text-[#84CC16] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Mesajınız Alındı!</h4>
                  <p className="text-xs text-stone-400">
                    Ekibimiz en kısa sürede sizinle iletişime geçecektir.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-[#84CC16] underline hover:text-[#A3E635] pt-2"
                  >
                    Yeni bir mesaj gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  {errorMsg && (
                    <div className="p-2.5 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Adınız Soyadınız *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#262626] border border-stone-700/60 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#84CC16]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Telefon veya E-posta *"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#262626] border border-stone-700/60 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#84CC16]"
                    />
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder="Mesajınız veya hayalinizdeki peluş proje *"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#262626] border border-stone-700/60 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#84CC16] resize-none"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#84CC16] hover:bg-[#A3E635] disabled:opacity-50 text-stone-950 font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span>{loading ? 'Gönderiliyor...' : 'Mesajı İlet'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Direct Contact Info & Socials */}
          <div className="lg:col-span-5 space-y-6 lg:pl-10">
            <span
              style={{ color: 'var(--footer-text)', opacity: 0.65 }}
              className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase block"
            >
              {contactTitle}
            </span>

            <div className="space-y-4 text-xs font-medium" style={{ color: 'var(--footer-text)' }}>
              {contactInfo.showEmail && contactInfo.email && (
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a href={`mailto:${contactInfo.email}`} className="hover:underline transition-all">
                    {contactInfo.email}
                  </a>
                </div>
              )}

              {contactInfo.showPhone && contactInfo.phone && (
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Phone className="w-4 h-4" />
                  </div>
                  <a href={`tel:${contactInfo.phone}`} className="hover:underline transition-all">
                    {contactInfo.phone}
                  </a>
                </div>
              )}

              {contactInfo.showAddress && contactInfo.address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 opacity-80 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="leading-relaxed opacity-85">
                    {contactInfo.address}
                  </span>
                </div>
              )}
            </div>

            {/* Social Icons (Instagram -> Facebook -> LinkedIn) */}
            <div className="pt-2 flex items-center gap-3">
              {contactInfo.showInstagram && contactInfo.instagram && (
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  style={{ color: 'var(--footer-text)' }}
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {contactInfo.showFacebook && contactInfo.facebook && (
                <a
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  style={{ color: 'var(--footer-text)' }}
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {contactInfo.showLinkedin && contactInfo.linkedin && (
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  style={{ color: 'var(--footer-text)' }}
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Link */}
        <div
          style={{ color: 'var(--footer-text)', opacity: 0.6 }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
        >
          <div>
            <span>© 2026 Lumy Toys. Tüm hakları saklıdır.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:opacity-100 flex items-center gap-1.5 transition-opacity">
              <Lock className="w-3.5 h-3.5 opacity-70" />
              <span>Yönetim Girişi</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
