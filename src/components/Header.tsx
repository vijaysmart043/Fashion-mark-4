import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  Globe,
  Heart,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { TRANSLATIONS, tSubcategory } from '../i18n/translations';
import type { Language, MainCategory, Product, StoreConfig, UserSession } from '../shared/types';
import { formatINR } from '../shared/types';
import { SafeImage, SdaLogo } from './SdaLogo';

interface HeaderProps {
  config: StoreConfig;
  lang: Language;
  onToggleLang: () => void;
  products: Product[];
  cartCount: number;
  wishlistCount: number;
  user: UserSession | null;
  searchQuery: string;
  onSearchSubmit: (q: string) => void;
  onNavigateHome: () => void;
  onNavigateShop: (opts: {
    category?: string;
    subcategory?: string;
    flag?: string;
    title?: string;
  }) => void;
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenInfo: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  lang,
  onToggleLang,
  products,
  cartCount,
  wishlistCount,
  user,
  searchQuery,
  onSearchSubmit,
  onNavigateHome,
  onNavigateShop,
  onSelectProduct,
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
  onOpenAdmin,
  onOpenInfo,
}) => {
  const t = TRANSLATIONS[lang];
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeMega, setActiveMega] = useState<MainCategory | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>('Jewellery');

  const searchSuggestions = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameTe.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [localSearch, products]);

  const handleSearchForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    onSearchSubmit(localSearch);
  };

  const activeMegaGroup = config.navCategories.find((g) => g.category === activeMega);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full bg-[#120D0B] border-b border-[#D4AF62]/20"
        onMouseLeave={() => setActiveMega(null)}
      >
      {/* 1. Announcement Bar */}
      {announcementVisible && (
        <div className="bg-[#65102F] text-[#F8F1E4] border-b border-[#D4AF62]/25 px-4 py-1.5 text-[11px] sm:text-xs tracking-[0.18em] flex items-center justify-center relative">
          <p className="text-center font-medium truncate pr-6">
            {lang === 'te' ? config.announcementTextTe : config.announcementText}
          </p>
          <button
            type="button"
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-3 p-1 text-[#F8F1E4]/75 hover:text-[#D4AF62] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Header Row */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 text-[#F8F1E4] hover:text-[#D4AF62] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMega(null);
              onNavigateHome();
            }}
            className="text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF62] rounded"
          >
            <SdaLogo
              logoUrl={config.logoUrl}
              brandName={config.brandName}
              tagline={config.tagline}
              compact
            />
          </button>
        </div>

        {/* Center: Search Bar (Desktop & Tablet) */}
        <div className="hidden md:block flex-1 max-w-md lg:max-w-lg relative">
          <form onSubmit={handleSearchForm} className="relative flex items-center">
            <Search className="h-4 w-4 text-[#D4AF62] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t.header.searchPlaceholder}
              aria-label="Search products"
              className="w-full bg-[#211713] text-[#F8F1E4] placeholder-[#C9BCA8]/60 text-xs sm:text-sm pl-10 pr-20 py-2 rounded-full border border-[#D4AF62]/25 focus:border-[#D4AF62] focus:outline-none transition-colors"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchSubmit('');
                }}
                aria-label="Clear search"
                className="absolute right-14 text-[#C9BCA8] hover:text-[#F8F1E4] p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 rounded-full bg-[#D4AF62] text-[#120D0B] text-xs font-medium hover:bg-[#E6C67D] transition-colors whitespace-nowrap"
            >
              Go
            </button>
          </form>

          {/* Instant Search Suggestions */}
          {searchFocused && searchSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#1B1310] border border-[#D4AF62]/30 rounded-xl shadow-2xl overflow-hidden z-[60]">
              {searchSuggestions.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onMouseDown={() => {
                    setSearchFocused(false);
                    onSelectProduct(item);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2A1D18] text-left transition-colors border-b border-[#D4AF62]/10 last:border-b-0"
                >
                  <SafeImage
                    src={item.images[0]}
                    alt={item.name}
                    className="h-10 w-10 rounded object-cover shrink-0 border border-[#D4AF62]/20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#F8F1E4] truncate">
                      {lang === 'te' ? item.nameTe : item.name}
                    </p>
                    <p className="text-[11px] text-[#C9BCA8]">
                      {tSubcategory(item.subcategory, lang)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#D4AF62] tabular-nums shrink-0">
                    {formatINR(item.price)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Language, Admin/Account, Wishlist, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleLang}
            title="Switch English / Telugu"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md border border-[#D4AF62]/25 text-xs text-[#F8F1E4] hover:border-[#D4AF62] hover:text-[#D4AF62] transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <Globe className="h-3.5 w-3.5 text-[#D4AF62]" />
            <span className="sm:hidden">{lang === 'en' ? 'తె' : 'EN'}</span>
            <span className="hidden sm:inline">{lang === 'en' ? 'EN / తెలుగు' : 'తెలుగు / EN'}</span>
          </button>

          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#65102F] border border-[#D4AF62]/40 text-xs text-[#F8F1E4] hover:bg-[#7A153A] transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
            >
              <Settings className="h-3.5 w-3.5 text-[#D4AF62]" />
              <span>{t.header.adminStudio}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAccount}
            aria-label={t.header.account}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-[#F8F1E4] hover:text-[#D4AF62] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <User className="h-4 w-4 text-[#D4AF62]" />
            <span className="hidden xl:inline">
              {user ? user.name.split(' ')[0] : t.header.account}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenWishlist}
            aria-label={t.header.wishlist}
            className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-[#F8F1E4] hover:text-[#D4AF62] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Heart className="h-4 w-4 text-[#D4AF62]" />
            <span className="hidden xl:inline">{t.header.wishlist}</span>
            {wishlistCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#D41472] text-white tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={t.header.cart}
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#D4AF62] text-[#120D0B] text-xs font-semibold hover:bg-[#E5C478] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{t.header.cart}</span>
            <span className="px-1.5 py-0.2 rounded bg-[#120D0B] text-[#D4AF62] text-[11px] font-bold tabular-nums">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Desktop Category Navigation Bar with Mega-Menus */}
      <nav
        aria-label="Primary categories"
        className="hidden lg:block border-t border-[#D4AF62]/15 bg-[#17100D]"
      >
        <div className="max-w-[1440px] mx-auto px-6 xl:px-10 h-11 flex items-center justify-center gap-4 xl:gap-7 text-[11px] xl:text-xs tracking-[0.12em] xl:tracking-[0.14em] uppercase">
          <button
            type="button"
            onClick={() => {
              setActiveMega(null);
              onNavigateHome();
            }}
            className="text-[#F8F1E4] hover:text-[#D4AF62] transition-colors whitespace-nowrap shrink-0 py-2"
          >
            {t.nav.home}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMega(null);
              onNavigateShop({ flag: 'new', title: t.nav.newArrivals });
            }}
            className="text-[#F8F1E4] hover:text-[#D4AF62] transition-colors whitespace-nowrap shrink-0 py-2"
          >
            {t.nav.newArrivals}
          </button>

          {config.navCategories
            .filter((g) => g.active)
            .map((group) => (
              <div
                key={group.id}
                onMouseEnter={() => setActiveMega(group.category)}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveMega(null);
                    onNavigateShop({
                      category: group.category,
                      title: lang === 'te' ? group.titleTe : group.title,
                    });
                  }}
                  className={`inline-flex items-center gap-1 py-2 transition-colors whitespace-nowrap shrink-0 ${
                    activeMega === group.category
                      ? 'text-[#D4AF62]'
                      : 'text-[#F8F1E4] hover:text-[#D4AF62]'
                  }`}
                >
                  <span>{lang === 'te' ? group.titleTe : group.title}</span>
                  <ChevronDown className="h-3 w-3 opacity-75" />
                </button>
              </div>
            ))}

          <button
            type="button"
            onClick={() => {
              setActiveMega(null);
              onNavigateShop({ category: 'All', title: t.nav.collections });
            }}
            className="text-[#F8F1E4] hover:text-[#D4AF62] transition-colors whitespace-nowrap shrink-0 py-2"
          >
            {t.nav.collections}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMega(null);
              onNavigateShop({ flag: 'bestseller', title: t.nav.bestSellers });
            }}
            className="text-[#F8F1E4] hover:text-[#D4AF62] transition-colors whitespace-nowrap shrink-0 py-2"
          >
            {t.nav.bestSellers}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMega(null);
              onNavigateShop({ flag: 'offers', title: t.nav.offers });
            }}
            className="text-[#D41472] hover:text-[#F8F1E4] font-semibold transition-colors whitespace-nowrap shrink-0 py-2"
          >
            {t.nav.offers}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMega(null);
              onOpenInfo('contact');
            }}
            className="text-[#F8F1E4] hover:text-[#D4AF62] transition-colors whitespace-nowrap shrink-0 py-2"
          >
            {t.nav.contact}
          </button>
        </div>
      </nav>

      {/* Mega-Menu Dropdown Panel */}
      {activeMega && activeMegaGroup && (
        <div
          onMouseEnter={() => setActiveMega(activeMega)}
          onMouseLeave={() => setActiveMega(null)}
          className="hidden lg:block absolute left-0 right-0 top-full bg-[#19120F] border-b border-[#D4AF62]/30 shadow-2xl z-[60]"
        >
          <div className="max-w-[1200px] mx-auto px-10 py-7 grid grid-cols-12 gap-8 items-center">
            <div className="col-span-7">
              <div className="flex items-center justify-between border-b border-[#D4AF62]/15 pb-3 mb-4">
                <h3 className="font-serif text-2xl text-[#D4AF62]">
                  {lang === 'te' ? activeMegaGroup.titleTe : activeMegaGroup.title}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMega(null);
                    onNavigateShop({
                      category: activeMegaGroup.category,
                      title: lang === 'te' ? activeMegaGroup.titleTe : activeMegaGroup.title,
                    });
                  }}
                  className="text-xs uppercase tracking-[0.16em] text-[#F8F1E4] hover:text-[#D4AF62] underline underline-offset-4"
                >
                  {t.actions.viewAll}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                {activeMegaGroup.subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      setActiveMega(null);
                      onNavigateShop({
                        category: activeMegaGroup.category,
                        subcategory: sub,
                        title: tSubcategory(sub, lang),
                      });
                    }}
                    className="text-left text-sm text-[#C9BCA8] hover:text-[#D4AF62] py-1 transition-colors flex items-center justify-between group"
                  >
                    <span>{tSubcategory(sub, lang)}</span>
                    <span className="text-[#D4AF62] opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-5">
              <div className="relative rounded-lg overflow-hidden border border-[#D4AF62]/25 aspect-[16/10] bg-[#211713]">
                <SafeImage
                  src={activeMegaGroup.featuredImage}
                  alt={activeMegaGroup.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120D0B]/90 via-[#120D0B]/20 to-transparent flex flex-col justify-end p-5">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF62]">
                    SDA Atelier Edit
                  </span>
                  <p className="font-serif text-xl text-[#F8F1E4] mt-1">
                    {config.brandMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      </header>

      {/* Mobile Navigation Drawer (rendered outside <header> so fixed inset-0 spans full viewport above homepage) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-[86%] max-w-sm bg-[#16100D] border-r border-[#D4AF62]/25 h-full flex flex-col z-10 overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-[#D4AF62]/20 flex items-center justify-between">
              <SdaLogo logoUrl={config.logoUrl} brandName={config.brandName} compact />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 text-[#F8F1E4] hover:text-[#D4AF62]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <form
              onSubmit={(e) => {
                handleSearchForm(e);
                setMobileDrawerOpen(false);
              }}
              className="p-4 border-b border-[#D4AF62]/15"
            >
              <div className="relative">
                <Search className="h-4 w-4 text-[#D4AF62] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={t.header.searchPlaceholder}
                  className="w-full bg-[#211713] text-[#F8F1E4] text-sm pl-9 pr-3 py-2.5 rounded-lg border border-[#D4AF62]/25 focus:border-[#D4AF62] focus:outline-none"
                />
              </div>
            </form>

            {/* Mobile Links */}
            <div className="p-4 space-y-2 flex-1">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigateHome();
                }}
                className="w-full text-left py-2.5 px-2 text-sm font-medium text-[#F8F1E4] hover:text-[#D4AF62] border-b border-[#D4AF62]/10"
              >
                {t.nav.home}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigateShop({ flag: 'new', title: t.nav.newArrivals });
                }}
                className="w-full text-left py-2.5 px-2 text-sm font-medium text-[#F8F1E4] hover:text-[#D4AF62] border-b border-[#D4AF62]/10"
              >
                {t.nav.newArrivals}
              </button>

              {config.navCategories
                .filter((g) => g.active)
                .map((group) => {
                  const open = mobileExpandedCat === group.category;
                  return (
                    <div key={group.id} className="border-b border-[#D4AF62]/10 pb-1">
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpandedCat(open ? null : group.category)
                        }
                        className="w-full flex items-center justify-between py-2.5 px-2 text-sm font-medium text-[#D4AF62]"
                      >
                        <span>{lang === 'te' ? group.titleTe : group.title}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            open ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {open && (
                        <div className="pl-4 pb-2 space-y-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setMobileDrawerOpen(false);
                              onNavigateShop({
                                category: group.category,
                                title: lang === 'te' ? group.titleTe : group.title,
                              });
                            }}
                            className="block w-full text-left py-1 text-xs font-semibold text-[#F8F1E4]"
                          >
                            {t.actions.viewAll}
                          </button>
                          {group.subcategories.map((sub) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => {
                                setMobileDrawerOpen(false);
                                onNavigateShop({
                                  category: group.category,
                                  subcategory: sub,
                                  title: tSubcategory(sub, lang),
                                });
                              }}
                              className="block w-full text-left py-1 text-xs text-[#C9BCA8] hover:text-[#D4AF62]"
                            >
                              {tSubcategory(sub, lang)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigateShop({ flag: 'bestseller', title: t.nav.bestSellers });
                }}
                className="w-full text-left py-2.5 px-2 text-sm font-medium text-[#F8F1E4] border-b border-[#D4AF62]/10"
              >
                {t.nav.bestSellers}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigateShop({ flag: 'offers', title: t.nav.offers });
                }}
                className="w-full text-left py-2.5 px-2 text-sm font-semibold text-[#D41472] border-b border-[#D4AF62]/10"
              >
                {t.nav.offers}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenInfo('track');
                }}
                className="w-full text-left py-2.5 px-2 text-sm font-medium text-[#F8F1E4] border-b border-[#D4AF62]/10"
              >
                {t.header.trackOrder}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenInfo('contact');
                }}
                className="w-full text-left py-2.5 px-2 text-sm font-medium text-[#F8F1E4]"
              >
                {t.nav.contact}
              </button>
            </div>

            <div className="p-4 border-t border-[#D4AF62]/20 bg-[#120D0B] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2.5 rounded-lg border border-[#D4AF62]/40 text-xs font-medium text-[#D4AF62] hover:bg-[#D4AF62]/10"
              >
                {t.header.adminStudio}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
