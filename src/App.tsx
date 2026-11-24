import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { AccountModal, InfoModal } from './components/AccountAndInfoModals';
import {
  CartDrawer,
  CheckoutModal,
  WishlistDrawer,
} from './components/CartAndCheckoutDrawers';
import { CategoryShowcase } from './components/CategoryShowcase';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import {
  NewsletterSection,
  ServiceBenefitsSection,
  ShopByPriceSection,
  SocialGallerySection,
  SpecialOffersSection,
  TestimonialsSection,
  WeddingFestiveSection,
} from './components/HomepageEditorialSections';
import { ProductCarousel } from './components/ProductCarousel';
import { ProductDetailView } from './components/ProductDetailView';
import { QuickViewModal } from './components/QuickViewModal';
import { ShopCatalogView, type ShopFilterState } from './components/ShopCatalogView';
import { TRANSLATIONS } from './i18n/translations';
import { INITIAL_STORE_CONFIG } from './server/seedData';
import type {
  CartItem,
  Language,
  Order,
  Product,
  StoreConfig,
  UserSession,
} from './shared/types';
import { calculateVariantPricing } from './shared/types';

type ActiveView = 'home' | 'shop' | 'product' | 'admin';

const DEFAULT_FILTERS: ShopFilterState = {
  q: '',
  category: 'All',
  subcategory: 'All',
  minPrice: 0,
  maxPrice: 999999,
  color: 'All',
  material: 'All',
  minDiscount: 0,
  inStockOnly: false,
  flag: '',
  sort: 'featured',
  title: 'All Collections',
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('sda_lang');
    return saved === 'te' ? 'te' : 'en';
  });

  const [config, setConfig] = useState<StoreConfig>(INITIAL_STORE_CONFIG);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [view, setView] = useState<ActiveView>('home');
  const [shopFilters, setShopFilters] = useState<ShopFilterState>(DEFAULT_FILTERS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sda_cart');
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sda_wishlist');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('sda_user');
      return saved ? (JSON.parse(saved) as UserSession) : null;
    } catch {
      return null;
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [infoPage, setInfoPage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const loadStoreData = useCallback(async () => {
    try {
      const [cfgRes, prodRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/products?limit=100'),
      ]);
      if (!cfgRes.ok || !prodRes.ok) {
        throw new Error('Failed to load storefront data.');
      }
      const cfgData = (await cfgRes.json()) as StoreConfig;
      const prodData = (await prodRes.json()) as { products: Product[] };
      setConfig(cfgData);
      setProducts(prodData.products || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  useEffect(() => {
    localStorage.setItem('sda_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sda_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sda_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sda_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sda_user');
    }
  }, [user]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setView('home');
    scrollToTop();
  };

  const handleNavigateShop = (opts: {
    category?: string;
    subcategory?: string;
    flag?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
    title?: string;
  }) => {
    setShopFilters({
      ...DEFAULT_FILTERS,
      category: opts.category || 'All',
      subcategory: opts.subcategory || 'All',
      flag: opts.flag || '',
      minPrice: opts.minPrice ?? 0,
      maxPrice: opts.maxPrice ?? 999999,
      q: opts.q ?? '',
      title: opts.title || opts.subcategory || opts.category || 'Collections',
    });
    setView('shop');
    scrollToTop();
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setView('product');
    scrollToTop();
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      showToast(exists ? 'Removed from Wishlist' : 'Saved to Wishlist');
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const handleAddToCart = (
    product: Product,
    variantId?: string,
    qty = 1
  ) => {
    const variant =
      product.variants.find((v) => v.id === variantId) ||
      product.variants.find((v) => v.stock > 0) ||
      product.variants[0];

    if (!variant || variant.stock <= 0) {
      showToast('This variant is currently out of stock.');
      return;
    }

    const pricing = calculateVariantPricing(product, variant, config);

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === product._id && i.variantId === variant.id
      );
      if (existingIdx > -1) {
        const next = [...prev];
        const nextQty = Math.min(variant.stock, next[existingIdx].quantity + qty);
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: nextQty,
          unitPrice: pricing.currentPrice,
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product._id,
          variantId: variant.id,
          name: product.name,
          nameTe: product.nameTe,
          image: product.images[0],
          category: product.category,
          subcategory: product.subcategory,
          variantLabel: variant.label,
          unitPrice: pricing.currentPrice,
          originalUnitPrice: pricing.originalPrice,
          weightGrams: variant.weightGrams,
          quantity: Math.min(variant.stock, qty),
          maxStock: variant.stock,
        },
      ];
    });

    showToast(`Added "${product.name}" to your bag.`);
    setCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, variantId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) =>
        prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
      );
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity: Math.min(i.maxStock, qty) }
          : i
      )
    );
  };

  const handleRemoveCartItem = (productId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const handleOrderSuccess = (_order: Order) => {
    setCart([]);
    loadStoreData();
  };

  const t = TRANSLATIONS[lang];

  // Derived Homepage Section Collections (Sections 5, 6, 7, 8, 9, 11, 12, 13)
  const pickCollection = (
    ids: string[],
    fallbackFilter: (p: Product) => boolean
  ): Product[] => {
    const byId = ids
      .map((id) => products.find((p) => p._id === id))
      .filter((p): p is Product => Boolean(p));
    const extras = products.filter(
      (p) => fallbackFilter(p) && !byId.some((b) => b._id === p._id)
    );
    return [...byId, ...extras];
  };

  const featuredJewellery = useMemo(
    () =>
      pickCollection(
        config.featuredCollectionIds.featuredJewellery,
        (p) => p.category === 'Jewellery'
      ),
    [products, config.featuredCollectionIds.featuredJewellery]
  );

  const premiumSarees = useMemo(
    () =>
      pickCollection(
        config.featuredCollectionIds.premiumSarees,
        (p) => p.category === 'Sarees'
      ),
    [products, config.featuredCollectionIds.premiumSarees]
  );

  const designerDresses = useMemo(
    () =>
      pickCollection(
        config.featuredCollectionIds.designerDresses,
        (p) => p.category === 'Dresses'
      ),
    [products, config.featuredCollectionIds.designerDresses]
  );

  const newArrivals = useMemo(
    () =>
      pickCollection(
        config.featuredCollectionIds.newArrivals,
        (p) => p.flags.isNewArrival
      ),
    [products, config.featuredCollectionIds.newArrivals]
  );

  const bestSellers = useMemo(
    () =>
      pickCollection(
        config.featuredCollectionIds.bestSellers,
        (p) => p.flags.isBestSeller
      ),
    [products, config.featuredCollectionIds.bestSellers]
  );

  const weddingFestive = useMemo(
    () =>
      pickCollection(
        config.featuredCollectionIds.weddingFestive,
        (p) => p.flags.isWeddingFestive
      ),
    [products, config.featuredCollectionIds.weddingFestive]
  );

  const specialOffers = useMemo(
    () => products.filter((p) => p.flags.isSpecialOffer || p.discountPercent >= 15),
    [products]
  );

  const readyToWear = useMemo(
    () =>
      pickCollection(
        config.featuredCollectionIds.readyToWear,
        (p) => p.flags.isReadyToWear || p.subcategory === 'Ready-to-Wear'
      ),
    [products, config.featuredCollectionIds.readyToWear]
  );

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p._id)),
    [products, wishlistIds]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#120D0B] text-[#F8F1E4]">
      {/* 1. Announcement Bar + 2. Luxury Header & Navigation */}
      <Header
        config={config}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'te' : 'en'))}
        products={products}
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        user={user}
        searchQuery={shopFilters.q}
        onSearchSubmit={(q) =>
          handleNavigateShop({
            q,
            title: q ? `Search: "${q}"` : 'All Collections',
          })
        }
        onNavigateHome={handleNavigateHome}
        onNavigateShop={handleNavigateShop}
        onSelectProduct={handleSelectProduct}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenAdmin={() => {
          setView('admin');
          scrollToTop();
        }}
        onOpenInfo={(p) => setInfoPage(p)}
      />

      {/* Loading / Error State */}
      {loading ? (
        <main className="flex-1 flex items-center justify-center py-32">
          <div className="text-center space-y-3">
            <div className="h-10 w-10 border-2 border-[#D4AF62] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif text-xl text-[#D4AF62]">
              Curating SDA Collections...
            </p>
          </div>
        </main>
      ) : error ? (
        <main className="flex-1 flex items-center justify-center py-28 px-4">
          <div className="max-w-md p-8 rounded-xl bg-[#1A120F] border border-rose-500/30 text-center space-y-4">
            <p className="font-serif text-2xl text-[#F8F1E4]">Unable to load boutique</p>
            <p className="text-xs text-[#C9BCA8]">{error}</p>
            <button
              type="button"
              onClick={loadStoreData}
              className="px-6 py-2.5 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider"
            >
              Retry
            </button>
          </div>
        </main>
      ) : view === 'admin' ? (
        <main className="flex-1">
          <AdminDashboard
            config={config}
            products={products}
            onConfigSaved={(next) => setConfig(next)}
            onProductsChanged={loadStoreData}
            onBackHome={handleNavigateHome}
            onToast={showToast}
          />
        </main>
      ) : view === 'shop' ? (
        <main className="flex-1">
          <ShopCatalogView
            products={products}
            config={config}
            lang={lang}
            filters={shopFilters}
            onChangeFilters={setShopFilters}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onBackHome={handleNavigateHome}
          />
        </main>
      ) : view === 'product' && selectedProduct ? (
        <main className="flex-1">
          <ProductDetailView
            product={
              products.find((p) => p._id === selectedProduct._id) || selectedProduct
            }
            allProducts={products}
            config={config}
            lang={lang}
            isWishlisted={wishlistIds.includes(selectedProduct._id)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={handleSelectProduct}
            onQuickView={(p) => setQuickViewProduct(p)}
            onProductUpdated={(updated) => {
              setProducts((prev) =>
                prev.map((p) => (p._id === updated._id ? updated : p))
              );
              setSelectedProduct(updated);
              showToast('Thank you! Your review has been published.');
            }}
            onBack={() => setView('shop')}
          />
        </main>
      ) : (
        /* HOMEPAGE — All 18 Sections in Exact Specified Order */
        <main className="flex-1">
          {/* 3. Main Hero Slider */}
          <HeroSlider
            config={config}
            lang={lang}
            onNavigateShop={(opts) => handleNavigateShop(opts)}
          />

          {/* 4. Shop by Category (All 20 Jewellery, Sarees & Dresses Subcategories) */}
          <CategoryShowcase
            lang={lang}
            onNavigateShop={(opts) => handleNavigateShop(opts)}
          />

          {/* 5. Featured Jewellery */}
          <ProductCarousel
            id="featured-jewellery"
            title={t.sections.featuredJewellery}
            subtitle={t.sections.featuredJewellerySub}
            products={featuredJewellery}
            config={config}
            lang={lang}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onViewAll={() =>
              handleNavigateShop({ category: 'Jewellery', title: t.nav.jewellery })
            }
          />

          {/* 6. Premium Saree Collection */}
          <ProductCarousel
            id="premium-sarees"
            title={t.sections.premiumSarees}
            subtitle={t.sections.premiumSareesSub}
            products={premiumSarees}
            config={config}
            lang={lang}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onViewAll={() =>
              handleNavigateShop({ category: 'Sarees', title: t.nav.sarees })
            }
            accentTone="charcoal"
          />

          {/* 7. Designer Dresses */}
          <ProductCarousel
            id="designer-dresses"
            title={t.sections.designerDresses}
            subtitle={t.sections.designerDressesSub}
            products={designerDresses}
            config={config}
            lang={lang}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onViewAll={() =>
              handleNavigateShop({ category: 'Dresses', title: t.nav.dresses })
            }
          />

          {/* 8. New Arrivals */}
          <ProductCarousel
            id="new-arrivals"
            title={t.sections.newArrivals}
            subtitle={t.sections.newArrivalsSub}
            products={newArrivals}
            config={config}
            lang={lang}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onViewAll={() =>
              handleNavigateShop({ flag: 'new', title: t.nav.newArrivals })
            }
            accentTone="charcoal"
          />

          {/* 9. Best Sellers */}
          <ProductCarousel
            id="best-sellers"
            title={t.sections.bestSellers}
            subtitle={t.sections.bestSellersSub}
            products={bestSellers}
            config={config}
            lang={lang}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onViewAll={() =>
              handleNavigateShop({ flag: 'bestseller', title: t.nav.bestSellers })
            }
          />

          {/* 10. Shop by Price */}
          <ShopByPriceSection
            lang={lang}
            onSelectPriceRange={(minPrice, maxPrice, label) =>
              handleNavigateShop({ minPrice, maxPrice, title: label })
            }
          />

          {/* 11. Wedding and Festive Collection */}
          <WeddingFestiveSection
            products={weddingFestive}
            config={config}
            lang={lang}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onNavigateShop={(opts) => handleNavigateShop(opts)}
          />

          {/* 12. Special Offers */}
          <SpecialOffersSection
            config={config}
            offerProducts={specialOffers}
            lang={lang}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onNavigateShop={(opts) => handleNavigateShop(opts)}
          />

          {/* 13. Ready-to-Wear Collection */}
          <ProductCarousel
            id="ready-to-wear"
            title={t.sections.readyToWear}
            subtitle={t.sections.readyToWearSub}
            products={readyToWear}
            config={config}
            lang={lang}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
            onViewAll={() =>
              handleNavigateShop({ flag: 'ready', title: t.sections.readyToWear })
            }
            accentTone="charcoal"
          />

          {/* 14. Customer Testimonials */}
          <TestimonialsSection lang={lang} />

          {/* 15. Service Benefits */}
          <ServiceBenefitsSection lang={lang} />

          {/* 16. Instagram / Social Gallery */}
          <SocialGallerySection
            lang={lang}
            handle={config.contact.instagramHandle}
            onNavigateShop={(opts) => handleNavigateShop(opts)}
          />

          {/* 17. Newsletter */}
          <NewsletterSection lang={lang} />
        </main>
      )}

      {/* 18. Footer */}
      <Footer
        config={config}
        lang={lang}
        onNavigateHome={handleNavigateHome}
        onNavigateShop={(opts) => handleNavigateShop(opts)}
        onOpenInfo={(p) => setInfoPage(p)}
      />

      {/* Interactive Modals & Drawers */}
      <QuickViewModal
        product={quickViewProduct}
        config={config}
        lang={lang}
        isWishlisted={
          quickViewProduct ? wishlistIds.includes(quickViewProduct._id) : false
        }
        onClose={() => setQuickViewProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p, vId) => handleAddToCart(p, vId, 1)}
        onViewDetails={handleSelectProduct}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        lang={lang}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <WishlistDrawer
        open={wishlistOpen}
        products={wishlistProducts}
        config={config}
        lang={lang}
        onClose={() => setWishlistOpen(false)}
        onRemoveWishlist={handleToggleWishlist}
        onMoveToCart={(p) => handleAddToCart(p, undefined, 1)}
        onSelectProduct={handleSelectProduct}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <AccountModal
        open={accountOpen}
        user={user}
        onClose={() => setAccountOpen(false)}
        onLogin={(session) => {
          setUser(session);
          showToast(`Welcome, ${session.name}`);
          if (session.role === 'admin') {
            setView('admin');
            scrollToTop();
          }
        }}
        onLogout={() => {
          setUser(null);
          if (view === 'admin') setView('home');
          showToast('Signed out.');
        }}
        onOpenAdmin={() => {
          setView('admin');
          scrollToTop();
        }}
        onOpenTrackOrder={() => setInfoPage('track')}
      />

      <InfoModal
        page={infoPage}
        config={config}
        onClose={() => setInfoPage(null)}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-[#211713] border border-[#D4AF62]/50 shadow-2xl text-xs text-[#F8F1E4] inline-flex items-center gap-2.5"
        >
          <CheckCircle2 className="h-4 w-4 text-[#D4AF62] shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
