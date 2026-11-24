export type Language = 'en' | 'te';

export type MainCategory = 'Jewellery' | 'Sarees' | 'Dresses';

export type MetalType = '22K Gold' | '24K Gold' | '925 Silver' | 'Brass/Kundan' | 'None';

export interface ProductVariant {
  id: string;
  label: string;
  labelTe?: string;
  color: string;
  colorHex: string;
  sizeOrLength: string;
  weightGrams?: number;
  priceOverride?: number;
  stock: number;
}

export interface ProductSpecification {
  label: string;
  labelTe?: string;
  value: string;
  valueTe?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface ProductFlags {
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isWeddingFestive: boolean;
  isSpecialOffer: boolean;
  isReadyToWear: boolean;
}

export interface Product {
  _id: string;
  slug: string;
  sku: string;
  name: string;
  nameTe: string;
  category: MainCategory;
  subcategory: string;
  description: string;
  descriptionTe: string;
  images: string[];
  price: number;
  originalPrice: number;
  discountPercent: number;
  isWeightPriced: boolean;
  metalType: MetalType;
  makingChargePercent: number;
  gstPercent: number;
  variants: ProductVariant[];
  material: string;
  colors: string[];
  occasion: string[];
  specifications: ProductSpecification[];
  flags: ProductFlags;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  createdAt: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  badgeTe: string;
  title: string;
  titleTe: string;
  subtitle: string;
  subtitleTe: string;
  imageUrl: string;
  primaryCtaText: string;
  primaryCtaTextTe: string;
  primaryCategory: string;
  secondaryCtaText: string;
  secondaryCtaTextTe: string;
  secondaryCategory: string;
}

export interface PromoSection {
  id: string;
  title: string;
  titleTe: string;
  subtitle: string;
  subtitleTe: string;
  discountTag: string;
  imageUrl: string;
  targetCategory: string;
  active: boolean;
}

export interface NavCategoryGroup {
  id: string;
  category: MainCategory;
  title: string;
  titleTe: string;
  subcategories: string[];
  featuredImage: string;
  active: boolean;
}

export interface StoreContact {
  phone: string;
  email: string;
  address: string;
  addressTe: string;
  hours: string;
  instagramHandle: string;
}

export interface StoreConfig {
  brandName: string;
  tagline: string;
  secondarySlogan: string;
  brandMessage: string;
  logoUrl: string;
  announcementText: string;
  announcementTextTe: string;
  goldRate22kPerGram: number;
  goldRate24kPerGram: number;
  silverRatePerGram: number;
  heroSlides: HeroSlide[];
  promoSections: PromoSection[];
  navCategories: NavCategoryGroup[];
  featuredCollectionIds: {
    featuredJewellery: string[];
    premiumSarees: string[];
    designerDresses: string[];
    newArrivals: string[];
    bestSellers: string[];
    weddingFestive: string[];
    readyToWear: string[];
  };
  contact: StoreContact;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  nameTe: string;
  image: string;
  category: MainCategory;
  subcategory: string;
  variantLabel: string;
  unitPrice: number;
  originalUnitPrice: number;
  weightGrams?: number;
  quantity: number;
  maxStock: number;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'Confirmed'
  | 'Handcrafting & Quality Check'
  | 'Dispatched'
  | 'Out for Delivery'
  | 'Delivered';

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'UPI' | 'Card' | 'COD';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  token: string;
}

export interface WeightPriceBreakdown {
  metalValue: number;
  makingCharge: number;
  gstAmount: number;
  totalPrice: number;
  originalTotalPrice: number;
  ratePerGram: number;
  weightGrams: number;
}

export function calculateVariantPricing(
  product: Product,
  variant: ProductVariant | undefined,
  config: Pick<StoreConfig, 'goldRate22kPerGram' | 'goldRate24kPerGram' | 'silverRatePerGram'>
): {
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  breakdown: WeightPriceBreakdown | null;
} {
  if (product.isWeightPriced && variant?.weightGrams && product.metalType !== 'None' && product.metalType !== 'Brass/Kundan') {
    const ratePerGram =
      product.metalType === '22K Gold'
        ? config.goldRate22kPerGram
        : product.metalType === '24K Gold'
          ? config.goldRate24kPerGram
          : config.silverRatePerGram;

    const metalValue = Math.round(variant.weightGrams * ratePerGram);
    const makingCharge = Math.round(metalValue * (product.makingChargePercent / 100));
    const sub = metalValue + makingCharge;
    const gstAmount = Math.round(sub * (product.gstPercent / 100));
    const totalPrice = sub + gstAmount;
    const originalTotalPrice =
      product.discountPercent > 0
        ? Math.round(totalPrice / (1 - product.discountPercent / 100))
        : Math.round(totalPrice * 1.08);

    return {
      currentPrice: totalPrice,
      originalPrice: originalTotalPrice,
      discountPercent: Math.max(0, Math.round(((originalTotalPrice - totalPrice) / originalTotalPrice) * 100)),
      breakdown: {
        metalValue,
        makingCharge,
        gstAmount,
        totalPrice,
        originalTotalPrice,
        ratePerGram,
        weightGrams: variant.weightGrams,
      },
    };
  }

  const currentPrice = variant?.priceOverride ?? product.price;
  const originalPrice =
    variant?.priceOverride && product.discountPercent > 0
      ? Math.round(variant.priceOverride / (1 - product.discountPercent / 100))
      : Math.max(currentPrice, product.originalPrice);

  const discountPercent =
    originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return {
    currentPrice,
    originalPrice,
    discountPercent,
    breakdown: null,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
