import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Gem, Sparkles } from 'lucide-react';
import { IMG } from '../server/seedData';
import type { Language, StoreConfig } from '../shared/types';
import { SafeImage } from './SdaLogo';

interface HeroSliderProps {
  config: StoreConfig;
  lang: Language;
  onNavigateShop: (opts: { category?: string; title?: string }) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  config,
  lang,
  onNavigateShop,
}) => {
  const slides = config.heroSlides.length > 0 ? config.heroSlides : [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[activeIndex % slides.length];
  const insetImage = activeIndex % 2 === 0 ? IMG.kanchiCrimson : IMG.goldJewellery;
  const sealLabelTop = activeIndex % 2 === 0 ? 'Royal' : 'Temple';
  const sealLabelBottom = activeIndex % 2 === 0 ? 'Couture' : 'Heritage';

  return (
    <section
      aria-label="Featured royal showcase"
      className="relative bg-gradient-to-b from-[#17100D] via-[#120D0B] to-[#150E0C] overflow-hidden border-b border-[#D4AF62]/20"
    >
      {/* Subtle Mandala / Lotus Radial Line Filigree Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] flex items-center justify-center"
      >
        <svg viewBox="0 0 800 800" className="w-[900px] h-[900px] text-[#D4AF62]" fill="none">
          <circle cx="400" cy="400" r="360" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="400" cy="400" r="280" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="400" cy="400" r="200" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4 6" />
          <path
            d="M400 60 C460 180, 540 240, 740 400 C540 560, 460 620, 400 740 C340 620, 260 560, 60 400 C260 240, 340 180, 400 60 Z"
            stroke="currentColor"
            strokeWidth="0.9"
          />
        </svg>
      </div>

      {/* Architectural Gold L-Bracket Corner Frames with Circular Finials */}
      <div className="max-w-[1440px] mx-auto relative px-4 sm:px-8 lg:px-14 py-10 sm:py-14 lg:py-16">
        {/* Top-Left Corner Bracket */}
        <div aria-hidden="true" className="pointer-events-none absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 border-t border-l border-[#D4AF62]/45">
          <span className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full border border-[#D4AF62]/70" />
        </div>
        {/* Top-Right Corner Bracket */}
        <div aria-hidden="true" className="pointer-events-none absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 border-t border-r border-[#D4AF62]/45">
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full border border-[#D4AF62]/70" />
        </div>
        {/* Bottom-Left Corner Bracket */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-10 h-10 border-b border-l border-[#D4AF62]/45">
          <span className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full border border-[#D4AF62]/70" />
        </div>
        {/* Bottom-Right Corner Bracket */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 border-b border-r border-[#D4AF62]/45">
          <span className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full border border-[#D4AF62]/70" />
        </div>

        {/* Main Hero Intro Grid: Arch Collage on top (mobile) / right (desktop) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Arch-Framed Editorial Collage */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[350px] sm:max-w-[440px] lg:max-w-[500px] pt-3 pb-6 px-3 sm:px-5">
              {/* Outer Gold Arch Frame */}
              <div className="relative rounded-t-[170px] sm:rounded-t-[210px] border border-[#D4AF62]/50 p-2 sm:p-3 bg-[#1A120F]/70 shadow-2xl shadow-black/60">
                {/* Inner Dashed Gold Arch Accent */}
                <div className="relative rounded-t-[160px] sm:rounded-t-[200px] border border-dashed border-[#D4AF62]/35 p-1.5 sm:p-2">
                  <div className="relative rounded-t-[152px] sm:rounded-t-[192px] overflow-hidden aspect-[5/4] sm:aspect-[4/3.5] lg:aspect-[5/4.4] bg-[#120D0B]">
                    <SafeImage
                      src={slide.imageUrl}
                      alt={lang === 'te' ? slide.titleTe : slide.title}
                      fallbackTitle={config.brandName}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120D0B]/45 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              {/* Floating Circular Seal Badge (Upper Left) */}
              <div className="absolute top-6 sm:top-9 left-0 sm:-left-2 h-18 w-18 sm:h-24 sm:w-24 rounded-full bg-[#16100D] border border-[#D4AF62]/65 p-1.5 shadow-xl shadow-black/70 flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-dashed border-[#D41472]/60 flex flex-col items-center justify-center text-center px-1">
                  <span className="font-serif italic text-[11px] sm:text-sm font-semibold text-[#D4AF62] leading-tight">
                    {sealLabelTop}
                  </span>
                  <span className="font-serif italic text-[11px] sm:text-sm font-semibold text-[#F8F1E4] leading-tight">
                    {sealLabelBottom}
                  </span>
                </div>
              </div>

              {/* Overlapping Detail Inset Card (Bottom Right) */}
              <div className="absolute bottom-0 right-1 sm:-right-2 w-28 sm:w-40 bg-[#1B1310] border border-[#D4AF62]/45 p-1.5 sm:p-2 shadow-2xl shadow-black/80">
                <div className="aspect-[4/3] overflow-hidden bg-[#120D0B]">
                  <SafeImage
                    src={insetImage}
                    alt="Heritage zari & gold craft"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-1 sm:mt-1.5 pb-0.5 text-center font-serif text-[10px] sm:text-xs text-[#D4AF62] leading-tight">
                  {lang === 'te' ? 'సంప్రదాయ వైభవం' : 'Elegance and Tradition'}
                </p>
              </div>
            </div>
          </div>

          {/* Editorial Copy, CTAs & 2-Column Craft Highlights */}
          <div className="order-2 lg:order-1 lg:col-span-6 text-center lg:text-left space-y-5 max-w-xl mx-auto lg:mx-0">
            {/* Leading Hairline + Kicker */}
            <div className="inline-flex items-center justify-center lg:justify-start gap-3 text-[11px] sm:text-xs tracking-[0.24em] uppercase text-[#D4AF62]">
              <span aria-hidden="true" className="w-8 h-[1px] bg-[#D4AF62]/70" />
              <span>{lang === 'te' ? slide.badgeTe : slide.badge}</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] text-[#F8F1E4]">
              {lang === 'te' ? slide.titleTe : slide.title}
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-[#DFD3C0] leading-relaxed">
              {lang === 'te' ? slide.subtitleTe : slide.subtitle}
            </p>

            {/* Brand Slogan Line */}
            <p className="font-serif italic text-xs sm:text-sm text-[#D4AF62]/90 tracking-wide">
              “{config.secondarySlogan}” <span className="text-[#D41472] mx-1.5">·</span> “{config.brandMessage}”
            </p>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <button
                type="button"
                onClick={() =>
                  onNavigateShop({
                    category: slide.primaryCategory,
                    title: lang === 'te' ? slide.primaryCtaTextTe : slide.primaryCtaText,
                  })
                }
                className="px-6 sm:px-7 py-3.5 rounded-md bg-[#D4AF62] hover:bg-[#E7C77A] text-[#120D0B] text-xs font-semibold uppercase tracking-[0.18em] transition-colors shadow-lg shadow-black/40 whitespace-nowrap"
              >
                {lang === 'te' ? slide.primaryCtaTextTe : slide.primaryCtaText}
              </button>
              <button
                type="button"
                onClick={() =>
                  onNavigateShop({
                    category: slide.secondaryCategory,
                    title: lang === 'te' ? slide.secondaryCtaTextTe : slide.secondaryCtaText,
                  })
                }
                className="px-6 sm:px-7 py-3.5 rounded-md bg-transparent hover:bg-[#65102F]/60 text-[#D4AF62] hover:text-[#F8F1E4] border border-[#D4AF62]/45 text-xs font-medium uppercase tracking-[0.18em] transition-colors whitespace-nowrap"
              >
                {lang === 'te' ? slide.secondaryCtaTextTe : slide.secondaryCtaText}
              </button>
            </div>

            {/* Divider + 2 Trust Highlights (like reference intro) */}
            <div className="pt-5 border-t border-[#D4AF62]/20 grid grid-cols-2 gap-4 sm:gap-6 text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#24141A] border border-[#D41472]/35 flex items-center justify-center text-[#D41472] shrink-0">
                  <Gem className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#F8F1E4] truncate">
                    {lang === 'te' ? '100% స్వచ్ఛమైన పట్టు & 22K' : '100% Pure Silk & Gold'}
                  </p>
                  <p className="text-[11px] text-[#C9BCA8] truncate">
                    {lang === 'te' ? 'అసలైన చేనేత & హాల్‌మార్క్' : 'Authentic handloom & 916'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#24141A] border border-[#D4AF62]/35 flex items-center justify-center text-[#D4AF62] shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#F8F1E4] truncate">
                    {lang === 'te' ? 'స్వచ్ఛమైన జరీ వర్క్' : 'Pure Zari & Nakshi'}
                  </p>
                  <p className="text-[11px] text-[#C9BCA8] truncate">
                    {lang === 'te' ? 'నిపుణులైన కళాకారుల సృష్టి' : 'Crafted with precision'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        {slides.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
              }
              aria-label="Previous slide"
              className="h-8 w-8 rounded-full border border-[#D4AF62]/30 text-[#D4AF62] hover:bg-[#D4AF62] hover:text-[#120D0B] flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeIndex
                      ? 'w-7 bg-[#D4AF62]'
                      : 'w-2 bg-[#F8F1E4]/30 hover:bg-[#D4AF62]/70'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
              aria-label="Next slide"
              className="h-8 w-8 rounded-full border border-[#D4AF62]/30 text-[#D4AF62] hover:bg-[#D4AF62] hover:text-[#120D0B] flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
