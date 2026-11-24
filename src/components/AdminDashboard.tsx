import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ImagePlus,
  Layers,
  Package,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import { CATEGORY_SUBCATEGORIES } from '../i18n/translations';
import { IMG } from '../server/seedData';
import type {
  HeroSlide,
  MainCategory,
  Order,
  OrderStatus,
  Product,
  PromoSection,
  StoreConfig,
} from '../shared/types';
import { formatINR } from '../shared/types';
import { SafeImage } from './SdaLogo';

interface AdminDashboardProps {
  config: StoreConfig;
  products: Product[];
  authToken: string;
  onConfigSaved: (next: StoreConfig) => void;
  onProductsChanged: () => void;
  onBackHome: () => void;
  onUnauthorized: () => void;
  onToast: (msg: string) => void;
}

type AdminTab =
  | 'branding'
  | 'heroes'
  | 'promos'
  | 'collections'
  | 'inventory'
  | 'orders';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  config,
  products,
  authToken,
  onConfigSaved,
  onProductsChanged,
  onBackHome,
  onUnauthorized,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('branding');
  const [draft, setDraft] = useState<StoreConfig>(config);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<MainCategory>('Sarees');
  const [newProdSub, setNewProdSub] = useState(CATEGORY_SUBCATEGORIES.Sarees[0]);
  const [newProdPrice, setNewProdPrice] = useState('14500');
  const [newProdWeightPriced, setNewProdWeightPriced] = useState(false);
  const [newProdWeightGrams, setNewProdWeightGrams] = useState('22');
  const [newProdImage, setNewProdImage] = useState(IMG.kanchiCrimson);

  const authHeaders = (json = false): HeadersInit => ({
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${authToken}`,
  });

  useEffect(() => {
    setDraft(config);
  }, [config]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!cancelled && res.status === 401) {
          onUnauthorized();
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authToken, onUnauthorized]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetch('/api/orders', { headers: { Authorization: `Bearer ${authToken}` } })
        .then((r) => {
          if (r.status === 401) {
            onUnauthorized();
            return [];
          }
          return r.json();
        })
        .then((data) => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(() => {});
    }
  }, [activeTab, authToken, onUnauthorized]);

  const handleSaveConfig = async (nextDraft: StoreConfig = draft) => {
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify(nextDraft),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) throw new Error('Failed to save configuration');
      const saved = (await res.json()) as StoreConfig;
      onConfigSaved(saved);
      onToast('Storefront customization saved and published.');
    } catch {
      onToast('Error saving configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onResult: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onResult(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      badge: 'Limited Couture Release',
      badgeTe: 'ప్రత్యేక కలెక్షన్',
      title: 'Timeless Elegance Reimagined',
      titleTe: 'సరికొత్త రాజసపు శైలి',
      subtitle: 'Curated bridal jewellery and handloom weaves crafted for unforgettable celebrations.',
      subtitleTe: 'ప్రతి వేడుకకు సరిపోయే ఆభరణాలు మరియు పట్టు చీరలు.',
      imageUrl: IMG.heroBridal,
      primaryCtaText: 'Shop Now',
      primaryCtaTextTe: 'ఇప్పుడే కొనండి',
      primaryCategory: 'All',
      secondaryCtaText: 'Explore Collections',
      secondaryCtaTextTe: 'కలెక్షన్లు చూడండి',
      secondaryCategory: 'Sarees',
    };
    setDraft((prev) => ({ ...prev, heroSlides: [...prev.heroSlides, newSlide] }));
  };

  const handleAddPromo = () => {
    const promo: PromoSection = {
      id: `promo-${Date.now()}`,
      title: 'Festive Handloom & Gold Privilege',
      titleTe: 'పండుగ ప్రత్యేక ఆఫర్',
      subtitle: 'Exclusive seasonal savings across Kanchipuram silks and 22K temple sets.',
      subtitleTe: 'కంచి పట్టు చీరలు మరియు 22K బంగారు ఆభరణాలపై ప్రత్యేక తగ్గింపు.',
      discountTag: 'Special Atelier Offer',
      imageUrl: IMG.goldJewellery,
      targetCategory: 'Jewellery',
      active: true,
    };
    setDraft((prev) => ({
      ...prev,
      promoSections: [...prev.promoSections, promo],
    }));
  };

  const toggleFeaturedProduct = (
    bucket: keyof StoreConfig['featuredCollectionIds'],
    productId: string
  ) => {
    setDraft((prev) => {
      const current = prev.featuredCollectionIds[bucket] || [];
      const exists = current.includes(productId);
      const updated = exists
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      return {
        ...prev,
        featuredCollectionIds: {
          ...prev.featuredCollectionIds,
          [bucket]: updated,
        },
      };
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    const priceNum = Number(newProdPrice) || 9999;
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({
        name: newProdName.trim(),
        category: newProdCat,
        subcategory: newProdSub,
        price: priceNum,
        originalPrice: Math.round(priceNum * 1.15),
        discountPercent: 13,
        isWeightPriced: newProdWeightPriced,
        metalType: newProdWeightPriced ? '22K Gold' : 'None',
        makingChargePercent: newProdWeightPriced ? 14 : 0,
        gstPercent: newProdWeightPriced ? 3 : 5,
        images: [newProdImage],
        variants: [
          {
            id: `var-${Date.now()}`,
            label: newProdWeightPriced
              ? `Standard (${newProdWeightGrams}g)`
              : 'Standard Edition',
            color: 'Gold',
            colorHex: '#D4AF62',
            sizeOrLength: newProdCat === 'Sarees' ? '6.2 Meters' : 'Standard',
            weightGrams: newProdWeightPriced ? Number(newProdWeightGrams) : undefined,
            stock: 6,
          },
        ],
      }),
    });
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (res.ok) {
      setNewProdName('');
      onProductsChanged();
      onToast('New product added to SDA Collections catalog.');
    }
  };

  const handleUpdateVariantStock = async (
    product: Product,
    variantId: string,
    newStock: number
  ) => {
    const updatedVariants = product.variants.map((v) =>
      v.id === variantId ? { ...v, stock: Math.max(0, newStock) } : v
    );
    const res = await fetch(`/api/products/${product._id}`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify({ variants: updatedVariants }),
    });
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (res.ok) {
      onProductsChanged();
      onToast('Variant inventory updated.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify({ status }),
    });
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (res.ok) {
      const updated = (await res.json()) as Order;
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      onToast(`Order ${updated.orderNumber} updated to ${status}.`);
    }
  };

  const handleResetDefaults = async () => {
    const res = await fetch('/api/config/reset', {
      method: 'POST',
      headers: authHeaders(),
    });
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setDraft(data.config);
      onConfigSaved(data.config);
      onProductsChanged();
      onToast('Restored default SDA Collections store settings.');
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'branding', label: 'Branding & Rates', icon: Sparkles },
    { id: 'heroes', label: 'Hero Banners', icon: ImagePlus },
    { id: 'promos', label: 'Promo Sections', icon: Tag },
    { id: 'collections', label: 'Featured & Nav', icon: Layers },
    { id: 'inventory', label: 'Products & Stock', icon: Package },
    { id: 'orders', label: 'Orders', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#120D0B] py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4AF62]/25">
          <div>
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#D4AF62] hover:text-[#F8F1E4] mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Return to Storefront</span>
            </button>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F1E4]">
              SDA Admin Customization Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#C9BCA8] mt-1">
              Manage brand identity, hero banners, taglines, navigation categories, promotional blocks, bullion rates, and inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#D4AF62]/30 text-xs text-[#C9BCA8] hover:text-[#F8F1E4]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveConfig(draft)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#D4AF62] hover:bg-[#E7C77A] text-[#120D0B] text-xs font-semibold uppercase tracking-wider"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#D4AF62]/15 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#D4AF62] text-[#120D0B] font-semibold'
                    : 'bg-[#1A120F] text-[#C9BCA8] border border-[#D4AF62]/20 hover:text-[#F8F1E4]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BRANDING, TAGLINES, ANNOUNCEMENT & LIVE GOLD RATES */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 p-6 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-5">
              <h2 className="font-serif text-2xl text-[#D4AF62]">
                Brand Identity, Logo & Taglines
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C9BCA8] mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={draft.brandName}
                    onChange={(e) => setDraft({ ...draft, brandName: e.target.value })}
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F1E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C9BCA8] mb-1">Primary Tagline</label>
                  <input
                    type="text"
                    value={draft.tagline}
                    onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F1E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C9BCA8] mb-1">Secondary Slogan</label>
                  <input
                    type="text"
                    value={draft.secondarySlogan}
                    onChange={(e) => setDraft({ ...draft, secondarySlogan: e.target.value })}
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F1E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C9BCA8] mb-1">Brand Message</label>
                  <input
                    type="text"
                    value={draft.brandMessage}
                    onChange={(e) => setDraft({ ...draft, brandMessage: e.target.value })}
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-sm text-[#F8F1E4]"
                  />
                </div>
              </div>

              {/* Logo Upload / URL */}
              <div className="space-y-2 pt-2 border-t border-[#D4AF62]/15">
                <label className="block text-xs text-[#C9BCA8]">
                  Custom Logo URL or Upload Image (leave empty for Royal Crest Vector)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={draft.logoUrl}
                    onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })}
                    placeholder="https://... or upload file"
                    className="flex-1 bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4]"
                  />
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#261A15] border border-[#D4AF62]/35 text-xs text-[#D4AF62] cursor-pointer hover:bg-[#D4AF62] hover:text-[#120D0B] transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setDraft({ ...draft, logoUrl: url }))
                      }
                    />
                  </label>
                  {draft.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, logoUrl: '' })}
                      className="px-3 py-2 text-xs text-rose-400 border border-rose-500/30 rounded-lg"
                    >
                      Use Crest
                    </button>
                  )}
                </div>
              </div>

              {/* Announcement Text */}
              <div className="space-y-3 pt-2 border-t border-[#D4AF62]/15">
                <div>
                  <label className="block text-xs text-[#C9BCA8] mb-1">
                    Top Announcement Bar (English)
                  </label>
                  <input
                    type="text"
                    value={draft.announcementText}
                    onChange={(e) => setDraft({ ...draft, announcementText: e.target.value })}
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C9BCA8] mb-1">
                    Top Announcement Bar (Telugu)
                  </label>
                  <input
                    type="text"
                    value={draft.announcementTextTe}
                    onChange={(e) => setDraft({ ...draft, announcementTextTe: e.target.value })}
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Live Bullion Rates + Contact Placeholders */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-4">
                <h2 className="font-serif text-2xl text-[#D4AF62]">
                  Live Jewellery Bullion Rates (INR/g)
                </h2>
                <p className="text-xs text-[#C9BCA8]">
                  Updating these rates dynamically recalculates all weight-priced 22K gold & 925 silver jewellery across the store.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#C9BCA8] mb-1">22K Gold/g</label>
                    <input
                      type="number"
                      value={draft.goldRate22kPerGram}
                      onChange={(e) =>
                        setDraft({ ...draft, goldRate22kPerGram: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-[#211713] border border-[#D4AF62]/30 rounded-lg px-3 py-2 text-sm text-[#D4AF62] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#C9BCA8] mb-1">24K Gold/g</label>
                    <input
                      type="number"
                      value={draft.goldRate24kPerGram}
                      onChange={(e) =>
                        setDraft({ ...draft, goldRate24kPerGram: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-[#211713] border border-[#D4AF62]/30 rounded-lg px-3 py-2 text-sm text-[#D4AF62] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#C9BCA8] mb-1">925 Silver/g</label>
                    <input
                      type="number"
                      value={draft.silverRatePerGram}
                      onChange={(e) =>
                        setDraft({ ...draft, silverRatePerGram: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-[#211713] border border-[#D4AF62]/30 rounded-lg px-3 py-2 text-sm text-[#D4AF62] tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-3">
                <h2 className="font-serif text-2xl text-[#D4AF62]">
                  Editable Footer Contact Details
                </h2>
                <input
                  type="text"
                  value={draft.contact.phone}
                  onChange={(e) =>
                    setDraft({ ...draft, contact: { ...draft.contact, phone: e.target.value } })
                  }
                  placeholder="Phone"
                  className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                />
                <input
                  type="text"
                  value={draft.contact.email}
                  onChange={(e) =>
                    setDraft({ ...draft, contact: { ...draft.contact, email: e.target.value } })
                  }
                  placeholder="Email"
                  className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                />
                <input
                  type="text"
                  value={draft.contact.address}
                  onChange={(e) =>
                    setDraft({ ...draft, contact: { ...draft.contact, address: e.target.value } })
                  }
                  placeholder="Boutique Address"
                  className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                />
                <input
                  type="text"
                  value={draft.contact.instagramHandle}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      contact: { ...draft.contact, instagramHandle: e.target.value },
                    })
                  }
                  placeholder="Instagram Handle"
                  className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO BANNERS */}
        {activeTab === 'heroes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-[#D4AF62]">
                Hero Banner Slides ({draft.heroSlides.length})
              </h2>
              <button
                type="button"
                onClick={handleAddHeroSlide}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#261A15] border border-[#D4AF62]/40 text-xs text-[#D4AF62] hover:bg-[#D4AF62] hover:text-[#120D0B]"
              >
                <Plus className="h-4 w-4" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {draft.heroSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="p-5 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF62]">
                      Slide #{idx + 1}
                    </span>
                    {draft.heroSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            heroSlides: draft.heroSlides.filter((s) => s.id !== slide.id),
                          })
                        }
                        className="text-rose-400 hover:text-rose-300 text-xs inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#D4AF62]/20 bg-[#120D0B]">
                    <SafeImage
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={slide.imageUrl}
                      onChange={(e) => {
                        const updated = [...draft.heroSlides];
                        updated[idx] = { ...slide, imageUrl: e.target.value };
                        setDraft({ ...draft, heroSlides: updated });
                      }}
                      placeholder="Banner Image URL"
                      className="flex-1 bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                    />
                    <label className="px-3 py-2 rounded-lg bg-[#261A15] border border-[#D4AF62]/30 text-xs text-[#D4AF62] cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => {
                            const updated = [...draft.heroSlides];
                            updated[idx] = { ...slide, imageUrl: url };
                            setDraft({ ...draft, heroSlides: updated });
                          })
                        }
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => {
                      const updated = [...draft.heroSlides];
                      updated[idx] = { ...slide, title: e.target.value };
                      setDraft({ ...draft, heroSlides: updated });
                    }}
                    placeholder="Headline (English)"
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-sm text-[#F8F1E4]"
                  />
                  <textarea
                    rows={2}
                    value={slide.subtitle}
                    onChange={(e) => {
                      const updated = [...draft.heroSlides];
                      updated[idx] = { ...slide, subtitle: e.target.value };
                      setDraft({ ...draft, heroSlides: updated });
                    }}
                    placeholder="Supporting Subtitle"
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROMOTIONAL SECTIONS */}
        {activeTab === 'promos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-[#D4AF62]">
                Special Offers & Promotional Banners
              </h2>
              <button
                type="button"
                onClick={handleAddPromo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#261A15] border border-[#D4AF62]/40 text-xs text-[#D4AF62]"
              >
                <Plus className="h-4 w-4" />
                <span>Create Promotional Section</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {draft.promoSections.map((promo, idx) => (
                <div
                  key={promo.id}
                  className="p-5 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-xs text-[#F8F1E4]">
                      <input
                        type="checkbox"
                        checked={promo.active}
                        onChange={(e) => {
                          const next = [...draft.promoSections];
                          next[idx] = { ...promo, active: e.target.checked };
                          setDraft({ ...draft, promoSections: next });
                        }}
                        className="accent-[#D4AF62]"
                      />
                      <span>Active on Homepage</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          promoSections: draft.promoSections.filter((p) => p.id !== promo.id),
                        })
                      }
                      className="text-xs text-rose-400"
                    >
                      Delete
                    </button>
                  </div>
                  <input
                    type="text"
                    value={promo.discountTag}
                    onChange={(e) => {
                      const next = [...draft.promoSections];
                      next[idx] = { ...promo, discountTag: e.target.value };
                      setDraft({ ...draft, promoSections: next });
                    }}
                    placeholder="Offer Highlight"
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#D41472]"
                  />
                  <input
                    type="text"
                    value={promo.title}
                    onChange={(e) => {
                      const next = [...draft.promoSections];
                      next[idx] = { ...promo, title: e.target.value };
                      setDraft({ ...draft, promoSections: next });
                    }}
                    placeholder="Promo Title"
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-sm text-[#F8F1E4]"
                  />
                  <input
                    type="text"
                    value={promo.subtitle}
                    onChange={(e) => {
                      const next = [...draft.promoSections];
                      next[idx] = { ...promo, subtitle: e.target.value };
                      setDraft({ ...draft, promoSections: next });
                    }}
                    placeholder="Promo Subtitle"
                    className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promo.imageUrl}
                      onChange={(e) => {
                        const next = [...draft.promoSections];
                        next[idx] = { ...promo, imageUrl: e.target.value };
                        setDraft({ ...draft, promoSections: next });
                      }}
                      placeholder="Banner Image URL"
                      className="flex-1 bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                    />
                    <select
                      value={promo.targetCategory}
                      onChange={(e) => {
                        const next = [...draft.promoSections];
                        next[idx] = { ...promo, targetCategory: e.target.value };
                        setDraft({ ...draft, promoSections: next });
                      }}
                      className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                    >
                      <option value="Jewellery">Jewellery</option>
                      <option value="Sarees">Sarees</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Wedding & Festive">Wedding & Festive</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NAVIGATION CATEGORIES & FEATURED HOMEPAGE COLLECTIONS */}
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 p-6 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-4">
              <h2 className="font-serif text-2xl text-[#D4AF62]">
                Navigation Category Groups
              </h2>
              {draft.navCategories.map((group, idx) => (
                <div
                  key={group.id}
                  className="p-4 rounded-lg bg-[#211713] border border-[#D4AF62]/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-[#F8F1E4]">{group.title}</span>
                    <label className="inline-flex items-center gap-2 text-xs text-[#C9BCA8]">
                      <input
                        type="checkbox"
                        checked={group.active}
                        onChange={(e) => {
                          const next = [...draft.navCategories];
                          next[idx] = { ...group, active: e.target.checked };
                          setDraft({ ...draft, navCategories: next });
                        }}
                        className="accent-[#D4AF62]"
                      />
                      <span>Visible in Navbar</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-[#C9BCA8]">
                    Subcategories: {group.subcategories.join(', ')}
                  </p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-7 p-6 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-5">
              <h2 className="font-serif text-2xl text-[#D4AF62]">
                Homepage Product Collections & Featured Products
              </h2>
              <p className="text-xs text-[#C9BCA8]">
                Click products to include or exclude them from homepage carousels, then click Save & Publish.
              </p>

              {(
                [
                  ['featuredJewellery', 'Featured Jewellery'],
                  ['premiumSarees', 'Premium Saree Collection'],
                  ['designerDresses', 'Designer Dresses'],
                  ['newArrivals', 'New Arrivals'],
                  ['bestSellers', 'Best Sellers'],
                  ['weddingFestive', 'Wedding & Festive'],
                  ['readyToWear', 'Ready-to-Wear'],
                ] as [keyof StoreConfig['featuredCollectionIds'], string][]
              ).map(([bucket, label]) => {
                const selectedIds = draft.featuredCollectionIds[bucket] || [];
                return (
                  <div key={bucket} className="space-y-2 pt-2 border-t border-[#D4AF62]/15">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF62]">
                      {label} ({selectedIds.length} selected)
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {products.map((p) => {
                        const active = selectedIds.includes(p._id);
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => toggleFeaturedProduct(bucket, p._id)}
                            className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                              active
                                ? 'bg-[#D4AF62] text-[#120D0B] border-[#D4AF62] font-semibold'
                                : 'bg-[#211713] text-[#C9BCA8] border-[#D4AF62]/20'
                            }`}
                          >
                            {p.name.slice(0, 28)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: PRODUCTS & VARIANT INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-8">
            {/* Add New Product */}
            <form
              onSubmit={handleCreateProduct}
              className="p-6 rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 space-y-4"
            >
              <h2 className="font-serif text-2xl text-[#D4AF62]">Add New Catalog Piece</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Product Name *"
                  className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                />
                <select
                  value={newProdCat}
                  onChange={(e) => {
                    const cat = e.target.value as MainCategory;
                    setNewProdCat(cat);
                    setNewProdSub(CATEGORY_SUBCATEGORIES[cat][0]);
                  }}
                  className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                >
                  <option value="Jewellery">Jewellery</option>
                  <option value="Sarees">Sarees</option>
                  <option value="Dresses">Dresses</option>
                </select>
                <select
                  value={newProdSub}
                  onChange={(e) => setNewProdSub(e.target.value)}
                  className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                >
                  {CATEGORY_SUBCATEGORIES[newProdCat].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="Price (INR)"
                  className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4] tabular-nums"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs text-[#F8F1E4]">
                  <input
                    type="checkbox"
                    checked={newProdWeightPriced}
                    onChange={(e) => setNewProdWeightPriced(e.target.checked)}
                    className="accent-[#D4AF62]"
                  />
                  <span>Enable 22K Gold Weight-Pricing</span>
                </label>
                {newProdWeightPriced && (
                  <input
                    type="number"
                    value={newProdWeightGrams}
                    onChange={(e) => setNewProdWeightGrams(e.target.value)}
                    placeholder="Weight (g)"
                    className="w-28 bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-1.5 text-xs text-[#F8F1E4] tabular-nums"
                  />
                )}
                <select
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-1.5 text-xs text-[#F8F1E4]"
                >
                  <option value={IMG.kanchiCrimson}>Crimson Kanchi Saree Photo</option>
                  <option value={IMG.goldJewellery}>22K Temple Gold Photo</option>
                  <option value={IMG.kundanSet}>Kundan Polki Necklace Photo</option>
                  <option value={IMG.designerDresses}>Designer Lehenga Photo</option>
                  <option value={IMG.readyToWear}>Ready-to-Wear Photo</option>
                </select>
                <button
                  type="submit"
                  className="ml-auto px-5 py-2 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider"
                >
                  Create Product
                </button>
              </div>
            </form>

            {/* Variant Stock Table */}
            <div className="rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 overflow-hidden">
              <div className="p-4 border-b border-[#D4AF62]/15">
                <h3 className="font-serif text-xl text-[#D4AF62]">
                  Variant-Level Inventory ({products.length} Products)
                </h3>
              </div>
              <div className="divide-y divide-[#D4AF62]/10">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SafeImage
                        src={p.images[0]}
                        alt={p.name}
                        className="h-12 w-14 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#F8F1E4] truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-[#C9BCA8]">
                          {p.category} · {p.subcategory} · {formatINR(p.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {p.variants.map((v) => (
                        <div
                          key={v.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#211713] border border-[#D4AF62]/20 text-xs"
                        >
                          <span className="text-[#C9BCA8]">{v.label}:</span>
                          <input
                            type="number"
                            min={0}
                            defaultValue={v.stock}
                            onBlur={(e) =>
                              handleUpdateVariantStock(p, v.id, Number(e.target.value))
                            }
                            className="w-14 bg-[#120D0B] border border-[#D4AF62]/30 rounded px-2 py-0.5 text-center text-[#D4AF62] tabular-nums"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ORDERS */}
        {activeTab === 'orders' && (
          <div className="rounded-xl bg-[#1A120F] border border-[#D4AF62]/25 overflow-hidden">
            <div className="p-5 border-b border-[#D4AF62]/15">
              <h2 className="font-serif text-2xl text-[#D4AF62]">
                Customer Orders ({orders.length})
              </h2>
            </div>
            <div className="divide-y divide-[#D4AF62]/10">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#D4AF62] tabular-nums">
                      {order.orderNumber} · {order.customerName}
                    </p>
                    <p className="text-xs text-[#C9BCA8]">
                      {order.city}, {order.state} ({order.pincode}) · {order.paymentMethod} ·{' '}
                      <span className="text-[#F8F1E4] font-medium tabular-nums">
                        {formatINR(order.total)}
                      </span>
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleUpdateOrderStatus(order._id, e.target.value as OrderStatus)
                    }
                    className="bg-[#211713] border border-[#D4AF62]/30 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Handcrafting & Quality Check">
                      Handcrafting & Quality Check
                    </option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
