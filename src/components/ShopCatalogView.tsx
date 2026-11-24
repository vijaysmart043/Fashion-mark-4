import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { CATEGORY_SUBCATEGORIES, TRANSLATIONS, tSubcategory } from '../i18n/translations';
import type { Language, Product, StoreConfig } from '../shared/types';
import { calculateVariantPricing, formatINR } from '../shared/types';
import { ProductCard } from './ProductCard';

export interface ShopFilterState {
  q: string;
  category: string;
  subcategory: string;
  minPrice: number;
  maxPrice: number;
  color: string;
  material: string;
  minDiscount: number;
  inStockOnly: boolean;
  flag: string;
  sort: 'featured' | 'price-asc' | 'price-desc' | 'discount' | 'newest' | 'rating';
  title?: string;
}

interface ShopCatalogViewProps {
  products: Product[];
  config: StoreConfig;
  lang: Language;
  filters: ShopFilterState;
  onChangeFilters: (next: ShopFilterState) => void;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, variantId?: string) => void;
  onBackHome: () => void;
}

const COLORS = ['All', 'Gold', 'Maroon', 'Magenta', 'Ivory', 'Silver', 'Blue', 'Emerald', 'Black'];
const MATERIALS = [
  'All',
  '22K',
  'Silver',
  'Silk',
  'Katan',
  'Cotton',
  'Organza',
  'Georgette',
  'Kundan',
];

export const ShopCatalogView: React.FC<ShopCatalogViewProps> = ({
  products,
  config,
  lang,
  filters,
  onChangeFilters,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onSelectProduct,
  onAddToCart,
  onBackHome,
}) => {
  const t = TRANSLATIONS[lang];
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const pageSize = 8;

  const computedProducts = useMemo(() => {
    return products.map((p) => {
      const v = p.variants.find((vr) => vr.stock > 0) || p.variants[0];
      const pricing = calculateVariantPricing(p, v, config);
      return {
        ...p,
        price: pricing.currentPrice,
        originalPrice: pricing.originalPrice,
        discountPercent: pricing.discountPercent,
      };
    });
  }, [products, config]);

  const filteredProducts = useMemo(() => {
    let list = [...computedProducts];

    if (filters.q.trim()) {
      const term = filters.q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.nameTe.toLowerCase().includes(term) ||
          p.subcategory.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.material.toLowerCase().includes(term)
      );
    }

    if (filters.category && filters.category !== 'All') {
      if (filters.category === 'Wedding & Festive') {
        list = list.filter((p) => p.flags.isWeddingFestive);
      } else {
        list = list.filter((p) => p.category === filters.category);
      }
    }

    if (filters.subcategory && filters.subcategory !== 'All') {
      list = list.filter((p) => p.subcategory === filters.subcategory);
    }

    list = list.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    if (filters.color !== 'All') {
      list = list.filter((p) =>
        p.colors.some((c) => c.toLowerCase() === filters.color.toLowerCase())
      );
    }

    if (filters.material !== 'All') {
      list = list.filter((p) =>
        p.material.toLowerCase().includes(filters.material.toLowerCase())
      );
    }

    if (filters.minDiscount > 0) {
      list = list.filter((p) => p.discountPercent >= filters.minDiscount);
    }

    if (filters.inStockOnly) {
      list = list.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    if (filters.flag) {
      list = list.filter((p) => {
        if (filters.flag === 'new') return p.flags.isNewArrival;
        if (filters.flag === 'bestseller') return p.flags.isBestSeller;
        if (filters.flag === 'offers') return p.flags.isSpecialOffer || p.discountPercent >= 15;
        if (filters.flag === 'ready') return p.flags.isReadyToWear;
        if (filters.flag === 'wedding') return p.flags.isWeddingFestive;
        return true;
      });
    }

    switch (filters.sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        list.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'newest':
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => Number(b.flags.isFeatured) - Number(a.flags.isFeatured));
    }

    return list;
  }, [computedProducts, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const updateFilter = <K extends keyof ShopFilterState>(
    key: K,
    value: ShopFilterState[K]
  ) => {
    setPage(1);
    onChangeFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setPage(1);
    onChangeFilters({
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
      title: lang === 'te' ? 'అన్ని కలెక్షన్లు' : 'All Collections',
    });
  };

  const availableSubcategories =
    filters.category === 'Jewellery' ||
    filters.category === 'Sarees' ||
    filters.category === 'Dresses'
      ? CATEGORY_SUBCATEGORIES[filters.category]
      : [
          ...CATEGORY_SUBCATEGORIES.Jewellery,
          ...CATEGORY_SUBCATEGORIES.Sarees,
          ...CATEGORY_SUBCATEGORIES.Dresses,
        ];

  const filterSidebarContent = (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between border-b border-[#D4AF62]/20 pb-3">
        <span className="font-serif text-xl text-[#D4AF62]">{t.actions.applyFilters}</span>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-[#C9BCA8] hover:text-[#D4AF62] underline underline-offset-4"
        >
          {t.actions.clearFilters}
        </button>
      </div>

      {/* Search inside PLP */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#C9BCA8] mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-[#D4AF62] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="Keyword or craft..."
            className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg pl-8 pr-3 py-2 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#C9BCA8] mb-2">
          Category
        </label>
        <div className="space-y-1.5">
          {['All', 'Jewellery', 'Sarees', 'Dresses', 'Wedding & Festive'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setPage(1);
                onChangeFilters({
                  ...filters,
                  category: cat,
                  subcategory: 'All',
                  flag: '',
                  title: cat === 'All' ? 'All Collections' : cat,
                });
              }}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                filters.category === cat
                  ? 'bg-[#D4AF62] text-[#120D0B] font-semibold'
                  : 'text-[#C9BCA8] hover:bg-[#211713] hover:text-[#F8F1E4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#C9BCA8] mb-2">
          Subcategory
        </label>
        <select
          value={filters.subcategory}
          onChange={(e) => updateFilter('subcategory', e.target.value)}
          className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
        >
          <option value="All">All Subcategories</option>
          {availableSubcategories.map((sub) => (
            <option key={sub} value={sub}>
              {tSubcategory(sub, lang)}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#C9BCA8] mb-2">
          Price Tier (INR)
        </label>
        <div className="space-y-1.5">
          {[
            { label: 'All Prices', min: 0, max: 999999 },
            { label: 'Under ₹3,000', min: 0, max: 2999 },
            { label: '₹3,000 – ₹15,000', min: 3000, max: 15000 },
            { label: '₹15,000 – ₹40,000', min: 15000, max: 40000 },
            { label: '₹40,000 & Above', min: 40000, max: 999999 },
          ].map((range) => {
            const active = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => {
                  setPage(1);
                  onChangeFilters({
                    ...filters,
                    minPrice: range.min,
                    maxPrice: range.max,
                  });
                }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs tabular-nums transition-colors ${
                  active
                    ? 'bg-[#65102F] text-[#F8F1E4] border border-[#D4AF62]/40 font-medium'
                    : 'text-[#C9BCA8] hover:bg-[#211713]'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colour */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#C9BCA8] mb-2">
          Colour
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => updateFilter('color', col)}
              className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                filters.color === col
                  ? 'bg-[#D4AF62] text-[#120D0B] border-[#D4AF62] font-semibold'
                  : 'bg-[#211713] text-[#C9BCA8] border-[#D4AF62]/20 hover:border-[#D4AF62]/50'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#C9BCA8] mb-2">
          Material / Craft
        </label>
        <select
          value={filters.material}
          onChange={(e) => updateFilter('material', e.target.value)}
          className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
        >
          {MATERIALS.map((mat) => (
            <option key={mat} value={mat}>
              {mat === 'All' ? 'All Materials' : mat}
            </option>
          ))}
        </select>
      </div>

      {/* Discount */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#C9BCA8] mb-2">
          Minimum Discount
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 10, 15, 20].map((disc) => (
            <button
              key={disc}
              type="button"
              onClick={() => updateFilter('minDiscount', disc)}
              className={`px-2.5 py-1.5 rounded text-xs tabular-nums border transition-colors ${
                filters.minDiscount === disc
                  ? 'bg-[#D4AF62] text-[#120D0B] border-[#D4AF62] font-semibold'
                  : 'bg-[#211713] text-[#C9BCA8] border-[#D4AF62]/20'
              }`}
            >
              {disc === 0 ? 'Any' : `${disc}%+ Off`}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-[#D4AF62]/15">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
          className="accent-[#D4AF62] h-4 w-4 rounded"
        />
        <span className="text-xs text-[#F8F1E4]">In Stock Only</span>
      </label>
    </div>
  );

  return (
    <section className="min-h-screen bg-[#120D0B] py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#D4AF62]/20 mb-8">
          <div>
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#D4AF62] hover:text-[#F8F1E4] mb-2"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>{t.nav.home}</span>
            </button>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4]">
              {filters.title || (filters.category === 'All' ? t.nav.collections : filters.category)}
            </h1>
            <p className="text-xs sm:text-sm text-[#C9BCA8] mt-1 tabular-nums">
              {filteredProducts.length} curated creations
              {filters.subcategory !== 'All' ? ` · ${tSubcategory(filters.subcategory, lang)}` : ''}
              {filters.maxPrice < 999999 ? ` · Up to ${formatINR(filters.maxPrice)}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#211713] border border-[#D4AF62]/30 text-xs text-[#F8F1E4]"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#D4AF62]" />
              <span>{t.actions.applyFilters}</span>
            </button>

            <select
              aria-label="Sort products"
              value={filters.sort}
              onChange={(e) =>
                updateFilter('sort', e.target.value as ShopFilterState['sort'])
              }
              className="bg-[#211713] border border-[#D4AF62]/30 rounded-lg px-3.5 py-2 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 p-6 rounded-xl bg-[#18110E] border border-[#D4AF62]/20">
              {filterSidebarContent}
            </div>
          </aside>

          <div className="lg:col-span-9">
            {paginated.length === 0 ? (
              <div className="p-12 rounded-xl bg-[#1A120F] border border-[#D4AF62]/20 text-center space-y-4">
                <p className="font-serif text-2xl text-[#F8F1E4]">
                  No pieces matched your current selection.
                </p>
                <p className="text-sm text-[#C9BCA8]">
                  Try clearing one of your active price, colour, or material filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider"
                >
                  {t.actions.clearFilters}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginated.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      config={config}
                      lang={lang}
                      isWishlisted={wishlistIds.includes(product._id)}
                      onToggleWishlist={onToggleWishlist}
                      onQuickView={onQuickView}
                      onSelectProduct={onSelectProduct}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-9 w-9 rounded-lg border border-[#D4AF62]/30 text-[#D4AF62] flex items-center justify-center disabled:opacity-35"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const num = idx + 1;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPage(num)}
                          className={`h-9 w-9 rounded-lg text-xs font-semibold tabular-nums border transition-colors ${
                            num === currentPage
                              ? 'bg-[#D4AF62] text-[#120D0B] border-[#D4AF62]'
                              : 'border-[#D4AF62]/25 text-[#F8F1E4] hover:border-[#D4AF62]'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="h-9 w-9 rounded-lg border border-[#D4AF62]/30 text-[#D4AF62] flex items-center justify-center disabled:opacity-35"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative w-[85%] max-w-sm bg-[#16100D] border-r border-[#D4AF62]/25 h-full p-6 overflow-y-auto z-10">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-[#F8F1E4]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterSidebarContent}
          </div>
        </div>
      )}
    </section>
  );
};
