"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 pt-[env(safe-area-inset-top,0px)] shadow-2xs">
      <div className="flex items-center justify-between h-14 px-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="h-11 w-11 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 rounded-xl transition cursor-pointer shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation drawer</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r border-slate-200">
              <Sidebar className="w-full h-full" onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 min-w-0">
            <img src="/icons/icon-192.png" alt="Ghar Hisaab" className="h-8 w-8 rounded-xl shadow-2xs object-contain shrink-0" />
            <span className="text-base font-bold tracking-tight text-slate-900 truncate">Ghar Hisaab</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
