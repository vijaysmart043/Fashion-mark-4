import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  LogOut,
  PackageSearch,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react';
import type { Order, StoreConfig, UserSession } from '../shared/types';
import { formatINR } from '../shared/types';

interface AccountModalProps {
  open: boolean;
  user: UserSession | null;
  onClose: () => void;
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenTrackOrder: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  open,
  user,
  onClose,
  onLogin,
  onLogout,
  onOpenAdmin,
  onOpenTrackOrder,
}) => {
  const [mode, setMode] = useState<'customer' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requiresAdminSetup, setRequiresAdminSetup] = useState(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || mode !== 'admin') return;
    let cancelled = false;
    setCheckingAdminStatus(true);
    fetch('/api/auth/admin-status')
      .then((r) => (r.ok ? r.json() : { requiresSetup: false }))
      .then((data: { requiresSetup?: boolean }) => {
        if (!cancelled) {
          setRequiresAdminSetup(Boolean(data.requiresSetup));
        }
      })
      .catch(() => {
        if (!cancelled) setRequiresAdminSetup(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingAdminStatus(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, mode]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (mode === 'admin' && !password) {
      setError('Administrator passcode is required.');
      return;
    }

    if (mode === 'admin' && requiresAdminSetup) {
      if (password.length < 8) {
        setError('Admin passcode must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passcodes do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint =
        mode === 'admin' && requiresAdminSetup ? '/api/auth/admin-setup' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresSetup) {
          setRequiresAdminSetup(true);
        }
        throw new Error(data.error || 'Sign in failed');
      }
      setPassword('');
      setConfirmPassword('');
      onLogin(data as UserSession);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#16100D] border border-[#D4AF62]/35 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close account dialog"
          className="absolute top-4 right-4 p-2 text-[#C9BCA8] hover:text-[#F8F1E4]"
        >
          <X className="h-5 w-5" />
        </button>

        {user ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#211713] border border-[#D4AF62]/40 flex items-center justify-center text-[#D4AF62]">
                {user.role === 'admin' ? (
                  <Shield className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#F8F1E4]">
                  {user.name}
                </h2>
                <p className="text-xs text-[#C9BCA8]">
                  {user.email} · {user.role === 'admin' ? 'Store Administrator' : 'Royal Patron'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full py-3 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Open Admin Customization Studio</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTrackOrder();
                }}
                className="w-full py-3 rounded-lg bg-[#211713] border border-[#D4AF62]/30 text-[#F8F1E4] text-xs font-medium inline-flex items-center justify-center gap-2 hover:border-[#D4AF62]"
              >
                <PackageSearch className="h-4 w-4 text-[#D4AF62]" />
                <span>Track an Order</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-lg border border-rose-500/30 text-rose-300 text-xs inline-flex items-center justify-center gap-2 hover:bg-rose-950/40"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF62]">
                SDA Collections Account
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[#F8F1E4] mt-1">
                Sign In
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#211713] border border-[#D4AF62]/20">
              <button
                type="button"
                onClick={() => {
                  setMode('customer');
                  setPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className={`py-2 rounded text-xs font-medium transition-colors ${
                  mode === 'customer'
                    ? 'bg-[#D4AF62] text-[#120D0B] font-semibold'
                    : 'text-[#C9BCA8]'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('admin');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className={`py-2 rounded text-xs font-medium transition-colors ${
                  mode === 'admin'
                    ? 'bg-[#65102F] text-[#F8F1E4] font-semibold'
                    : 'text-[#C9BCA8]'
                }`}
              >
                Store Admin
              </button>
            </div>

            {mode === 'admin' && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#211713] border border-[#D4AF62]/25 text-[11px] text-[#C9BCA8]">
                <Lock className="h-4 w-4 text-[#D4AF62] shrink-0 mt-0.5" />
                <p>
                  {checkingAdminStatus
                    ? 'Verifying administrator security status...'
                    : requiresAdminSetup
                    ? 'First-run setup: create your administrator email and passcode (8+ characters) to lock Admin Studio.'
                    : 'Admin Studio is protected. Enter authorized administrator credentials to continue.'}
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded p-2.5">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === 'admin'
                    ? 'Administrator email address'
                    : 'Enter your email address'
                }
                className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
              <input
                type="password"
                required={mode === 'admin'}
                minLength={mode === 'admin' && requiresAdminSetup ? 8 : undefined}
                autoComplete={
                  mode === 'admin' && requiresAdminSetup ? 'new-password' : 'current-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === 'admin'
                    ? requiresAdminSetup
                      ? 'Create admin passcode (min 8 characters)'
                      : 'Enter administrator passcode'
                    : 'Password (optional for quick patron sign-in)'
                }
                className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
              />
              {mode === 'admin' && requiresAdminSetup && (
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm admin passcode"
                  className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4] focus:border-[#D4AF62] focus:outline-none"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (mode === 'admin' && checkingAdminStatus)}
              className="w-full py-3 rounded-lg bg-[#D4AF62] hover:bg-[#E7C77A] text-[#120D0B] text-xs font-semibold uppercase tracking-[0.18em] transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Authenticating...'
                : mode === 'admin'
                ? requiresAdminSetup
                  ? 'Claim Admin Studio & Sign In'
                  : 'Verify & Enter Admin Studio'
                : 'Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

interface InfoModalProps {
  page: string | null;
  config: StoreConfig;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ page, config, onClose }) => {
  const [orderQuery, setOrderQuery] = useState('SDA-2026-1042');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');
  const [contactSent, setContactSent] = useState(false);

  if (!page) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    try {
      const res = await fetch(
        `/api/orders/track/${encodeURIComponent(orderQuery.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found');
      setTrackedOrder(data as Order);
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : 'Order not found');
    }
  };

  const titles: Record<string, string> = {
    track: 'Track Your Order',
    contact: 'Contact SDA Concierge',
    faq: 'Frequently Asked Questions',
    shipping: 'Shipping & Insured Delivery Policy',
    returns: 'Returns & Exchange Policy',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    refund: 'Refund Policy',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-[#16100D] border border-[#D4AF62]/35 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-[#C9BCA8] hover:text-[#F8F1E4]"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF62]">
            {config.brandName}
          </span>
          <h2 className="font-serif text-3xl font-semibold text-[#F8F1E4] mt-1">
            {titles[page] || 'Customer Care'}
          </h2>
        </div>

        {page === 'track' && (
          <div className="space-y-4">
            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Order # (e.g. SDA-2026-1042)"
                className="flex-1 bg-[#211713] border border-[#D4AF62]/30 rounded-lg px-3.5 py-2.5 text-xs text-[#F8F1E4]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider"
              >
                Track
              </button>
            </form>
            {trackError && <p className="text-xs text-rose-400">{trackError}</p>}
            {trackedOrder && (
              <div className="p-4 rounded-xl bg-[#211713] border border-[#D4AF62]/25 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#C9BCA8]">Order Number</span>
                  <span className="text-[#D4AF62] font-semibold tabular-nums">
                    {trackedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C9BCA8]">Patron</span>
                  <span className="text-[#F8F1E4]">{trackedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C9BCA8]">Current Stage</span>
                  <span className="text-emerald-400 font-semibold">{trackedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C9BCA8]">Total Value</span>
                  <span className="text-[#F8F1E4] tabular-nums">
                    {formatINR(trackedOrder.total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 'contact' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#DFD3C0]">
            <div className="p-4 rounded-xl bg-[#211713] border border-[#D4AF62]/20 space-y-1.5">
              <p>
                <strong className="text-[#D4AF62]">Boutique:</strong> {config.contact.address}
              </p>
              <p>
                <strong className="text-[#D4AF62]">Phone / WhatsApp:</strong> {config.contact.phone}
              </p>
              <p>
                <strong className="text-[#D4AF62]">Email:</strong> {config.contact.email}
              </p>
              <p>
                <strong className="text-[#D4AF62]">Hours:</strong> {config.contact.hours}
              </p>
            </div>
            {contactSent ? (
              <p className="inline-flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Thank you. An SDA Bridal & Couture stylist will contact you shortly.</span>
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSent(true);
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone or Email"
                  className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                />
                <textarea
                  rows={3}
                  required
                  placeholder="How may our stylists assist you?"
                  className="w-full bg-[#211713] border border-[#D4AF62]/25 rounded-lg px-3 py-2 text-xs text-[#F8F1E4]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#D4AF62] text-[#120D0B] text-xs font-semibold uppercase tracking-wider"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        )}

        {page !== 'track' && page !== 'contact' && (
          <div className="space-y-3 text-xs sm:text-sm text-[#DFD3C0] leading-relaxed">
            <p>
              At <strong className="text-[#D4AF62]">{config.brandName}</strong>, every 22K gold ornament is BIS 916 hallmarked with live daily rate weight-pricing, and every heritage silk saree carries Silk Mark certification.
            </p>
            <p>
              <strong>Delivery & Insurance:</strong> Orders above ₹2,999 ship free across India via fully insured BlueDart/Sequel luxury courier within 2–6 business days.
            </p>
            <p>
              <strong>Returns & Exchanges:</strong> Unworn ready-to-wear outfits, sarees with intact silk tags, and jewellery in tamper-proof seals are eligible for 14-day exchange or store credit. Bespoke made-to-measure bridal orders include complimentary tailoring adjustments.
            </p>
            <p>
              <strong>Data Privacy:</strong> Patron details are used exclusively to fulfill insured deliveries and order updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
