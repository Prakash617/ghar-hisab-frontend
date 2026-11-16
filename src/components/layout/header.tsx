"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Menu, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { BrandMark } from "@/components/brand-logo";
import { useTranslation } from "@/i18n/provider";

const PAGE_TITLES: Array<{ prefix: string; key: string }> = [
  { prefix: "/houses", key: "nav.houses" },
  { prefix: "/rooms", key: "nav.rooms" },
  { prefix: "/payments", key: "nav.payments" },
  { prefix: "/emails", key: "nav.emails" },
  { prefix: "/expenses", key: "nav.expenses" },
  { prefix: "/bulk-billing", key: "nav.bulkBilling" },
  { prefix: "/settings", key: "nav.settings" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useTranslation();

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 16) {
        setVisible(true);
        lastScrollY.current = currentY;
        return;
      }
      const delta = currentY - lastScrollY.current;
      if (delta > 6 && currentY > 56) {
        setVisible(false);
        lastScrollY.current = currentY;
      } else if (delta < -6) {
        setVisible(true);
        lastScrollY.current = currentY;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showHeader = visible || open;

  const isDetailPage =
    /^\/rooms\/\d+/.test(pathname) || /^\/houses\/\d+/.test(pathname);
  const matchedTitle = PAGE_TITLES.find((item) =>
    pathname.startsWith(item.prefix)
  );
  const isDashboard = pathname === "/dashboard" || !matchedTitle;

  return (
    <header
      className={`md:hidden sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/70 pt-[env(safe-area-inset-top,0px)] select-none transition-transform duration-200 will-change-transform ${
        showHeader ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-2 h-14 px-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {isDetailPage ? (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="h-11 w-11 inline-flex items-center justify-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 active:scale-95 transition shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="h-11 w-11 inline-flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 active:scale-95 rounded-full transition cursor-pointer shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation drawer</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 border-r border-slate-200 dark:border-slate-800">
                <Sidebar className="w-full h-full" onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          {isDashboard ? (
            <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
              <BrandMark className="h-7 w-7 rounded-xl shadow-xs" />
              <span className="font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                Ghar <span className="text-sky-600 dark:text-sky-400">Hisaab</span>
              </span>
            </Link>
          ) : (
            <h1 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {t(matchedTitle.key)}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setLocale(locale === "ne" ? "en" : "ne")}
            aria-label="Switch language"
            title={locale === "ne" ? "Switch to English" : "नेपालीमा बदल्नुहोस्"}
            className="h-10 px-2.5 inline-flex items-center justify-center rounded-full text-xs font-bold tracking-wide text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 active:scale-95 transition cursor-pointer"
          >
            {locale === "ne" ? "ने" : "EN"}
          </button>
          <ThemeToggle className="h-10 w-10 border-0 bg-transparent shadow-none hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-full" />
          <Link
            href="/settings"
            aria-label="Settings"
            className="h-10 w-10 inline-flex items-center justify-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 active:scale-95 transition"
          >
            <Settings className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
