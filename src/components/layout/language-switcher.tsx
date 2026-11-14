"use client";

import { useTranslation } from "@/i18n/provider";
import { ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function LanguageSwitcher({
  className,
  showIcon = true,
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  return (
    <div className={cn("relative inline-flex items-center shrink-0", className)}>
      {showIcon && (
        <Globe
          className={cn(
            "pointer-events-none absolute h-3.5 w-3.5 text-slate-500",
            compact ? "left-2.5" : "left-2.5"
          )}
        />
      )}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as "en" | "ne")}
        aria-label="Select Language"
        className={cn(
          "appearance-none rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:border-sky-500 focus:outline-none cursor-pointer transition",
          compact ? "h-9 pl-7 pr-6" : "h-10 sm:h-9",
          !compact && (showIcon ? "pl-8 pr-7" : "px-3")
        )}
      >
        <option value="en">{compact ? "EN" : "English (EN)"}</option>
        <option value="ne">{compact ? "नेपाली" : "नेपाली (NE)"}</option>
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400",
          compact ? "right-1.5" : "right-2"
        )}
      />
    </div>
  );
}
