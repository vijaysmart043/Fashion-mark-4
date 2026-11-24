import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SdaLogoProps {
  logoUrl?: string;
  brandName?: string;
  tagline?: string;
  showTagline?: boolean;
  compact?: boolean;
  className?: string;
}

export const SdaLogo: React.FC<SdaLogoProps> = ({
  logoUrl,
  brandName = 'SDA COLLECTIONS',
  tagline = 'FASHION · BEAUTY · STYLE',
  showTagline = false,
  compact = false,
  className = '',
}) => {
  if (logoUrl) {
    return (
      <div className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
        <img
          src={logoUrl}
          alt={brandName}
          referrerPolicy="no-referrer"
          className={compact ? 'h-9 w-auto object-contain' : 'h-12 w-auto object-contain'}
        />
        {showTagline && (
          <div className="flex flex-col">
            <span className="font-brand text-sm tracking-[0.22em] text-[#D4AF62] whitespace-nowrap">
              {brandName}
            </span>
            <span className="text-[10px] tracking-[0.28em] text-[#C9BCA8] whitespace-nowrap">
              {tagline}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={compact ? 'h-9 w-9 shrink-0' : 'h-11 w-11 shrink-0'}
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" stroke="#D4AF62" strokeWidth="1.2" strokeOpacity="0.65" />
        <circle cx="32" cy="32" r="26" stroke="#D41472" strokeWidth="0.7" strokeOpacity="0.45" />
        {/* Royal Crown */}
        <path
          d="M21 18L24.5 11.5L29 15.5L32 9.5L35 15.5L39.5 11.5L43 18H21Z"
          fill="#D4AF62"
        />
        {/* Graceful Female Silhouette */}
        <path
          d="M32 20.5C28.8 20.5 26.5 23 26.5 26.2C26.5 28.4 27.6 30.2 29.2 31.2C26 33.4 22.8 38.2 22.2 46.5H41.8C41.2 38.2 38 33.4 34.8 31.2C36.4 30.2 37.5 28.4 37.5 26.2C37.5 23 35.2 20.5 32 20.5Z"
          fill="url(#sdaGoldGrad)"
        />
        {/* Magenta Lotus Accent */}
        <path
          d="M32 49.5C32 49.5 26.5 46.5 26.5 43.2C28.5 43.2 30.6 44.8 32 47C33.4 44.8 35.5 43.2 37.5 43.2C37.5 46.5 32 49.5 32 49.5Z"
          fill="#D41472"
        />
        <defs>
          <linearGradient id="sdaGoldGrad" x1="22" y1="20" x2="42" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5DDA4" />
            <stop offset="0.55" stopColor="#D4AF62" />
            <stop offset="1" stopColor="#9A762F" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col leading-none">
        <span
          className={`font-brand tracking-[0.2em] text-[#F8F1E4] whitespace-nowrap ${
            compact ? 'text-sm sm:text-base font-semibold' : 'text-lg sm:text-xl font-semibold'
          }`}
        >
          {brandName}
        </span>
        {showTagline && (
          <span className="mt-1 text-[9.5px] tracking-[0.28em] text-[#D4AF62] whitespace-nowrap">
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#211713] via-[#17100D] to-[#2B121D] text-center p-4 ${className}`}
      >
        <Sparkles className="h-6 w-6 text-[#D4AF62]/70 mb-2" />
        <span className="font-serif text-sm text-[#D4AF62] tracking-wide">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={className}
    />
  );
};
