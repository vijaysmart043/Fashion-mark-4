import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  Heart,
  MapPin,
  Minus,
  Plus,
  Scale,
  ShieldCheck,
  ShoppingBag,
  ZoomIn,
} from 'lucide-react';
import { TRANSLATIONS, tSubcategory } from '../i18n/translations';
import type { Language, Product, StoreConfig } from '../shared/types';
import { calculateVariantPricing, formatINR } from '../shared/types';
import { ProductCarousel } from './ProductCarousel';
import { SafeImage } from './SdaLogo';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  config: StoreConfig;
  lang: Language;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, variantId: string, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onProductUpdated: (updated: Product) => void;
  onBack: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  config,
  lang,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onQuickView,
  onProductUpdated,
  onBack,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const defaultVariant =
    product.variants.find((v) => v.stock > 0) || product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id || '');
  const [quantity, setQuantity] = useState(1);

  const [pincode, setPincode] = useState('');
  const [pinStatus, setPinStatus] = useState<{
    loading: boolean;
    message?: string;
    valid?: boolean;
  }>({ loading: false });

  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) || defaultVariant;

  const pricing = calculateVariantPricing(product, activeVariant, config);
  const totalPrice = pricing.currentPrice * quantity;
  const maxStock = activeVariant?.stock ?? 0;

  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p._id !== product._id && p.category === product.category)
      .slice(0, 6);
  }, [allProducts, product]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  const handleCheckPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setPinStatus({ loading: true });
    try {
      const res = await fetch(`/api/pincode/${encodeURIComponent(pincode.trim())}`);
      const data = await res.json();
      setPinStatus({
        loading: false,
        valid: res.ok && data.valid,
        message: data.message,
      });
    } catch {
      setPinStatus({
        loading: false,
        valid: false,
        message: 'Unable to verify PIN code right now.',
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: reviewAuthor,
          city: reviewCity || 'Hyderabad',
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Product;
        onProductUpdated(updated);
        setReviewAuthor('');
        setReviewCity('');
        setReviewComment('');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="bg-[#120D0B] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        {/* Back Breadcrumb */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-[#D4AF62] hover:text-[#F8F1E4] mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Collection</span>
        </button>

        {/* Contiguous PDP Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Gallery with Interactive Image Zoom */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 space-y-4">
            <div
              onClick={() => setZoomActive((z) => !z)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomActive(false)}
              className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#D4AF62]/30 bg-[#211713] cursor-zoom-in"
            >
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={lang === 'te' ? product.nameTe : product.name}
                referrerPolicy="no-referrer"
                style={
                  zoomActive
                    ? {
                        transform: 'scale(1.9)',
                        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      }
                    : undefined
                }
                className="w-full h-full object-cover transition-transform duration-150"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomActive((z) => !z);
                }}
                aria-label="Toggle image zoom"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#120D0B]/85 border border-[#D4AF62]/35 text-xs text-[#D4AF62] inline-flex items-center gap-1.5"
              >
                <ZoomIn className="h-3.5 w-3.5" />
                <span>{zoomActive ? 'Reset Zoom' : 'Hover / Click to Zoom'}</span>
              </button>
            </div>

            {/* Multiple Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`aspect-[4/3] w-24 sm:w-28 rounded-lg overflow-hidden border shrink-0 transition-all ${
                      idx === selectedImageIdx
                        ? 'border-[#D4AF62] ring-1 ring-[#D4AF62]'
                        : 'border-[#D4AF62]/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#D4AF62] tracking-wider uppercase">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{tSubcategory(product.subcategory, lang)}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#C9BCA8]">SKU {product.sku}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4] mt-2 leading-tight">
                {lang === 'te' ? product.nameTe : product.name}
              </h1>

              <div className="flex items-center gap-3 mt-2 text-xs text-[#C9BCA8]">
                <span className="text-[#D4AF62]">★ {product.rating}</span>
                <span>({product.reviewCount} verified reviews)</span>
              </div>
            </div>

            {/* Price & Live Calculation */}
            <div className="p-5 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-semibold text-[#D4AF62] tabular-nums">
                  {formatINR(totalPrice)}
                </span>
                {pricing.originalPrice > pricing.currentPrice && (
                  <span className="text-base text-[#C9BCA8]/60 line-through tabular-nums">
                    {formatINR(pricing.originalPrice * quantity)}
                  </span>
                )}
                {pricing.discountPercent > 0 && (
                  <span className="text-xs font-semibold text-[#D41472] uppercase tracking-wider">
                    Save {pricing.discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-xs text-[#C9BCA8]">
                Inclusive of all taxes ·{' '}
                {totalPrice >= 2999
                  ? 'Qualifies for Complimentary Insured Shipping'
                  : 'Standard insured shipping ₹199'}
              </p>

              {/* Jewellery Weight-Pricing Breakdown */}
              {pricing.breakdown && (
                <div className="pt-3 border-t border-[#D4AF62]/15 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#D4AF62] font-medium mb-1">
                    <Scale className="h-3.5 w-3.5" />
                    <span>
                      Live {product.metalType} Weight-Price Breakdown ({pricing.breakdown.weightGrams}g ×{' '}
                      {formatINR(pricing.breakdown.ratePerGram)}/g)
                    </span>
                  </div>
                  <div className="flex justify-between text-[#C9BCA8] tabular-nums">
                    <span>Metal Value ({pricing.breakdown.weightGrams}g)</span>
                    <span>{formatINR(pricing.breakdown.metalValue)}</span>
                  </div>
                  <div className="flex justify-between text-[#C9BCA8] tabular-nums">
                    <span>Artisan Making Charges ({product.makingChargePercent}%)</span>
                    <span>{formatINR(pricing.breakdown.makingCharge)}</span>
                  </div>
                  <div className="flex justify-between text-[#C9BCA8] tabular-nums">
                    <span>GST ({product.gstPercent}%)</span>
                    <span>{formatINR(pricing.breakdown.gstAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-[#DFD3C0] leading-relaxed">
              {lang === 'te' ? product.descriptionTe : product.description}
            </p>

            {/* Variant Selection with Live Variant Stock */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#C9BCA8]">
                  Select Variant / Size / Weight
                </span>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    maxStock > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {maxStock > 0 ? `${maxStock} in stock for selected variant` : 'Out of Stock'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants.map((variant) => {
                  const selected = variant.id === activeVariant?.id;
                  const vPricing = calculateVariantPricing(product, variant, config);
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selected
                          ? 'bg-[#261A15] border-[#D4AF62] ring-1 ring-[#D4AF62]/50'
                          : 'bg-[#1A120F] border-[#D4AF62]/20 hover:border-[#D4AF62]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-[#F8F1E4]">
                          <span
                            className="h-3 w-3 rounded-full border border-white/25 shrink-0"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                          <span>{lang === 'te' && variant.labelTe ? variant.labelTe : variant.label}</span>
                        </span>
                        <span className="text-xs font-semibold text-[#D4AF62] tabular-nums">
                          {formatINR(vPricing.currentPrice)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-[#C9BCA8]">
                        <span>{variant.sizeOrLength}</span>
                        <span className="tabular-nums">
                          {variant.stock > 0 ? `${variant.stock} avail.` : 'Sold out'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Primary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="inline-flex items-center justify-between border border-[#D4AF62]/30 rounded-lg bg-[#1A120F] px-2 h-12 sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-2 text-[#D4AF62] hover:text-[#F8F1E4]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.max(1, maxStock), q + 1))}
                  aria-label="Increase quantity"
                  className="p-2 text-[#D4AF62] hover:text-[#F8F1E4]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={maxStock === 0}
                onClick={() =>
                  activeVariant && onAddToCart(product, activeVariant.id, quantity)
                }
                className="flex-1 h-12 px-6 rounded-lg bg-[#D4AF62] hover:bg-[#E6C67A] text-[#120D0B] text-xs font-semibold uppercase tracking-[0.18em] inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-45"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {maxStock === 0
                    ? t.actions.outOfStock
                    : `${t.actions.addToCart} · ${formatINR(totalPrice)}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWishlist(product._id)}
                aria-label="Toggle wishlist"
                className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                  isWishlisted
                    ? 'border-[#D41472] bg-[#D41472]/15 text-[#D41472]'
                    : 'border-[#D4AF62]/30 bg-[#1A120F] text-[#F8F1E4] hover:border-[#D41472]'
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-[#D41472]' : ''}`} />
              </button>
            </div>

            {/* Delivery PIN Code Checker */}
            <div className="p-4 rounded-xl bg-[#1A120F] border border-[#D4AF62]/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#F8F1E4]">
                <MapPin className="h-4 w-4 text-[#D4AF62]" />
                <span>Check Delivery & Insured Courier Availability</span>
              </div>
              <form onSubmit={handleCheckPin} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN (e.g. 500034)"
                  className="flex-1 bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4] tabular-nums focus:border-[#D4AF62] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={pinStatus.loading}
                  className="px-4 py-2 rounded-lg bg-[#261A15] border border-[#D4AF62]/40 text-xs font-medium text-[#D4AF62] hover:bg-[#D4AF62] hover:text-[#120D0B] transition-colors"
                >
                  {pinStatus.loading ? '...' : t.actions.checkPin}
                </button>
              </form>
              {pinStatus.message && (
                <p
                  className={`text-xs flex items-center gap-1.5 ${
                    pinStatus.valid ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {pinStatus.valid && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                  <span>{pinStatus.message}</span>
                </p>
              )}
            </div>

            {/* Product Specifications */}
            <div className="rounded-xl bg-[#1A120F] border border-[#D4AF62]/20 overflow-hidden">
              <div className="px-5 py-3 border-b border-[#D4AF62]/15 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#D4AF62]" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF62]">
                  Atelier Specifications
                </h2>
              </div>
              <dl className="divide-y divide-[#D4AF62]/10 text-xs sm:text-sm">
                <div className="px-5 py-3 flex justify-between gap-4">
                  <dt className="text-[#C9BCA8]">Material</dt>
                  <dd className="text-[#F8F1E4] text-right">{product.material}</dd>
                </div>
                <div className="px-5 py-3 flex justify-between gap-4">
                  <dt className="text-[#C9BCA8]">Occasion</dt>
                  <dd className="text-[#F8F1E4] text-right">{product.occasion.join(', ')}</dd>
                </div>
                {product.specifications.map((spec) => (
                  <div key={spec.label} className="px-5 py-3 flex justify-between gap-4">
                    <dt className="text-[#C9BCA8]">{spec.label}</dt>
                    <dd className="text-[#F8F1E4] text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 pt-12 border-t border-[#D4AF62]/20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F8F1E4]">
              Patron Reviews ({product.reviews.length})
            </h2>
            {product.reviews.length === 0 ? (
              <p className="text-sm text-[#C9BCA8]">
                Be the first patron to review this piece from SDA Collections.
              </p>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-xl bg-[#1A120F] border border-[#D4AF62]/15 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#D4AF62]">
                        {rev.author} · {rev.city}
                      </span>
                      <span className="text-[#C9BCA8] tabular-nums">{rev.createdAt}</span>
                    </div>
                    <div className="text-xs text-[#D4AF62]">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className="text-sm text-[#DFD3C0]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleReviewSubmit}
            className="lg:col-span-5 p-6 rounded-xl bg-[#1A120F] border border-[#D4AF62]/20 space-y-4 self-start"
          >
            <h3 className="font-serif text-xl font-semibold text-[#D4AF62]">
              Share Your Experience
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                placeholder="Your Name"
                className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
              <input
                type="text"
                value={reviewCity}
                onChange={(e) => setReviewCity(e.target.value)}
                placeholder="City (e.g. Hyderabad)"
                className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#C9BCA8] mb-1">Rating</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
              >
                <option value={5}>5 Stars — Royal Excellence</option>
                <option value={4}>4 Stars — Very Satisfied</option>
                <option value={3}>3 Stars — Good</option>
              </select>
            </div>
            <textarea
              required
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell future brides and shoppers about the craftsmanship, drape, or finish..."
              className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
            />
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider hover:bg-[#E7C77A]"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      <ProductCarousel
        title={lang === 'te' ? 'సంబంధిత కలెక్షన్లు' : 'You May Also Cherish'}
        products={relatedProducts}
        config={config}
        lang={lang}
        wishlistIds={[]}
        onToggleWishlist={onToggleWishlist}
        onQuickView={onQuickView}
        onSelectProduct={onSelectProduct}
        onAddToCart={(p, vId) => onAddToCart(p, vId || p.variants[0]?.id, 1)}
        accentTone="charcoal"
      />
    </div>
  );
};
