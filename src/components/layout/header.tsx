"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { BrandMark } from "@/components/brand-logo";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 pt-[env(safe-area-inset-top,0px)] shadow-2xs">
      <div className="flex items-center justify-between gap-2 h-14 px-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="h-10 w-10 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 rounded-xl transition cursor-pointer shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation drawer</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r border-slate-200">
              <Sidebar className="w-full h-full" onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <BrandMark className="h-8 w-8 rounded-xl shadow-xs" />
            <span className="font-display text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
              Ghar <span className="text-sky-600 dark:text-sky-400">Hisaab</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle className="h-9 w-9" />
          <LanguageSwitcher compact />
        </div>
      </div>
    </header>
  );
}
