import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language, Product, StoreConfig } from '../shared/types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  id?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  config: StoreConfig;
  lang: Language;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onViewAll?: () => void;
  accentTone?: 'default' | 'charcoal' | 'maroon';
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  id,
  title,
  subtitle,
  products,
  config,
  lang,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onSelectProduct,
  onAddToCart,
  onViewAll,
  accentTone = 'default',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -Math.max(300, width * 0.75) : Math.max(300, width * 0.75),
      behavior: 'smooth',
    });
  };

  const bgClass =
    accentTone === 'charcoal'
      ? 'bg-[#18110E]'
      : accentTone === 'maroon'
        ? 'bg-gradient-to-b from-[#1D0D13] to-[#120D0B]'
        : 'bg-[#120D0B]';

  if (products.length === 0) return null;

  return (
    <section id={id} className={`${bgClass} py-12 sm:py-16 border-b border-[#D4AF62]/10`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#F8F1E4]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-sm text-[#C9BCA8] max-w-2xl">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollByAmount('left')}
                aria-label={`Scroll ${title} left`}
                className="h-9 w-9 rounded-full border border-[#D4AF62]/30 text-[#D4AF62] hover:bg-[#D4AF62] hover:text-[#120D0B] flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount('right')}
                aria-label={`Scroll ${title} right`}
                className="h-9 w-9 rounded-full border border-[#D4AF62]/30 text-[#D4AF62] hover:bg-[#D4AF62] hover:text-[#120D0B] flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs uppercase tracking-[0.18em] text-[#D4AF62] hover:text-[#F8F1E4] border-b border-[#D4AF62]/40 pb-0.5 transition-colors whitespace-nowrap"
              >
                {t.actions.viewAll}
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Scrollable Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto luxury-scroll pb-4 snap-x snap-mandatory"
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="w-[76vw] sm:w-[46%] md:w-[31.5%] lg:w-[29%] xl:w-[23.5%] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                config={config}
                lang={lang}
                isWishlisted={wishlistIds.includes(product._id)}
                onToggleWishlist={onToggleWishlist}
                onQuickView={onQuickView}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
