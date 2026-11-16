"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { emailApi, housesApi, profileApi, roomsApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { useTheme } from "@/components/theme-provider";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  Mail,
  QrCode,
  Sparkles,
  Sun,
  Moon,
  Upload,
} from "lucide-react";

const ONBOARDING_DONE_KEY = "gharhisab-onboarding-done";
const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Step 2: First House & Room
  const [houseName, setHouseName] = useState("");
  const [houseLocation, setHouseLocation] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomName, setRoomName] = useState("");
  const [createdSummary, setCreatedSummary] = useState<{
    house?: string;
    room?: string;
    qrUploaded?: boolean;
    autoEmail?: boolean;
  }>({});

  // Step 3: Payment QR & Auto Email
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [autoEmail, setAutoEmail] = useState(false);
  const qrInputRef = useRef<HTMLInputElement | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.get(),
  });

  useEffect(() => {
    if (profile) {
      if (!firstName && profile.first_name) setFirstName(profile.first_name);
      if (!lastName && profile.last_name) setLastName(profile.last_name);
    }
  }, [profile, firstName, lastName]);

  const goStep = (next: number) => {
    setDirection(next >= step ? "forward" : "back");
    setStep(next);
  };

  const markDoneAndGoDashboard = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    }
    queryClient.invalidateQueries({ queryKey: ["houses"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    router.replace("/dashboard");
  };

  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("Please enter your first name.");
      return;
    }
    setIsSubmitting(true);
    try {
      await profileApi.update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      goStep(2);
    } catch (err: any) {
      toast.error(err?.message || "Could not save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseName.trim()) {
      goStep(3);
      return;
    }
    setIsSubmitting(true);
    try {
      const house = await housesApi.create({
        name: houseName.trim(),
        location: houseLocation.trim(),
      });
      let createdRoomLabel: string | undefined;
      if (roomNumber.trim()) {
        await roomsApi.create({
          house: house.id,
          room_number: roomNumber.trim(),
          room_name: roomName.trim() || `Room ${roomNumber.trim()}`,
        });
        createdRoomLabel = roomName.trim() || `Room ${roomNumber.trim()}`;
      }
      setCreatedSummary((prev) => ({
        ...prev,
        house: house.name,
        room: createdRoomLabel,
      }));
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      goStep(3);
    } catch (err: any) {
      toast.error(err?.message || "Could not create house/room.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let qrUploaded = false;
      if (qrFile) {
        const formData = new FormData();
        formData.append("payment_qr_image", qrFile);
        await profileApi.update(formData);
        qrUploaded = true;
      }
      if (autoEmail) {
        await emailApi.updateSettings({
          auto_reminder_enabled: true,
          auto_reminder_cooldown_days: 15,
        });
      }
      setCreatedSummary((prev) => ({
        ...prev,
        qrUploaded,
        autoEmail,
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem(ONBOARDING_DONE_KEY, "true");
      }
      goStep(4);
    } catch (err: any) {
      toast.error(err?.message || "Could not save preferences.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const animClass =
    direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div className="min-h-[82vh] flex flex-col justify-between max-w-lg mx-auto py-2 px-1">
      {/* Top Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && step < 4 ? (
              <button
                type="button"
                onClick={() => goStep(step - 1)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                aria-label="Previous step"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:text-sky-300">
                <Sparkles className="h-3 w-3" />
                Quick Setup
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>

          {step < 4 && (
            <button
              type="button"
              onClick={markDoneAndGoDashboard}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 rounded-lg active:scale-95 transition cursor-pointer"
            >
              Skip setup
            </button>
          )}
        </div>

        {/* Segmented Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx <= step
                  ? "bg-sky-600 dark:bg-sky-400"
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Body */}
      <div key={step} className={`my-5 ${animClass}`}>
        {step === 1 && (
          <form
            onSubmit={handleStep1Next}
            className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5"
          >
            <div className="flex flex-col items-center text-center">
              <img
                src="/images/onboarding-welcome.gif"
                alt="Welcome to GharHisab"
                className="h-28 w-28 object-contain"
              />
              <h1 className="mt-2 font-display text-xl font-extrabold text-slate-900 dark:text-white">
                Welcome to Ghar Hisaab
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Let&apos;s personalize your app in under a minute.
              </p>
            </div>

            {/* Language & Theme */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Language
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setLocale("en")}
                    className={`rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                      locale === "en"
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale("ne")}
                    className={`rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                      locale === "ne"
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    नेपाली
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Appearance
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                      theme === "light"
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                      theme === "dark"
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="onb-first">First Name *</Label>
                <Input
                  id="onb-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Prakash"
                  required
                  className="mt-1 h-11"
                />
              </div>
              <div>
                <Label htmlFor="onb-last">Last Name</Label>
                <Input
                  id="onb-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Thapa"
                  className="mt-1 h-11"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl text-sm font-bold">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={handleStep2Next}
            className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col items-center text-center">
              <img
                src="/images/onboarding-property.gif"
                alt="Add Property"
                className="h-28 w-28 object-contain"
              />
              <h2 className="mt-2 font-display text-xl font-extrabold text-slate-900 dark:text-white">
                Add Your First House
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Create a property and an optional first room (you can add more later).
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="onb-house">House / Building Name</Label>
                <Input
                  id="onb-house"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="e.g. Jorpati House"
                  className="mt-1 h-11"
                />
              </div>
              <div>
                <Label htmlFor="onb-loc">Location / Address</Label>
                <Input
                  id="onb-loc"
                  value={houseLocation}
                  onChange={(e) => setHouseLocation(e.target.value)}
                  placeholder="e.g. Kathmandu"
                  className="mt-1 h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <Label htmlFor="onb-rnum">First Room No.</Label>
                  <Input
                    id="onb-rnum"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 101"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="onb-rname">Room Label</Label>
                  <Input
                    id="onb-rname"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Ground Floor"
                    className="mt-1 h-11"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => goStep(3)}
                className="h-11 rounded-xl flex-1"
              >
                Skip
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-xl flex-[2] font-bold"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Home className="mr-1.5 h-4 w-4" />
                    {houseName.trim() ? "Save & Next" : "Next"}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form
            onSubmit={handleStep3Next}
            className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5"
          >
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <QrCode className="h-7 w-7" />
              </div>
              <h2 className="mt-3 font-display text-xl font-extrabold text-slate-900 dark:text-white">
                Payment QR &amp; Reminders
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Attach your eSewa / Khalti / Bank QR to invoices &amp; tenant portals.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-4 text-center space-y-3">
              {qrPreview ? (
                <img
                  src={qrPreview}
                  alt="QR Preview"
                  className="mx-auto h-36 w-36 rounded-xl object-contain bg-white p-1.5 border border-slate-200"
                />
              ) : (
                <QrCode className="mx-auto h-10 w-10 text-slate-400" />
              )}
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setQrFile(file);
                  setQrPreview(URL.createObjectURL(file));
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => qrInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {qrFile ? "Change QR Image" : "Upload Payment QR"}
              </Button>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEmail}
                onChange={(e) => setAutoEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-sky-600" />
                  Enable 15-day Email Reminders
                </p>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                  Automatically email unpaid tenants at most once every 15 days. (SMS is always manual.)
                </p>
              </div>
            </label>

            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => goStep(4)}
                className="h-11 rounded-xl flex-1"
              >
                Skip
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-xl flex-[2] font-bold"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Finish Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm text-center space-y-5 animate-pop-in">
            <img
              src="/images/onboarding-ready.gif"
              alt="Setup Complete"
              className="mx-auto h-32 w-32 object-contain"
            />
            <div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                You&apos;re All Set!
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your Ghar Hisaab workspace is ready to manage rooms, bills, and payments.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Profile configured ({firstName || "Owner"})
                </span>
              </div>
              {createdSummary.house && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Created {createdSummary.house}
                    {createdSummary.room ? ` · ${createdSummary.room}` : ""}
                  </span>
                </div>
              )}
              {createdSummary.qrUploaded && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Payment QR attached for invoices</span>
                </div>
              )}
              {createdSummary.autoEmail && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>15-day Email reminders enabled</span>
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={markDoneAndGoDashboard}
              className="w-full h-12 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div />
    </div>
  );
}
