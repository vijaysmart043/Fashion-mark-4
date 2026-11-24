import React, { useState } from 'react';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { TRANSLATIONS, tSubcategory } from '../i18n/translations';
import type { Language, Product, StoreConfig } from '../shared/types';
import { calculateVariantPricing, formatINR } from '../shared/types';
import { SafeImage } from './SdaLogo';

interface QuickViewModalProps {
  product: Product | null;
  config: StoreConfig;
  lang: Language;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, variantId: string) => void;
  onViewDetails: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  config,
  lang,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  if (!product) return null;

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants.find((v) => v.stock > 0) ||
    product.variants[0];

  const pricing = calculateVariantPricing(product, activeVariant, config);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#18110E] border border-[#D4AF62]/35 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-[#120D0B]/85 border border-[#D4AF62]/30 text-[#F8F1E4] hover:text-[#D4AF62] flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="aspect-[4/3] md:aspect-auto md:min-h-[380px] md:h-full bg-[#211713]">
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF62]">
              {tSubcategory(product.subcategory, lang)}
            </span>
            <h3 className="font-serif text-2xl font-semibold text-[#F8F1E4]">
              {lang === 'te' ? product.nameTe : product.name}
            </h3>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-[#D4AF62] tabular-nums">
                {formatINR(pricing.currentPrice)}
              </span>
              {pricing.originalPrice > pricing.currentPrice && (
                <span className="text-sm text-[#C9BCA8]/60 line-through tabular-nums">
                  {formatINR(pricing.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs text-[#C9BCA8] leading-relaxed line-clamp-3">
              {lang === 'te' ? product.descriptionTe : product.description}
            </p>

            {/* Variants */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-[#C9BCA8]">
                Variant ({activeVariant?.stock ?? 0} in stock)
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const active = v.id === activeVariant?.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                        active
                          ? 'bg-[#D4AF62] text-[#120D0B] border-[#D4AF62] font-semibold'
                          : 'bg-[#211713] text-[#F8F1E4] border-[#D4AF62]/25'
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#D4AF62]/15">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!activeVariant || activeVariant.stock === 0}
                onClick={() => {
                  if (activeVariant) {
                    onAddToCart(product, activeVariant.id);
                    onClose();
                  }
                }}
                className="flex-1 py-3 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-[#E7C77A] disabled:opacity-45"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{t.actions.addToCart}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(product._id)}
                className={`h-11 w-11 rounded-lg border flex items-center justify-center ${
                  isWishlisted
                    ? 'border-[#D41472] text-[#D41472]'
                    : 'border-[#D4AF62]/30 text-[#F8F1E4]'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-[#D41472]' : ''}`} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewDetails(product);
              }}
              className="w-full py-2 text-xs text-[#D4AF62] hover:text-[#F8F1E4] underline underline-offset-4"
            >
              View Full Details, Zoom & Weight Breakdown →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
