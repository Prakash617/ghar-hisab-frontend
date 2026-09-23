"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/i18n/provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  DoorOpen,
  CreditCard,
  Mail,
} from "lucide-react";

const mobileNavItems = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/houses", key: "nav.houses", icon: Home },
  { href: "/rooms", key: "nav.rooms", icon: DoorOpen },
  { href: "/payments", key: "nav.payments", icon: CreditCard },
  { href: "/emails", key: "nav.emails", icon: Mail },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
      <main className="md:ml-64 p-3.5 sm:p-6 pb-[calc(5.2rem+env(safe-area-inset-bottom,0px))] md:pb-8">
        {children}
      </main>

      {/* Mobile Native App Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 backdrop-blur-lg shadow-xl ring-1 ring-black/5">
          {mobileNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[10px] font-semibold tracking-tight transition-all active:scale-90 select-none ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform ${isActive ? "text-indigo-600 scale-110" : "text-slate-400"}`} />
                <span className="truncate max-w-[56px] text-center">{t(item.key)}</span>
                {isActive && (
                  <span className="absolute -bottom-0.5 h-1 w-4 rounded-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
