import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORY_SUBCATEGORIES, TRANSLATIONS, tSubcategory } from '../i18n/translations';
import { IMG } from '../server/seedData';
import type { Language, MainCategory } from '../shared/types';
import { SafeImage } from './SdaLogo';

interface CategoryShowcaseProps {
  lang: Language;
  onNavigateShop: (opts: {
    category?: string;
    subcategory?: string;
    title?: string;
  }) => void;
}

const SUBCATEGORY_IMAGES: Record<string, string> = {
  'Gold Jewellery': IMG.goldJewellery,
  'Silver Jewellery': IMG.silverBridal,
  'Artificial Jewellery': IMG.kundanSet,
  'Bridal Jewellery': IMG.kundanSet,
  'Traditional Jewellery': IMG.goldBangles,
  'Silk Sarees': IMG.silkSarees,
  'Cotton Sarees': IMG.cottonOrganza,
  'Designer Sarees': IMG.heroBridal,
  'Wedding Sarees': IMG.kanchiCrimson,
  'Banarasi Sarees': IMG.silkSarees,
  'Gadwal Sarees': IMG.cottonOrganza,
  'Kanchi Sarees': IMG.kanchiCrimson,
  'Kalamkari Sarees': IMG.cottonOrganza,
  'Organza Sarees': IMG.readyToWear,
  'Other Traditional Sarees': IMG.silkSarees,
  'Designer Dresses': IMG.heroRoyal,
  'Anarkali': IMG.designerDresses,
  'Ethnic Wear': IMG.readyToWear,
  'Lehengas': IMG.designerDresses,
  'Ready-to-Wear': IMG.readyToWear,
};

/**
 * Generates a symmetrical 10-lobe Mughal lotus-arch scalloped medallion SVG path.
 * When scale = 1, coordinates span [0..1] for clipPathUnits="objectBoundingBox".
 * When scale = 200, coordinates span [0..200] for viewBox="0 0 200 200" borders.
 */
function buildScallopPath(scale: number, radiusFactor = 1): string {
  const lobes = 10;
  const cx = 0.5 * scale;
  const cy = 0.5 * scale;
  const fmt = (n: number) => n.toFixed(4);

  const cuspPoint = (idx: number) => {
    const i = idx % lobes;
    const angle = (i * 2 * Math.PI) / lobes - Math.PI / 2;
    const isVerticalTip = i === 0 || i === lobes / 2;
    const r = (isVerticalTip ? 0.455 : 0.402) * radiusFactor * scale;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
    };
  };

  const start = cuspPoint(0);
  let d = `M ${fmt(start.x)} ${fmt(start.y)}`;

  for (let i = 0; i < lobes; i++) {
    const p1 = cuspPoint(i);
    const p2 = cuspPoint(i + 1);
    const midAngle = p1.angle + Math.PI / lobes;
    const ctrlR = 0.515 * radiusFactor * scale;
    const ctrlX = cx + ctrlR * Math.cos(midAngle);
    const ctrlY = cy + ctrlR * Math.sin(midAngle);
    d += ` Q ${fmt(ctrlX)} ${fmt(ctrlY)} ${fmt(p2.x)} ${fmt(p2.y)}`;
  }

  return `${d} Z`;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  lang,
  onNavigateShop,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'All' | MainCategory>('All');
  const trackRef = useRef<HTMLDivElement>(null);

  const clipPathD = useMemo(() => buildScallopPath(1, 0.96), []);
  const outerBorderD = useMemo(() => buildScallopPath(200, 0.985), []);
  const innerBorderD = useMemo(() => buildScallopPath(200, 0.935), []);

  const pillarCards: {
    category: MainCategory;
    title: string;
    titleTe: string;
    countLabel: string;
    image: string;
  }[] = [
    {
      category: 'Jewellery',
      title: 'Jewellery Atelier',
      titleTe: 'ఆభరణాల విభాగం',
      countLabel: '5 Signature Collections',
      image: IMG.goldJewellery,
    },
    {
      category: 'Sarees',
      title: 'Heritage Sarees',
      titleTe: 'సంప్రదాయ చీరలు',
      countLabel: '10 Handloom & Designer Weaves',
      image: IMG.kanchiCrimson,
    },
    {
      category: 'Dresses',
      title: 'Designer Couture',
      titleTe: 'డిజైనర్ డ్రెస్సులు',
      countLabel: '5 Bridal & Festive Silhouettes',
      image: IMG.designerDresses,
    },
  ];

  const displayedSubcategories: { category: MainCategory; sub: string }[] =
    activeTab === 'All'
      ? [
          ...CATEGORY_SUBCATEGORIES.Jewellery.map((sub) => ({ category: 'Jewellery' as const, sub })),
          ...CATEGORY_SUBCATEGORIES.Sarees.map((sub) => ({ category: 'Sarees' as const, sub })),
          ...CATEGORY_SUBCATEGORIES.Dresses.map((sub) => ({ category: 'Dresses' as const, sub })),
        ]
      : CATEGORY_SUBCATEGORIES[activeTab].map((sub) => ({
          category: activeTab,
          sub,
        }));

  const scrollTrack = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    const w = trackRef.current.clientWidth;
    trackRef.current.scrollBy({
      left: dir === 'left' ? -Math.max(260, w * 0.7) : Math.max(260, w * 0.7),
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-[#16100D] py-14 sm:py-20 border-b border-[#D4AF62]/15 overflow-hidden">
      {/* Shared SVG ClipPath definition for Scalloped Lotus-Arch Medallions */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="sda-scallop-medallion" clipPathUnits="objectBoundingBox">
            <path d={clipPathD} />
          </clipPath>
        </defs>
      </svg>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
        {/* Header + Filter Tabs + Carousel Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4]">
              {t.sections.shopByCategory}
            </h2>
            <p className="mt-1.5 text-sm text-[#C9BCA8] max-w-2xl">
              {t.sections.shopByCategorySub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <div
              role="tablist"
              aria-label="Filter categories"
              className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[#211713] border border-[#D4AF62]/20"
            >
              {(['All', 'Jewellery', 'Sarees', 'Dresses'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 sm:px-4 py-2 rounded-md text-xs font-medium tracking-wider uppercase transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#D4AF62] text-[#120D0B] font-semibold'
                      : 'text-[#C9BCA8] hover:text-[#F8F1E4]'
                  }`}
                >
                  {tab === 'All'
                    ? lang === 'te'
                      ? 'అన్నీ (20)'
                      : 'All (20)'
                    : lang === 'te'
                      ? t.nav[tab.toLowerCase() as 'jewellery' | 'sarees' | 'dresses']
                      : tab}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollTrack('left')}
                aria-label="Scroll categories left"
                className="h-9 w-9 rounded-full border border-[#D4AF62]/35 text-[#D4AF62] hover:bg-[#D4AF62] hover:text-[#120D0B] flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack('right')}
                aria-label="Scroll categories right"
                className="h-9 w-9 rounded-full border border-[#D4AF62]/35 text-[#D4AF62] hover:bg-[#D4AF62] hover:text-[#120D0B] flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Sliding Scalloped-Border Category Medallions */}
        <div
          ref={trackRef}
          className="flex gap-5 sm:gap-7 overflow-x-auto luxury-scroll pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
        >
          {displayedSubcategories.map(({ category, sub }) => (
            <button
              key={sub}
              type="button"
              onClick={() =>
                onNavigateShop({
                  category,
                  subcategory: sub,
                  title: tSubcategory(sub, lang),
                })
              }
              className="group w-[43vw] sm:w-[29%] md:w-[23.5%] lg:w-[19%] xl:w-[17.5%] max-w-[230px] shrink-0 snap-start flex flex-col items-center text-center focus-visible:outline-none"
            >
              {/* Scalloped Lotus-Arch Medallion Frame with Double Gold Border */}
              <div className="relative w-full aspect-square">
                <div
                  className="w-full h-full overflow-hidden bg-[#211713]"
                  style={{ clipPath: 'url(#sda-scallop-medallion)' }}
                >
                  <SafeImage
                    src={SUBCATEGORY_IMAGES[sub] || IMG.silkSarees}
                    alt={tSubcategory(sub, lang)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120D0B]/45 via-transparent to-transparent opacity-60 group-hover:opacity-25 transition-opacity" />
                </div>

                {/* Double Hairline Scalloped Gold Border Overlay */}
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute inset-0 w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]"
                  aria-hidden="true"
                >
                  <path
                    d={outerBorderD}
                    stroke="#D4AF62"
                    strokeWidth="1.75"
                    className="transition-colors duration-300 group-hover:stroke-[#F5DDA4]"
                  />
                  <path
                    d={innerBorderD}
                    stroke="#D4AF62"
                    strokeOpacity="0.65"
                    strokeWidth="1.15"
                    className="transition-colors duration-300 group-hover:stroke-[#D41472]"
                  />
                </svg>
              </div>

              {/* Clean Centered Title Below Medallion */}
              <div className="mt-3 px-1 w-full">
                <p className="font-serif text-base sm:text-lg font-medium text-[#F8F1E4] group-hover:text-[#D4AF62] transition-colors leading-snug line-clamp-1">
                  {tSubcategory(sub, lang)}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9BCA8]/80 mt-0.5">
                  {category}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* 3 Primary Luxury Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {pillarCards.map((pillar) => (
            <button
              key={pillar.category}
              type="button"
              onClick={() =>
                onNavigateShop({
                  category: pillar.category,
                  title: lang === 'te' ? pillar.titleTe : pillar.title,
                })
              }
              className="group relative rounded-xl overflow-hidden border border-[#D4AF62]/25 hover:border-[#D4AF62] aspect-[4/3] sm:aspect-[16/10] text-left transition-all shadow-xl shadow-black/40"
            >
              <SafeImage
                src={pillar.image}
                alt={pillar.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120D0B] via-[#120D0B]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF62]">
                    {pillar.countLabel}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F8F1E4] mt-1">
                    {lang === 'te' ? pillar.titleTe : pillar.title}
                  </h3>
                </div>
                <span className="h-10 w-10 rounded-full border border-[#D4AF62]/40 bg-[#120D0B]/70 text-[#D4AF62] group-hover:bg-[#D4AF62] group-hover:text-[#120D0B] flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
