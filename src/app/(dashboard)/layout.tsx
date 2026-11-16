"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/i18n/provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import {
  ALL_MOBILE_NAV_OPTIONS,
  useMobileNavStore,
} from "@/stores/mobile-nav";

const GRID_COLS_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { hrefs: mobileNavHrefs, hydrate: hydrateMobileNav } = useMobileNavStore();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadUser();
    hydrateMobileNav();
  }, [loadUser, hydrateMobileNav]);

  const mobileNavItems = mobileNavHrefs
    .map((href) => ALL_MOBILE_NAV_OPTIONS.find((opt) => opt.href === href))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />
      <main className="md:ml-64 px-3.5 pt-3.5 sm:p-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* Mobile Native App Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-40 px-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden pointer-events-none"
      >
        <div
          className={`pointer-events-auto mx-auto grid max-w-lg ${
            GRID_COLS_CLASS[mobileNavItems.length] || "grid-cols-5"
          } gap-1 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 backdrop-blur-xl shadow-xl ring-1 ring-black/5`}
        >
          {mobileNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[11px] font-semibold tracking-tight transition-all active:scale-95 select-none ${
                  isActive
                    ? "bg-sky-50 text-sky-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform ${isActive ? "text-sky-600 scale-105" : "text-slate-500"}`} />
                <span className="truncate max-w-[58px] text-center">{t(item.key)}</span>
                {isActive && (
                  <span className="absolute -bottom-0.5 h-1 w-4 rounded-full bg-sky-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
