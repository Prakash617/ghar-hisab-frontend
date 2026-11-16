import { create } from "zustand";
import {
  LayoutDashboard,
  Home,
  DoorOpen,
  CreditCard,
  Mail,
  Wallet,
  Zap,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface MobileNavOption {
  href: string;
  key: string;
  icon: LucideIcon;
}

export const ALL_MOBILE_NAV_OPTIONS: MobileNavOption[] = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/houses", key: "nav.houses", icon: Home },
  { href: "/rooms", key: "nav.rooms", icon: DoorOpen },
  { href: "/payments", key: "nav.payments", icon: CreditCard },
  { href: "/emails", key: "nav.emails", icon: Mail },
  { href: "/expenses", key: "nav.expenses", icon: Wallet },
  { href: "/bulk-billing", key: "nav.bulkBilling", icon: Zap },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

export const DEFAULT_MOBILE_NAV_HREFS = [
  "/dashboard",
  "/houses",
  "/rooms",
  "/payments",
  "/emails",
];

const STORAGE_KEY = "gharhisab-mobile-nav-items";
export const MIN_MOBILE_NAV_ITEMS = 2;
export const MAX_MOBILE_NAV_ITEMS = 5;

const VALID_HREFS = new Set(ALL_MOBILE_NAV_OPTIONS.map((o) => o.href));

function sanitizeHrefs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return DEFAULT_MOBILE_NAV_HREFS;
  const unique = raw.filter(
    (item, idx): item is string =>
      typeof item === "string" &&
      VALID_HREFS.has(item) &&
      raw.indexOf(item) === idx
  );
  if (unique.length < MIN_MOBILE_NAV_ITEMS) return DEFAULT_MOBILE_NAV_HREFS;
  return unique.slice(0, MAX_MOBILE_NAV_ITEMS);
}

function saveToStorage(hrefs: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hrefs));
  } catch {
    // Ignore storage quota / private mode errors
  }
}

interface MobileNavState {
  hrefs: string[];
  hydrated: boolean;
  hydrate: () => void;
  toggleItem: (href: string) => void;
  moveItem: (href: string, direction: "up" | "down") => void;
  resetDefault: () => void;
}

export const useMobileNavStore = create<MobileNavState>((set, get) => ({
  hrefs: DEFAULT_MOBILE_NAV_HREFS,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = sanitizeHrefs(JSON.parse(saved));
        set({ hrefs: parsed, hydrated: true });
        return;
      }
    } catch {
      // Ignore malformed JSON
    }
    set({ hydrated: true });
  },

  toggleItem: (href: string) => {
    const current = get().hrefs;
    const exists = current.includes(href);
    let next: string[];
    if (exists) {
      if (current.length <= MIN_MOBILE_NAV_ITEMS) return;
      next = current.filter((h) => h !== href);
    } else {
      if (current.length >= MAX_MOBILE_NAV_ITEMS) return;
      next = [...current, href];
    }
    saveToStorage(next);
    set({ hrefs: next });
  },

  moveItem: (href: string, direction: "up" | "down") => {
    const current = [...get().hrefs];
    const idx = current.indexOf(href);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= current.length) return;
    [current[idx], current[swapIdx]] = [current[swapIdx], current[idx]];
    saveToStorage(current);
    set({ hrefs: current });
  },

  resetDefault: () => {
    saveToStorage(DEFAULT_MOBILE_NAV_HREFS);
    set({ hrefs: DEFAULT_MOBILE_NAV_HREFS });
  },
}));
