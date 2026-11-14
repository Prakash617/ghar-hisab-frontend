"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/provider";
import { useAuthStore } from "@/stores/auth";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { BrandMark } from "@/components/brand-logo";
import {
  LayoutDashboard,
  Home,
  DoorOpen,
  ClipboardList,
  CreditCard,
  Receipt,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/houses", key: "nav.houses", icon: Home },
  { href: "/rooms", key: "nav.rooms", icon: DoorOpen },
  { href: "/bulk-billing", key: "nav.bulkBilling", icon: ClipboardList },
  { href: "/payments", key: "nav.payments", icon: CreditCard },
  { href: "/expenses", key: "nav.expenses", icon: Receipt },
  { href: "/emails", key: "nav.emails", icon: Mail },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-slate-200",
        className || "hidden md:flex md:w-64 md:fixed md:inset-y-0"
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
          <BrandMark className="h-10 w-10 rounded-xl shadow-xs" />
          <div>
            <h2 className="font-display text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              Ghar <span className="text-sky-600 dark:text-sky-400">Hisaab</span>
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Smart Rental Ledger
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
              {t("nav.signedInAs")}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`
                : user?.email || "User"}
            </p>
            {user?.email && (
              <p className="text-xs text-slate-500">{user.email}</p>
            )}
          </div>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sky-50 text-sky-700 font-semibold shadow-2xs"
                        : "text-slate-700 hover:bg-slate-100 hover:text-sky-600"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-sky-600"
                          : "text-slate-400 group-hover:text-sky-600"
                      )}
                    />
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-slate-200 bg-white px-3 py-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <button
            onClick={logout}
            className="w-full min-h-11 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.logout")}
          </button>
        </div>
      </div>
    </aside>
  );
}
