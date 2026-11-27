import * as React from 'react';

export function BrandLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brand-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#090E1A" />
      <rect x="2" y="2" width="60" height="60" rx="14" stroke="url(#brand-grad)" strokeWidth="3.5" />
      <path
        d="M23 21L13 32L23 43"
        stroke="#A78BFA"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M41 21L51 32L41 43"
        stroke="#22D3EE"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M35 18L29 46" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
