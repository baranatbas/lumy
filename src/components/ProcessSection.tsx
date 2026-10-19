'use client';

import React from 'react';
import { SiteSettings, ProcessStep } from '@/lib/db';

interface ProcessSectionProps {
  settings: SiteSettings;
}

const DEFAULT_STEPS: ProcessStep[] = [
  {
    id: 'step-1',
    stepNumber: '01',
    stepLabel: 'FİKİR',
    description: 'Sizin konseptiniz, bizim yaratıcılığımız.',
    imageUrl: '/images/process_01.jpg'
  },
  {
    id: 'step-2',
    stepNumber: '02',
    stepLabel: 'TASARIM',
    description: 'Detaylı kalıplar ve tasarım çizimleri.',
    imageUrl: '/images/process_02.jpg'
  },
  {
    id: 'step-3',
    stepNumber: '03',
    stepLabel: 'PROTOTİP',
    description: 'Mükemmel doku ve form için numune testi.',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'step-4',
    stepNumber: '04',
    stepLabel: 'ÜRETİM',
    description: 'Markanız ve sevdikleriniz için hazır.',
    imageUrl: '/images/hero_hedgehog.jpg'
  }
];

export default function ProcessSection({ settings }: ProcessSectionProps) {
  const kicker = settings.processKicker !== undefined ? settings.processKicker : 'ÜRETİM SÜRECİMİZ';
  const title = settings.processTitle || 'Çizimden gülümsemeye.';
  const description =
    settings.processSubtitle ||
    'Fikirlerinizi yaratıcı tasarım, yüksek kaliteli malzemeler ve güvenilir bir üretim süreciyle hayata geçiriyoruz.';
  const steps = settings.processSteps && settings.processSteps.length > 0 ? settings.processSteps : DEFAULT_STEPS;

  return (
    <section
      id="process"
      className="py-20 sm:py-28 bg-white border-y border-stone-200/80 relative transition-colors shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Main Grid: Left Narrative + Right 4 Process Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading and Description */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-32">
            {kicker && kicker.trim() !== '' && kicker.trim().toUpperCase() !== 'N/A' && (
              <span
                style={{ color: 'var(--text-muted)' }}
                className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase block"
              >
                {kicker}
              </span>
            )}

            <h2
              style={{ color: 'var(--text-main)' }}
              className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-[-0.02em] leading-[1.14]"
            >
              {title}
            </h2>

            <p
              style={{ color: 'var(--text-muted)' }}
              className="text-xs sm:text-sm leading-relaxed max-w-md font-normal"
            >
              {description}
            </p>
          </div>

          {/* Right Column: 4 Clean Process Cards with Step Numbers and Images */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {steps.map((step, index) => (
                <div
                  key={step.id || index}
                  className="flex flex-col space-y-3 group"
                >
                  <div className="w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 bg-stone-100 border border-stone-200/70 relative">
                    <img
                      src={step.imageUrl || '/images/hero_hedgehog.jpg'}
                      alt={step.stepLabel || 'Üretim süreci'}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-2xl sm:rounded-3xl"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-lg shadow-2xs border border-black/5">
                      {step.stepNumber || `0${index + 1}`}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4
                      style={{ color: 'var(--text-main)' }}
                      className="text-xs font-black tracking-wider uppercase"
                    >
                      {step.stepLabel}
                    </h4>
                    {step.description && (
                      <p
                        style={{ color: 'var(--text-muted)' }}
                        className="text-[11px] leading-tight line-clamp-2"
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
