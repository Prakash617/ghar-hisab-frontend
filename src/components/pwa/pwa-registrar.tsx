"use client";

import { useEffect, useState } from "react";
import { Download, X, Share2, PlusSquare, WifiOff, CheckCircle2, Sparkles } from "lucide-react";

export function PwaRegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] ServiceWorker registered with scope:", registration.scope);

            // Periodic update check
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("[PWA] New content is available; please refresh.");
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("[PWA] ServiceWorker registration failed:", error);
          });
      });
    }

    // 2. Standalone Mode Detection
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // 3. Online / Offline status monitoring
    setIsOffline(!navigator.onLine);
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4000);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 4. Install Prompt Handling
    if (!standalone) {
      // Check dismissed cooldown (7 days)
      const lastDismissed = localStorage.getItem("pwa_install_dismissed");
      const isDismissedRecently =
        lastDismissed && Date.now() - parseInt(lastDismissed, 10) < 7 * 24 * 60 * 60 * 1000;

      // Detect iOS Safari
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
      setIsIos(isIosDevice);

      // Listen for Android/Desktop Chrome install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (!isDismissedRecently) {
          // Delay presentation slightly for pleasant UX
          setTimeout(() => setShowInstallBanner(true), 2500);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // If iOS and not standalone and not recently dismissed, show banner
      if (isIosDevice && !isDismissedRecently) {
        setTimeout(() => setShowInstallBanner(true), 3500);
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIosGuide(false);
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
  };

  return (
    <>
      {/* Offline Status Floating Pill */}
      {isOffline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-bounce-short">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/90 text-amber-400 border border-amber-500/30 px-4 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-md">
            <WifiOff className="h-3.5 w-3.5 text-amber-400" />
            <span>अफलाइन मोड (Offline mode - showing cached data)</span>
          </div>
        </div>
      )}

      {/* Online Reconnected Toast */}
      {showOnlineToast && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="flex items-center gap-2 rounded-full bg-emerald-900/95 text-emerald-200 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-md">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>इन्टरनेट जडान भयो (Back online)</span>
          </div>
        </div>
      )}

      {/* Mobile App Install Prompt (Bottom sheet / floating card) */}
      {showInstallBanner && !isStandalone && (
        <div className="fixed bottom-20 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-slide-up">
          <div className="relative rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-white via-indigo-50/40 to-sky-50/50 p-4 shadow-2xl backdrop-blur-md ring-1 ring-black/5">
            <button
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close install prompt"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl p-1 shadow-md shadow-slate-200 shrink-0 flex items-center justify-center bg-white border border-slate-100">
                <img src="/icons/icon-192.png" alt="Ghar Hisaab" className="h-full w-full object-contain rounded-xl" />
              </div>

              <div className="flex-1 pr-4">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">Ghar Hisaab App</h4>
                  <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" /> PWA
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 leading-snug">
                  मोबाइल एपको रूपमा इन्स्टल गर्नुहोस् र फुल-स्क्रिन अनुभव लिनुहोस्।
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-indigo-300 hover:bg-indigo-700 active:scale-95 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>इन्स्टल गर्नुहोस् (Install App)</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 transition"
                  >
                    पछि (Later)
                  </button>
                </div>
              </div>
            </div>

            {/* iOS Safari Step-by-Step Instructions Modal */}
            {showIosGuide && (
              <div className="mt-3.5 pt-3 border-t border-indigo-100 text-xs text-slate-700 space-y-2 animate-fade-in bg-white/70 p-2.5 rounded-xl">
                <p className="font-semibold text-indigo-900">
                  iPhone मा इन्स्टल गर्ने तरिका (Install on iOS):
                </p>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">1</span>
                  <span>Safari को तल रहेको <Share2 className="inline h-3.5 w-3.5 text-indigo-600 mx-0.5" /> <strong>Share</strong> बटन थिच्नुहोस्।</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">2</span>
                  <span>तल स्क्रोल गरी <PlusSquare className="inline h-3.5 w-3.5 text-indigo-600 mx-0.5" /> <strong>Add to Home Screen</strong> छान्नुहोस्।</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
