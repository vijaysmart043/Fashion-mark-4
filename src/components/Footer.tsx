import React from 'react';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language, StoreConfig } from '../shared/types';
import { SdaLogo } from './SdaLogo';

interface FooterProps {
  config: StoreConfig;
  lang: Language;
  onNavigateHome: () => void;
  onNavigateShop: (opts: { category?: string; flag?: string; title?: string }) => void;
  onOpenInfo: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  lang,
  onNavigateHome,
  onNavigateShop,
  onOpenInfo,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="bg-[#0C0807] border-t border-[#D4AF62]/25 text-[#C9BCA8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: SDA COLLECTIONS */}
          <div className="lg:col-span-4 space-y-4">
            <SdaLogo
              logoUrl={config.logoUrl}
              brandName={config.brandName}
              tagline={config.tagline}
              showTagline
            />
            <p className="text-xs sm:text-sm leading-relaxed text-[#C9BCA8] max-w-sm pt-2">
              {lang === 'te'
                ? 'సంప్రదాయ 22K బంగారు ఆభరణాలు, స్వచ్ఛమైన కంచి మరియు బనారసి పట్టు చీరలు, మరియు రాయల్ డిజైనర్ డ్రెస్సుల విశ్వసనీయ గమ్యస్థానం.'
                : 'A luxury house of 22K BIS hallmarked temple jewellery, heritage Kanchipuram & Banarasi weaves, and bespoke designer couture.'}
            </p>
            <p className="font-serif italic text-sm text-[#D4AF62]">
              “{config.secondarySlogan}” · “{config.brandMessage}”
            </p>

            {/* Editable Contact Details */}
            <div className="pt-2 space-y-2 text-xs text-[#C9BCA8]">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#D4AF62] shrink-0 mt-0.5" />
                <span>{lang === 'te' ? config.contact.addressTe : config.contact.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#D4AF62] shrink-0" />
                <span>{config.contact.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D4AF62] shrink-0" />
                <span>{config.contact.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-[#D41472] shrink-0" />
                <span>{config.contact.instagramHandle}</span>
              </p>
            </div>
          </div>

          {/* Column 2: CUSTOMER SERVICE */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF62]">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button type="button" onClick={() => onOpenInfo('contact')} className="hover:text-[#D4AF62] transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('faq')} className="hover:text-[#D4AF62] transition-colors">
                  FAQ
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('track')} className="hover:text-[#D4AF62] transition-colors">
                  Track Order
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('shipping')} className="hover:text-[#D4AF62] transition-colors">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('returns')} className="hover:text-[#D4AF62] transition-colors">
                  Returns Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: QUICK LINKS */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF62]">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button type="button" onClick={onNavigateHome} className="hover:text-[#D4AF62] transition-colors">
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateShop({ flag: 'new', title: t.nav.newArrivals })} className="hover:text-[#D4AF62] transition-colors">
                  {t.nav.newArrivals}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateShop({ flag: 'bestseller', title: t.nav.bestSellers })} className="hover:text-[#D4AF62] transition-colors">
                  {t.nav.bestSellers}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateShop({ flag: 'offers', title: t.nav.offers })} className="hover:text-[#D4AF62] transition-colors">
                  {t.nav.offers}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: CATEGORIES */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF62]">
              Categories
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button type="button" onClick={() => onNavigateShop({ category: 'Jewellery', title: t.nav.jewellery })} className="hover:text-[#D4AF62] transition-colors">
                  {t.nav.jewellery}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateShop({ category: 'Sarees', title: t.nav.sarees })} className="hover:text-[#D4AF62] transition-colors">
                  {t.nav.sarees}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateShop({ category: 'Dresses', title: t.nav.dresses })} className="hover:text-[#D4AF62] transition-colors">
                  {t.nav.dresses}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateShop({ category: 'All', title: t.nav.collections })} className="hover:text-[#D4AF62] transition-colors">
                  {t.nav.collections}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: LEGAL */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF62]">
              Legal
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button type="button" onClick={() => onOpenInfo('privacy')} className="hover:text-[#D4AF62] transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('terms')} className="hover:text-[#D4AF62] transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('refund')} className="hover:text-[#D4AF62] transition-colors">
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="mt-12 pt-6 border-t border-[#D4AF62]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#C9BCA8]/75">
          <p>© {new Date().getFullYear()} {config.brandName}. All rights reserved.</p>
          <p>{config.contact.hours}</p>
        </div>
      </div>
    </footer>
  );
};
