"use client";

import { useTranslation } from "@/i18n/provider";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

export function LanguageSwitcher({ className, showIcon = true }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      {showIcon && (
        <Globe className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
      )}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as "en" | "ne")}
        aria-label="Select Language"
        className={cn(
          "h-9 appearance-none rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:border-sky-500 focus:outline-none cursor-pointer transition",
          showIcon ? "pl-8 pr-7" : "px-3"
        )}
      >
        <option value="en">English (EN)</option>
        <option value="ne">नेपाली (NE)</option>
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
        ▼
      </div>
    </div>
  );
}
