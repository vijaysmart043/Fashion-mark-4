import React from 'react';
import { Eye, Heart, Scale, ShoppingBag } from 'lucide-react';
import { TRANSLATIONS, tSubcategory } from '../i18n/translations';
import type { Language, Product, StoreConfig } from '../shared/types';
import { calculateVariantPricing, formatINR } from '../shared/types';
import { SafeImage } from './SdaLogo';

interface ProductCardProps {
  product: Product;
  config: StoreConfig;
  lang: Language;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  config,
  lang,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onSelectProduct,
  onAddToCart,
}) => {
  const t = TRANSLATIONS[lang];
  const defaultVariant =
    product.variants.find((v) => v.stock > 0) || product.variants[0];
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const pricing = calculateVariantPricing(product, defaultVariant, config);

  const stockLabel =
    totalStock === 0
      ? t.actions.outOfStock
      : totalStock <= 4
        ? `${totalStock} left`
        : t.actions.inStock;

  return (
    <article className="group bg-[#1A120F] border border-[#D4AF62]/20 hover:border-[#D4AF62]/55 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/30">
      {/* Consistent 4:3 Image Frame */}
      <div className="relative aspect-[4/3] w-full bg-[#211713] overflow-hidden">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="block w-full h-full text-left focus-visible:outline-none"
          aria-label={lang === 'te' ? product.nameTe : product.name}
        >
          <SafeImage
            src={product.images[0]}
            alt={lang === 'te' ? product.nameTe : product.name}
            fallbackTitle={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>

        {/* Subtle gradient scrim for top/bottom icon legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/55 to-transparent" />

        {/* Wishlist & Quick View Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onQuickView(product)}
            aria-label={t.actions.quickView}
            title={t.actions.quickView}
            className="h-9 w-9 rounded-full bg-[#120D0B]/80 backdrop-blur-sm border border-[#D4AF62]/30 text-[#F8F1E4] hover:text-[#D4AF62] hover:border-[#D4AF62] flex items-center justify-center transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleWishlist(product._id)}
            aria-label="Toggle wishlist"
            title="Wishlist"
            className={`h-9 w-9 rounded-full bg-[#120D0B]/80 backdrop-blur-sm border flex items-center justify-center transition-colors ${
              isWishlisted
                ? 'border-[#D41472] text-[#D41472]'
                : 'border-[#D4AF62]/30 text-[#F8F1E4] hover:text-[#D41472]'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-[#D41472]' : ''}`} />
          </button>
        </div>

        {/* Clean single top-left indicator if weight-priced or high discount */}
        {product.isWeightPriced && defaultVariant?.weightGrams ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#120D0B]/85 border border-[#D4AF62]/35 text-[10px] tracking-wider text-[#D4AF62]">
            <Scale className="h-3 w-3" />
            <span className="tabular-nums">{defaultVariant.weightGrams}g {product.metalType}</span>
          </span>
        ) : pricing.discountPercent > 0 ? (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#65102F]/90 border border-[#D4AF62]/30 text-[10px] font-medium tracking-wider text-[#F8F1E4] tabular-nums">
            -{pricing.discountPercent}%
          </span>
        ) : null}
      </div>

      {/* Product Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Unboxed clean metadata line */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#C9BCA8]">
            <span className="truncate">{tSubcategory(product.subcategory, lang)}</span>
            <span
              className={`shrink-0 font-medium ${
                totalStock === 0 ? 'text-rose-400' : 'text-[#D4AF62]'
              }`}
            >
              {stockLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="mt-1.5 text-left block w-full"
          >
            <h3 className="font-serif text-lg leading-snug font-semibold text-[#F8F1E4] group-hover:text-[#D4AF62] transition-colors line-clamp-2">
              {lang === 'te' ? product.nameTe : product.name}
            </h3>
          </button>
        </div>

        <div className="pt-2 border-t border-[#D4AF62]/10 space-y-3">
          {/* Pricing Row */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base font-semibold text-[#F8F1E4] tabular-nums">
                {formatINR(pricing.currentPrice)}
              </span>
              {pricing.originalPrice > pricing.currentPrice && (
                <span className="text-xs text-[#C9BCA8]/65 line-through tabular-nums">
                  {formatINR(pricing.originalPrice)}
                </span>
              )}
            </div>
            {pricing.discountPercent > 0 && (
              <span className="text-[11px] font-medium text-[#D41472] tabular-nums shrink-0">
                {pricing.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Action CTA */}
          <button
            type="button"
            disabled={totalStock === 0}
            onClick={() => onAddToCart(product, defaultVariant?.id)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#261A15] hover:bg-[#D4AF62] text-[#D4AF62] hover:text-[#120D0B] border border-[#D4AF62]/35 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-45 disabled:cursor-not-allowed min-h-[40px]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{totalStock === 0 ? t.actions.outOfStock : t.actions.addToCart}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
