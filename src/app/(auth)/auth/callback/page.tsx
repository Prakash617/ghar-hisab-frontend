"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/i18n/provider";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthSuccess } = useAuthStore();
  const { locale } = useTranslation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    const error = searchParams.get("error");

    if (error) {
      setErrorMsg(
        locale === "ne"
          ? "गुगल मार्फत साइन इन गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।"
          : "Google sign-in was canceled or failed. Please try again."
      );
      return;
    }

    if (access && refresh) {
      handleOAuthSuccess(access, refresh)
        .then(() => {
          router.replace("/dashboard");
        })
        .catch((err) => {
          console.error("OAuth token exchange failed:", err);
          setErrorMsg(
            locale === "ne"
              ? "प्रयोगकर्ता विवरण प्राप्त गर्न असफल भयो।"
              : "Failed to load user profile with Google credentials."
          );
        });
    } else {
      setErrorMsg(
        locale === "ne"
          ? "अमान्य प्रमाणीकरण टोकन प्राप्त भयो।"
          : "Invalid or missing authentication tokens."
      );
    }
  }, [searchParams, handleOAuthSuccess, router, locale]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {locale === "ne" ? "साइन इन असफल भयो" : "Authentication Failed"}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">{errorMsg}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              {locale === "ne" ? "लगइन पृष्ठमा फर्कनुहोस्" : "Return to Sign In"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl text-center space-y-5">
        {/* Google G Logo with pulse ring */}
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-md">
          <svg className="h-8 w-8 animate-pulse" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            {locale === "ne" ? "गुगल साइन इन पूरा गरिँदै..." : "Completing Sign In..."}
          </h3>
          <p className="text-xs text-slate-500">
            {locale === "ne"
              ? "कृपया केही क्षण पर्खनुहोस्, ड्यासबोर्ड खुल्दैछ।"
              : "Connecting your account and setting up your workspace."}
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

