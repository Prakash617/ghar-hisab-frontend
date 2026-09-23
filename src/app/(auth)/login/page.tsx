"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "@/i18n/provider";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const { t, locale } = useTranslation();

  const [googleLoginUrl, setGoogleLoginUrl] = useState(
    `${process.env.NEXT_PUBLIC_API_URL || "https://gharhisab.pythonanywhere.com"}/api/accounts/google/login/`
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://gharhisab.pythonanywhere.com";
      const origin = window.location.origin;
      setGoogleLoginUrl(
        `${apiBase}/api/accounts/google/login/?frontend_url=${encodeURIComponent(origin)}`
      );
    }
  }, []);

  const googleError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success(t("auth.loginSuccess"));
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || t("auth.loginError");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-2 sm:py-0 min-h-screen flex items-center">
      {/* Language Switcher in top right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-sky-200/60 blur-3xl"></div>
        <div className="absolute top-24 -left-12 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl"></div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8 px-4">
        <div className="hidden lg:block">
          <img
            src="/images/logo-ghar-hisaab.svg"
            alt="Ghar Hisaab"
            className="h-12 w-auto mb-6"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("auth.welcomeBack")}
          </p>
          <h1 className="mt-4 font-display text-4xl text-slate-900 leading-tight">
            {t("auth.heroTitle")}
          </h1>
          <p className="mt-4 text-sm text-slate-600">
            {t("auth.heroSubtitle")}
          </p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                {t("auth.verifiedBilling")}
              </p>
              <p className="text-xs text-slate-500">
                {t("auth.verifiedBillingDesc")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                {t("auth.roomVisibility")}
              </p>
              <p className="text-xs text-slate-500">
                {t("auth.roomVisibilityDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/60 sm:p-8 lg:max-w-none">
          <div className="mb-6">
            <img
              src="/images/logo-ghar-hisaab.svg"
              alt="Ghar Hisaab"
              className="h-9 w-auto mb-3 lg:hidden"
            />
            <h2 className="font-display text-2xl sm:text-3xl text-slate-900">
              {t("auth.signIn")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          {googleError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                {t("auth.googleError")}
              </span>
            </div>
          )}

          {/* Google Login Button */}
          <a
            href={googleLoginUrl}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:shadow-xs active:scale-[0.98] transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            <span>
              {t("auth.continueWithGoogle")}
            </span>
          </a>

          <div className="my-5 flex items-center justify-between">
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
            <span className="text-xs uppercase text-slate-400 font-medium">
              {t("auth.orContinueWithEmail")}
            </span>
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("auth.email")}
              </label>
              <input
                type="email"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("auth.password")}
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-11 py-2.5 text-base text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={
                    showPassword
                      ? t("auth.hidePassword")
                      : t("auth.showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="min-h-11 w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-600 disabled:opacity-50 transition"
            >
              {isLoading
                ? t("auth.signingIn")
                : t("auth.signIn")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 sm:text-xs">
            {t("auth.noAccount")}{" "}
            <Link
              href="/register"
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
