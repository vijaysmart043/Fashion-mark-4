import React, { useState } from 'react';
import {
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CartItem,
  Language,
  Order,
  Product,
  StoreConfig,
} from '../shared/types';
import { calculateVariantPricing, formatINR } from '../shared/types';
import { SafeImage } from './SdaLogo';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  lang: Language;
  onClose: () => void;
  onUpdateQty: (productId: string, variantId: string, qty: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  lang,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}) => {
  if (!open) return null;

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const freeShippingThreshold = 2999;
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 199;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative z-10 w-full max-w-md bg-[#16100D] border-l border-[#D4AF62]/30 h-full flex flex-col">
        <div className="p-5 border-b border-[#D4AF62]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#D4AF62]" />
            <h2 className="font-serif text-2xl font-semibold text-[#F8F1E4]">
              {lang === 'te' ? 'మీ షాపింగ్ బ్యాగ్' : 'Your Shopping Bag'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="p-2 text-[#C9BCA8] hover:text-[#F8F1E4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        <div className="px-5 py-2.5 bg-[#211713] border-b border-[#D4AF62]/15 text-xs text-[#C9BCA8]">
          {subtotal >= freeShippingThreshold ? (
            <span className="text-emerald-400">
              Your order qualifies for Complimentary Insured Shipping across India.
            </span>
          ) : (
            <span>
              Add {formatINR(freeShippingThreshold - subtotal)} more for complimentary shipping.
            </span>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="h-10 w-10 text-[#D4AF62]/40 mx-auto" />
              <p className="font-serif text-xl text-[#F8F1E4]">Your luxury bag is empty.</p>
              <p className="text-xs text-[#C9BCA8]">
                Explore 22K temple jewellery, Kanchipuram silks, and bridal couture.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-3.5 p-3.5 rounded-xl bg-[#1D1410] border border-[#D4AF62]/20"
              >
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-serif text-base font-semibold text-[#F8F1E4] truncate">
                      {lang === 'te' ? item.nameTe : item.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.productId, item.variantId)}
                      aria-label="Remove item"
                      className="text-[#C9BCA8] hover:text-rose-400 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#C9BCA8]">{item.variantLabel}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="inline-flex items-center border border-[#D4AF62]/25 rounded bg-[#120D0B]">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQty(item.productId, item.variantId, item.quantity - 1)
                        }
                        className="p-1.5 text-[#D4AF62]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2.5 text-xs tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQty(
                            item.productId,
                            item.variantId,
                            Math.min(item.maxStock, item.quantity + 1)
                          )
                        }
                        className="p-1.5 text-[#D4AF62]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-[#D4AF62] tabular-nums">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#D4AF62]/20 bg-[#120D0B] space-y-3">
            <div className="flex justify-between text-xs text-[#C9BCA8] tabular-nums">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#C9BCA8] tabular-nums">
              <span>Insured Delivery</span>
              <span>{shipping === 0 ? 'Complimentary' : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-[#F8F1E4] pt-2 border-t border-[#D4AF62]/15 tabular-nums">
              <span>Estimated Total</span>
              <span className="text-[#D4AF62]">{formatINR(subtotal + shipping)}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              className="w-full py-3.5 rounded-lg bg-[#D4AF62] hover:bg-[#E7C77A] text-[#120D0B] text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

interface WishlistDrawerProps {
  open: boolean;
  products: Product[];
  config: StoreConfig;
  lang: Language;
  onClose: () => void;
  onRemoveWishlist: (id: string) => void;
  onMoveToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  open,
  products,
  config,
  lang,
  onClose,
  onRemoveWishlist,
  onMoveToCart,
  onSelectProduct,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative z-10 w-full max-w-md bg-[#16100D] border-l border-[#D4AF62]/30 h-full flex flex-col">
        <div className="p-5 border-b border-[#D4AF62]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#D41472] fill-[#D41472]" />
            <h2 className="font-serif text-2xl font-semibold text-[#F8F1E4]">
              {lang === 'te' ? 'మీ విష్‌లిస్ట్' : 'Your Wishlist'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="p-2 text-[#C9BCA8] hover:text-[#F8F1E4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {products.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Heart className="h-10 w-10 text-[#D4AF62]/40 mx-auto" />
              <p className="font-serif text-xl text-[#F8F1E4]">No saved treasures yet.</p>
              <p className="text-xs text-[#C9BCA8]">
                Tap the heart icon on any saree, jewellery piece, or lehenga to save it here.
              </p>
            </div>
          ) : (
            products.map((product) => {
              const v = product.variants[0];
              const pricing = calculateVariantPricing(product, v, config);
              return (
                <div
                  key={product._id}
                  className="flex gap-3.5 p-3.5 rounded-xl bg-[#1D1410] border border-[#D4AF62]/20"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(product);
                    }}
                    className="h-20 w-20 rounded-lg overflow-hidden shrink-0"
                  >
                    <SafeImage
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectProduct(product);
                        }}
                        className="text-left font-serif text-base font-semibold text-[#F8F1E4] truncate hover:text-[#D4AF62]"
                      >
                        {lang === 'te' ? product.nameTe : product.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveWishlist(product._id)}
                        className="text-[#C9BCA8] hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-[#D4AF62] tabular-nums">
                      {formatINR(pricing.currentPrice)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onMoveToCart(product);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded bg-[#D4AF62] text-[#120D0B] text-[11px] font-semibold uppercase tracking-wider"
                    >
                      Move to Bag
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  items,
  onClose,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('500034');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'COD'>('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!open) return null;

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shipping = subtotal >= 2999 ? 0 : 199;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          address,
          city,
          state,
          pincode,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place order');
      setConfirmedOrder(data as Order);
      onOrderSuccess(data as Order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-[#16100D] border border-[#D4AF62]/35 rounded-2xl p-6 sm:p-8 shadow-2xl my-8">
        <button
          type="button"
          onClick={() => {
            setConfirmedOrder(null);
            onClose();
          }}
          aria-label="Close checkout"
          className="absolute top-4 right-4 p-2 text-[#C9BCA8] hover:text-[#F8F1E4]"
        >
          <X className="h-5 w-5" />
        </button>

        {confirmedOrder ? (
          <div className="text-center space-y-5 py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF62]">
                Order Confirmed
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#F8F1E4]">
                Thank You, {confirmedOrder.customerName}
              </h2>
              <p className="text-sm text-[#C9BCA8]">
                Order Reference:{' '}
                <strong className="text-[#D4AF62] tabular-nums">
                  {confirmedOrder.orderNumber}
                </strong>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#211713] border border-[#D4AF62]/20 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#C9BCA8]">Status</span>
                <span className="text-emerald-400 font-medium">{confirmedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9BCA8]">Payment Method</span>
                <span className="text-[#F8F1E4]">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9BCA8]">Total Paid / Payable</span>
                <span className="text-[#D4AF62] font-semibold tabular-nums">
                  {formatINR(confirmedOrder.total)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfirmedOrder(null);
                onClose();
              }}
              className="px-7 py-3 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF62]">
                SDA Collections Express Checkout
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F8F1E4] mt-1">
                Delivery & Payment Details
              </h2>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name *"
                className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile Number (+91) *"
                className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for Receipt"
                className="sm:col-span-2 bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat / Street Address *"
                className="sm:col-span-2 bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City *"
                className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
                />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="PIN Code *"
                  className="bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2.5 text-xs text-[#F8F1E4] tabular-nums focus:border-[#D4AF62] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[#C9BCA8]">
                Payment Option
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['UPI', 'Card', 'COD'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      paymentMethod === method
                        ? 'bg-[#D4AF62] text-[#120D0B] border-[#D4AF62] font-semibold'
                        : 'bg-[#211713] text-[#F8F1E4] border-[#D4AF62]/25'
                    }`}
                  >
                    {method === 'COD' ? 'Cash on Delivery' : method}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#211713] border border-[#D4AF62]/20 flex items-center justify-between text-sm">
              <span className="text-[#C9BCA8]">Order Total ({items.length} items)</span>
              <span className="text-lg font-semibold text-[#D4AF62] tabular-nums">
                {formatINR(total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-lg bg-[#D4AF62] hover:bg-[#E7C77A] text-[#120D0B] text-xs font-semibold uppercase tracking-[0.18em] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Confirming Order...' : `Confirm Order · ${formatINR(total)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
