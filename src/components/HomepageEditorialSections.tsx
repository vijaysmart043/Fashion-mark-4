import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Instagram,
  Mail,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { IMG } from '../server/seedData';
import type { Language, Product, StoreConfig } from '../shared/types';
import { ProductCarousel } from './ProductCarousel';
import { SafeImage } from './SdaLogo';

interface ShopByPriceProps {
  lang: Language;
  onSelectPriceRange: (min: number, max: number, label: string) => void;
}

export const ShopByPriceSection: React.FC<ShopByPriceProps> = ({
  lang,
  onSelectPriceRange,
}) => {
  const t = TRANSLATIONS[lang];
  const tiers = [
    {
      label: lang === 'te' ? '₹2,999 లోపు' : 'Under ₹2,999',
      subtitle: lang === 'te' ? 'మంగళగిరి కాటన్ & ఫ్యాషన్ జ్యువెలరీ' : 'Mangalagiri Cottons & Everyday Chic',
      min: 0,
      max: 2999,
      accent: 'Daily Luxury',
    },
    {
      label: '₹3,000 – ₹11,999',
      subtitle: lang === 'te' ? 'ఆర్గంజా, గద్వాల్ & ఎత్నిక్ సెట్స్' : 'Organza, Gadwal Silks & Sharara Sets',
      min: 3000,
      max: 11999,
      accent: 'Festive Grace',
    },
    {
      label: '₹12,000 – ₹29,999',
      subtitle: lang === 'te' ? 'కలంకారీ, బనారసి & అనార్కలీ గౌన్లు' : 'Banarasi Kadwa, Kalamkari & Anarkalis',
      min: 12000,
      max: 29999,
      accent: 'Occasion Couture',
    },
    {
      label: lang === 'te' ? '₹30,000+ రాయల్ కలెక్షన్' : '₹30,000+ Royal Bridal',
      subtitle: lang === 'te' ? '22K టెంపుల్ గోల్డ్, కంచి పట్టు & లెహెంగాలు' : '22K Temple Gold, Kanchi Silk & Lehengas',
      min: 30000,
      max: 999999,
      accent: 'Heirloom Tier',
    },
  ];

  return (
    <section className="bg-[#18110E] py-14 sm:py-18 border-b border-[#D4AF62]/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4]">
            {t.sections.shopByPrice}
          </h2>
          <p className="mt-1.5 text-sm text-[#C9BCA8]">{t.sections.shopByPriceSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier) => (
            <button
              key={tier.label}
              type="button"
              onClick={() => onSelectPriceRange(tier.min, tier.max, tier.label)}
              className="group text-left p-6 rounded-xl bg-[#120D0B] border border-[#D4AF62]/25 hover:border-[#D4AF62] transition-all hover:-translate-y-0.5 flex flex-col justify-between gap-4"
            >
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#D41472] font-medium">
                  {tier.accent}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#D4AF62] mt-2 tabular-nums">
                  {tier.label}
                </h3>
                <p className="text-xs sm:text-sm text-[#C9BCA8] mt-2 leading-relaxed">
                  {tier.subtitle}
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-[#F8F1E4] group-hover:text-[#D4AF62] transition-colors">
                {t.actions.exploreCollections} →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

interface WeddingFestiveProps {
  products: Product[];
  config: StoreConfig;
  lang: Language;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onNavigateShop: (opts: { category?: string; flag?: string; title?: string }) => void;
}

export const WeddingFestiveSection: React.FC<WeddingFestiveProps> = ({
  products,
  config,
  lang,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onSelectProduct,
  onAddToCart,
  onNavigateShop,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-gradient-to-b from-[#230C15] via-[#170C10] to-[#120D0B] border-b border-[#D4AF62]/15">
      {/* Editorial Bridal Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-2xl overflow-hidden border border-[#D4AF62]/30 bg-[#180C11]">
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-5">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF62]">
              Muhurtham & Sangeet Edit
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F8F1E4] leading-tight">
              {t.sections.weddingFestive}
            </h2>
            <p className="text-sm sm:text-base text-[#DFD3C0] leading-relaxed">
              {t.sections.weddingFestiveSub}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  onNavigateShop({
                    category: 'Wedding & Festive',
                    title: t.sections.weddingFestive,
                  })
                }
                className="px-7 py-3 rounded-lg bg-[#D4AF62] hover:bg-[#E6C57A] text-[#120D0B] text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
              >
                {t.actions.exploreCollections}
              </button>
            </div>
          </div>
          <div className="lg:col-span-6 aspect-[16/9] lg:aspect-auto lg:h-full">
            <SafeImage
              src={IMG.heroBridal}
              alt="Wedding and Festive Collection"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Curated Wedding & Festive Carousel */}
      <ProductCarousel
        title={lang === 'te' ? 'బ్రైడల్ & ముహూర్తపు ఎంపికలు' : 'Curated Bridal Trousseau'}
        products={products}
        config={config}
        lang={lang}
        wishlistIds={wishlistIds}
        onToggleWishlist={onToggleWishlist}
        onQuickView={onQuickView}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        onViewAll={() =>
          onNavigateShop({ category: 'Wedding & Festive', title: t.sections.weddingFestive })
        }
        accentTone="maroon"
      />
    </div>
  );
};

interface SpecialOffersProps {
  config: StoreConfig;
  offerProducts: Product[];
  lang: Language;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onNavigateShop: (opts: { category?: string; flag?: string; title?: string }) => void;
}

export const SpecialOffersSection: React.FC<SpecialOffersProps> = ({
  config,
  offerProducts,
  lang,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onSelectProduct,
  onAddToCart,
  onNavigateShop,
}) => {
  const t = TRANSLATIONS[lang];
  const activePromos = config.promoSections.filter((p) => p.active);

  return (
    <section className="bg-[#120D0B] py-14 sm:py-18 border-b border-[#D4AF62]/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4]">
              {t.sections.specialOffers}
            </h2>
            <p className="mt-1.5 text-sm text-[#C9BCA8]">{t.sections.specialOffersSub}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateShop({ flag: 'offers', title: t.sections.specialOffers })}
            className="text-xs uppercase tracking-[0.18em] text-[#D4AF62] hover:text-[#F8F1E4] border-b border-[#D4AF62]/40 pb-0.5 self-start sm:self-auto"
          >
            {t.actions.viewAll}
          </button>
        </div>

        {/* Admin-configurable Promo Cards */}
        {activePromos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePromos.map((promo) => (
              <div
                key={promo.id}
                className="relative rounded-xl overflow-hidden border border-[#D4AF62]/30 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] flex items-end bg-[#211713]"
              >
                <SafeImage
                  src={promo.imageUrl}
                  alt={promo.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120D0B] via-[#120D0B]/70 to-transparent" />
                <div className="relative z-10 p-6 sm:p-8 space-y-2.5">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#D41472] font-semibold">
                    {promo.discountTag}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F8F1E4]">
                    {lang === 'te' ? promo.titleTe : promo.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#DFD3C0] max-w-md">
                    {lang === 'te' ? promo.subtitleTe : promo.subtitle}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateShop({
                          category: promo.targetCategory,
                          title: lang === 'te' ? promo.titleTe : promo.title,
                        })
                      }
                      className="px-5 py-2.5 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider hover:bg-[#E7C77A] transition-colors"
                    >
                      {t.actions.shopNow}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discounted Offer Products */}
      <ProductCarousel
        title={lang === 'te' ? 'ప్రత్యేక ధరలలో ఆభరణాలు & చీరలు' : 'Festive Privilege Selection'}
        products={offerProducts}
        config={config}
        lang={lang}
        wishlistIds={wishlistIds}
        onToggleWishlist={onToggleWishlist}
        onQuickView={onQuickView}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        onViewAll={() => onNavigateShop({ flag: 'offers', title: t.sections.specialOffers })}
      />
    </section>
  );
};

export const TestimonialsSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const reviews = [
    {
      name: 'Padmavathi Reddy',
      role: 'Bridal Trousseau Patron · Hyderabad',
      purchase: 'Mahalakshmi Nakshi Temple Choker & Kanchi Silk',
      quote:
        'Every gram of 22K gold was billed transparently against the live daily rate. When my daughter walked into the mandapam wearing the Nakshi choker and crimson Kanjeevaram, the craftsmanship spoke for itself.',
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Architect & Sangeet Bride · Bengaluru',
      purchase: 'Begum Wine-Magenta Zardozi Lehenga',
      quote:
        'Ordering bridal couture online usually feels risky, but SDA’s concierge confirmed measurements within an hour and delivered a museum-worthy zardozi lehenga four days ahead of schedule.',
    },
    {
      name: 'Sridevi Narasimhan',
      role: 'Classical Dancer · Vijayawada',
      purchase: 'Gadwal Kuttu Silk-Cotton & Kalamkari Saree',
      quote:
        'The Gadwal temple border and hand-painted Srikalahasti Kalamkari arrived with Silk Mark certification in a signature black-and-gold keepsake box. Authentic Telugu handloom heritage.',
    },
  ];

  return (
    <section className="bg-[#18110E] py-14 sm:py-20 border-b border-[#D4AF62]/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4]">
            {t.sections.testimonials}
          </h2>
          <p className="mt-1.5 text-sm text-[#C9BCA8]">{t.sections.testimonialsSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((item) => (
            <blockquote
              key={item.name}
              className="p-7 rounded-xl bg-[#120D0B] border border-[#D4AF62]/20 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="text-[#D4AF62] text-sm tracking-widest" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <p className="font-serif text-lg sm:text-xl text-[#F8F1E4] leading-relaxed italic">
                  “{item.quote}”
                </p>
              </div>
              <footer className="pt-4 border-t border-[#D4AF62]/15">
                <p className="text-sm font-semibold text-[#D4AF62]">{item.name}</p>
                <p className="text-xs text-[#C9BCA8] mt-0.5">{item.role}</p>
                <p className="text-[11px] text-[#C9BCA8]/70 mt-1">{item.purchase}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ServiceBenefitsSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const benefits = [
    {
      icon: ShieldCheck,
      title: lang === 'te' ? '916 BIS హాల్‌మార్క్ స్వచ్ఛత' : 'BIS Hallmarked Purity',
      desc:
        lang === 'te'
          ? 'ప్రతి బంగారు ఆభరణానికి లైవ్ బరువు-ధర మరియు 916 హాల్‌మార్క్ సర్టిఫికెట్.'
          : 'Every gold piece carries 916 BIS hallmark certification with transparent weight pricing.',
    },
    {
      icon: Award,
      title: lang === 'te' ? 'సిల్క్ మార్క్ చేనేత హామీ' : 'Certified Heritage Looms',
      desc:
        lang === 'te'
          ? 'కంచి, బనారసి మరియు గద్వాల్ చేనేత పట్టు చీరలకు సిల్క్ మార్క్ సర్టిఫికేషన్.'
          : 'Authentic Kanchipuram, Banarasi & Gadwal weaves verified with Silk Mark India.',
    },
    {
      icon: Truck,
      title: lang === 'te' ? 'భీమా చేసిన ఉచిత డెలివరీ' : 'Insured Pan-India Express',
      desc:
        lang === 'te'
          ? '₹2,999 పైబడిన ఆర్డర్లపై భారతదేశం అంతటా ఉచిత మరియు సురక్షిత డెలివరీ.'
          : 'Complimentary insured courier across India on orders above ₹2,999.',
    },
    {
      icon: Sparkles,
      title: lang === 'te' ? '14 రోజుల సులభ మార్పిడి' : '14-Day Couture Exchange',
      desc:
        lang === 'te'
          ? 'ప్రత్యేక కస్టమర్ సపోర్ట్ మరియు సులభమైన సైజ్ మార్పిడి సౌకర్యం.'
          : 'Dedicated bridal stylists and seamless size or style exchanges.',
    },
  ];

  return (
    <section className="bg-[#120D0B] py-14 sm:py-16 border-b border-[#D4AF62]/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F8F1E4] text-center mb-10">
          {t.sections.serviceBenefits}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-6 rounded-xl bg-[#1A120F] border border-[#D4AF62]/20 text-center flex flex-col items-center gap-3"
              >
                <div className="h-12 w-12 rounded-full bg-[#211713] border border-[#D4AF62]/35 flex items-center justify-center text-[#D4AF62]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#F8F1E4]">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#C9BCA8] leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const SocialGallerySection: React.FC<{
  lang: Language;
  handle: string;
  onNavigateShop: (opts: { category?: string; title?: string }) => void;
}> = ({ lang, handle, onNavigateShop }) => {
  const t = TRANSLATIONS[lang];
  const tiles = [
    { image: IMG.heroRoyal, label: 'Royal Crown Edit', category: 'Jewellery' },
    { image: IMG.kanchiCrimson, label: 'Kanchipuram Muhurtham', category: 'Sarees' },
    { image: IMG.goldJewellery, label: 'Temple Nakshi Haram', category: 'Jewellery' },
    { image: IMG.designerDresses, label: 'Zardozi Lehenga', category: 'Dresses' },
    { image: IMG.cottonOrganza, label: 'Gadwal & Kalamkari', category: 'Sarees' },
    { image: IMG.goldBangles, label: 'Jadau Kada Stack', category: 'Jewellery' },
  ];

  return (
    <section className="bg-[#16100D] py-14 sm:py-18 border-b border-[#D4AF62]/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4]">
              {t.sections.socialGallery}
            </h2>
            <p className="mt-1.5 text-sm text-[#C9BCA8]">{t.sections.socialGallerySub}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#D4AF62]">
            <Instagram className="h-4 w-4 text-[#D41472]" />
            <span>{handle}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tiles.map((tile) => (
            <button
              key={tile.label}
              type="button"
              onClick={() => onNavigateShop({ category: tile.category, title: tile.label })}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-[#D4AF62]/20 hover:border-[#D4AF62] transition-all"
            >
              <SafeImage
                src={tile.image}
                alt={tile.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120D0B]/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-xs font-medium text-[#F8F1E4]">{tile.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export const NewsletterSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      setStatus('success');
      setMessage(data.message);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Unable to subscribe.');
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#1A1014] to-[#120D0B] py-14 sm:py-20 border-b border-[#D4AF62]/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
        <span className="text-xs uppercase tracking-[0.26em] text-[#D4AF62]">
          Your Style... Our Priority...
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4]">
          {t.sections.newsletterTitle}
        </h2>
        <p className="text-sm text-[#C9BCA8] max-w-xl mx-auto">
          {t.sections.newsletterSub}
        </p>

        <form
          onSubmit={handleSubscribe}
          className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg mx-auto"
        >
          <div className="relative flex-1">
            <Mail className="h-4 w-4 text-[#D4AF62] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={lang === 'te' ? 'మీ ఇమెయిల్ చిరునామా...' : 'Enter your email address...'}
              aria-label="Email address for newsletter"
              className="w-full bg-[#211713] text-[#F8F1E4] placeholder-[#C9BCA8]/60 text-sm pl-11 pr-4 py-3.5 rounded-lg border border-[#D4AF62]/30 focus:border-[#D4AF62] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-7 py-3.5 rounded-lg bg-[#D4AF62] hover:bg-[#E7C77A] text-[#120D0B] text-xs font-semibold uppercase tracking-[0.18em] transition-colors whitespace-nowrap disabled:opacity-60"
          >
            {status === 'loading' ? '...' : t.actions.subscribe}
          </button>
        </form>

        {status === 'success' && (
          <p className="inline-flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>{message}</span>
          </p>
        )}
        {status === 'error' && <p className="text-xs text-rose-400">{message}</p>}
      </div>
    </section>
  );
};
