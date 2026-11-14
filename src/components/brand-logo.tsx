"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  const uid = useId().replace(/:/g, "");
  const bgId = `gh-bg-${uid}`;
  const accentId = `gh-accent-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ghar Hisaab"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={bgId} x1="8" y1="6" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="55%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id={accentId} x1="36" y1="40" x2="46" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${bgId})`} />
      <rect
        x="2.75"
        y="2.75"
        width="58.5"
        height="58.5"
        rx="15.25"
        stroke="#FFFFFF"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <path
        d="M15 29.5L32 16L49 29.5"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 30V45.2C20 47.299 21.701 49 23.8 49H40.2C42.299 49 44 47.299 44 45.2V30"
        fill="#FFFFFF"
        fillOpacity="0.14"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="25.5" y="33.5" width="13" height="3.2" rx="1.6" fill="#FFFFFF" />
      <rect x="25.5" y="40" width="8.5" height="3.2" rx="1.6" fill="#BAE6FD" />
      <circle cx="38" cy="41.6" r="2.6" fill={`url(#${accentId})`} />
    </svg>
  );
}

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export function BrandLogo({ className, alt = "Ghar Hisaab" }: BrandLogoProps) {
  return (
    <>
      <img
        src="/images/logo-ghar-hisaab.svg"
        alt={alt}
        className={cn(className, "dark:hidden")}
      />
      <img
        src="/images/logo-ghar-hisaab-dark.svg"
        alt=""
        aria-hidden="true"
        className={cn(className, "hidden dark:block")}
      />
    </>
  );
}
