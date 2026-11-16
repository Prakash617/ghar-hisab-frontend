"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { profileApi, emailApi, smsApi, backupsApi } from "@/lib/api";
import { getMediaUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, MessageSquare, Save, QrCode, Upload, Trash2, Database, Download, Smartphone, ArrowUp, ArrowDown, RotateCcw, Activity } from "lucide-react";
import {
  ALL_MOBILE_NAV_OPTIONS,
  MAX_MOBILE_NAV_ITEMS,
  MIN_MOBILE_NAV_ITEMS,
  useMobileNavStore,
} from "@/stores/mobile-nav";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "@/i18n/provider";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    hrefs: mobileNavHrefs,
    hydrate: hydrateMobileNav,
    toggleItem: toggleMobileNavItem,
    moveItem: moveMobileNavItem,
    resetDefault: resetMobileNavDefault,
  } = useMobileNavStore();

  useEffect(() => {
    hydrateMobileNav();
  }, [hydrateMobileNav]);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [emailSettings, setEmailSettings] = useState({
    smtp_host: "",
    smtp_port: 587,
    use_tls: true,
    email_host_user: "",
    auto_reminder_enabled: false,
    auto_reminder_cooldown_days: 15,
  });
  const [smsSettings, setSmsSettings] = useState({
    api_key: "",
    is_enabled: false,
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const qrInputRef = useRef<HTMLInputElement | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.get(),
  });

  const { data: emailConfig, isLoading: emailLoading } = useQuery({
    queryKey: ["email-settings"],
    queryFn: () => emailApi.getSettings(),
  });

  const { data: smsConfig, isLoading: smsLoading } = useQuery({
    queryKey: ["sms-settings"],
    queryFn: () => smsApi.getSettings(),
  });

  const isSuperuser = Boolean(profile?.is_superuser);
  const { data: backupsData, isLoading: backupsLoading } = useQuery({
    queryKey: ["db-backups"],
    queryFn: () => backupsApi.list(),
    enabled: isSuperuser,
  });

  const createBackupMutation = useMutation({
    mutationFn: () => backupsApi.createNow(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["db-backups"] });
      toast.success("Database backup created!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create database backup.");
    },
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (emailConfig) {
      setEmailSettings({
        smtp_host: emailConfig.smtp_host || "",
        smtp_port: emailConfig.smtp_port || 587,
        use_tls: emailConfig.use_tls ?? true,
        email_host_user: emailConfig.email_host_user || "",
        auto_reminder_enabled: emailConfig.auto_reminder_enabled ?? false,
        auto_reminder_cooldown_days: emailConfig.auto_reminder_cooldown_days ?? 15,
      });
    }
  }, [emailConfig]);

  useEffect(() => {
    if (smsConfig) {
      setSmsSettings({
        api_key: smsConfig.api_key || "",
        is_enabled: smsConfig.is_enabled ?? false,
      });
    }
  }, [smsConfig]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => profileApi.update(data),
    onSuccess: () => {
      toast.success(t("settings.profileSuccess"));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update profile.");
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: (data: any) => emailApi.updateSettings(data),
    onSuccess: () => {
      toast.success(t("settings.emailSuccess"));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save email settings.");
    },
  });

  const updateSmsMutation = useMutation({
    mutationFn: (data: any) => smsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-settings"] });
      toast.success(t("settings.smsSuccess"));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save SMS settings.");
    },
  });

  const uploadQrMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("payment_qr_image", file);
      return profileApi.update(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setQrFile(null);
      setQrPreview(null);
      if (qrInputRef.current) qrInputRef.current.value = "";
      toast.success(t("settings.paymentQrSaved"));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to upload QR photo.");
    },
  });

  const removeQrMutation = useMutation({
    mutationFn: () => profileApi.update({ remove_payment_qr: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setQrFile(null);
      setQrPreview(null);
      if (qrInputRef.current) qrInputRef.current.value = "";
      toast.success(t("settings.paymentQrRemoved"));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove QR photo.");
    },
  });

  useEffect(() => {
    return () => {
      if (qrPreview) URL.revokeObjectURL(qrPreview);
    };
  }, [qrPreview]);

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (qrPreview) URL.revokeObjectURL(qrPreview);
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailMutation.mutate(emailSettings);
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...smsSettings };
    // Entering a fresh API key activates SMS. The user can still switch
    // the checkbox off in a later save once the key is stored.
    if (payload.api_key && payload.api_key !== "••••••••") {
      payload.is_enabled = true;
    }
    updateSmsMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("settings.title")}</h1>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex w-full items-center justify-start overflow-x-auto flex-nowrap h-auto gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="profile" className="gap-1.5 shrink-0">
            <User className="h-4 w-4" />
            {t("settings.profile")} &amp; QR
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5 shrink-0">
            <Mail className="h-4 w-4" />
            {t("settings.emailSettings")}
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-1.5 shrink-0">
            <MessageSquare className="h-4 w-4" />
            {t("settings.smsSettings")}
          </TabsTrigger>
          <TabsTrigger value="backups" className="gap-1.5 shrink-0">
            <Database className="h-4 w-4" />
            Data &amp; Backups
          </TabsTrigger>
          <TabsTrigger value="mobile-nav" className="gap-1.5 shrink-0">
            <Smartphone className="h-4 w-4" />
            Bottom Nav
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-1.5 shrink-0">
            <Activity className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("settings.profile")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="first_name">{t("settings.firstName")}</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, first_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="last_name">{t("settings.lastName")}</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, last_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">{t("settings.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? t("settings.saving") : t("settings.saveChanges")}
                </Button>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Open Setup Wizard
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-sky-600" />
              {t("settings.paymentQrTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              {t("settings.paymentQrDesc")}
            </p>

            {(qrPreview || profile?.payment_qr_image) ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <img
                  src={qrPreview || getMediaUrl(profile?.payment_qr_image)}
                  alt="Payment QR Code"
                  className="max-h-56 w-auto rounded-xl border border-slate-200 bg-white object-contain p-2 shadow-2xs"
                />
                <p className="mt-2.5 text-xs font-medium text-slate-600">
                  {t("settings.paymentQrEmailHint")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
                <QrCode className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  {t("settings.paymentQrEmpty")}
                </p>
              </div>
            )}

            <input
              ref={qrInputRef}
              id="payment_qr_input"
              type="file"
              accept="image/*"
              onChange={handleQrFileChange}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => qrInputRef.current?.click()}
                disabled={uploadQrMutation.isPending || removeQrMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t("settings.paymentQrChoose")}
              </Button>

              {qrFile && (
                <Button
                  type="button"
                  onClick={() => uploadQrMutation.mutate(qrFile)}
                  disabled={uploadQrMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {uploadQrMutation.isPending
                    ? t("settings.paymentQrUploading")
                    : t("settings.paymentQrUpload")}
                </Button>
              )}

              {(profile?.payment_qr_image || qrPreview) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (qrPreview && !profile?.payment_qr_image) {
                      setQrFile(null);
                      setQrPreview(null);
                      if (qrInputRef.current) qrInputRef.current.value = "";
                    } else {
                      removeQrMutation.mutate();
                    }
                  }}
                  disabled={removeQrMutation.isPending || uploadQrMutation.isPending}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("settings.paymentQrRemove")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="email" className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("settings.emailSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="smtp_host">{t("settings.smtpHost")}</Label>
                <Input
                  id="smtp_host"
                  value={emailSettings.smtp_host}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtp_host: e.target.value })
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_port">{t("settings.smtpPort")}</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={emailSettings.smtp_port}
                  onChange={(e) =>
                    setEmailSettings({
                      ...emailSettings,
                      smtp_port: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use_tls"
                  checked={emailSettings.use_tls}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, use_tls: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="use_tls">{t("settings.useTls")}</Label>
              </div>
              <div>
                <Label htmlFor="email_user">{t("settings.emailAddress")}</Label>
                <Input
                  id="email_user"
                  type="email"
                  value={emailSettings.email_host_user}
                  onChange={(e) =>
                    setEmailSettings({
                      ...emailSettings,
                      email_host_user: e.target.value,
                    })
                  }
                />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto_reminder_enabled"
                    checked={emailSettings.auto_reminder_enabled}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        auto_reminder_enabled: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="auto_reminder_enabled" className="font-semibold text-slate-800">
                    Auto-send Email reminders for unpaid bills
                  </Label>
                </div>
                {emailSettings.auto_reminder_enabled && (
                  <div className="flex items-center gap-2 pl-6">
                    <Label htmlFor="auto_reminder_cooldown_days" className="text-xs text-slate-600">
                      Cooldown (days between reminders):
                    </Label>
                    <Input
                      id="auto_reminder_cooldown_days"
                      type="number"
                      min={1}
                      max={90}
                      value={emailSettings.auto_reminder_cooldown_days}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          auto_reminder_cooldown_days: Math.max(1, parseInt(e.target.value, 10) || 15),
                        })
                      }
                      className="w-20 h-8 text-xs"
                    />
                  </div>
                )}
                <p className="text-[11px] text-slate-500">
                  Only Email can be automated. SMS reminders are always manual so your SMS credits are never spent automatically.
                </p>
              </div>
              <Button type="submit" disabled={updateEmailMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateEmailMutation.isPending ? t("settings.saving") : t("settings.saveChanges")}
              </Button>
            </form>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="sms" className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t("settings.smsSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSmsSubmit} className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <span className="font-medium text-slate-600">
                  {t("settings.smsProvider")}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${
                    smsConfig?.is_configured && smsConfig?.is_enabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {smsConfig?.is_configured
                    ? smsConfig?.is_enabled
                      ? t("settings.smsActive")
                      : t("settings.smsInactive")
                    : t("settings.smsNotConfigured")}
                </span>
              </div>

              <div>
                <Label htmlFor="sms_api_key">{t("settings.smsApiKey")}</Label>
                <Input
                  id="sms_api_key"
                  type="password"
                  autoComplete="off"
                  value={smsSettings.api_key}
                  onChange={(e) =>
                    setSmsSettings({ ...smsSettings, api_key: e.target.value })
                  }
                  placeholder={t("settings.smsApiKeyPlaceholder")}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {t("settings.smsApiKeyHelp")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sms_enabled"
                  checked={smsSettings.is_enabled}
                  onChange={(e) =>
                    setSmsSettings({ ...smsSettings, is_enabled: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="sms_enabled">{t("settings.smsEnable")}</Label>
              </div>

              <Button type="submit" disabled={updateSmsMutation.isPending || smsLoading}>
                <Save className="h-4 w-4 mr-2" />
                {updateSmsMutation.isPending ? t("settings.saving") : t("settings.saveChanges")}
              </Button>
            </form>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="backups">
        {/* Data & Database Backups */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              <span className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                Data &amp; Backups
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await backupsApi.exportOwnerJson();
                      toast.success("Portfolio backup JSON downloaded.");
                    } catch (err: any) {
                      toast.error(err?.message || "Failed to export backup.");
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Download My Data (JSON)
                </Button>
                {isSuperuser && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => createBackupMutation.mutate()}
                    disabled={createBackupMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Database className="h-4 w-4 mr-1.5" />
                    {createBackupMutation.isPending ? "Backing up..." : "Backup DB Now"}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600">
              Download a JSON backup of your houses, rooms, tenants, bills, receipts, and expenses anytime.
              {isSuperuser && " Daily automated SQLite backups (auto_db_*) are kept for 14 days and also appear in Django Admin."}
            </p>

            {isSuperuser && (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                {backupsLoading ? (
                  <div className="p-4 text-xs text-slate-500">Loading backups...</div>
                ) : !backupsData?.items?.length ? (
                  <div className="p-4 text-xs text-slate-500">No database backups found yet.</div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {backupsData.items.map((b: any) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs bg-white"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 truncate">{b.original_filename}</span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                b.is_auto
                                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {b.is_auto ? "Auto (Cron)" : b.backup_type_label || b.backup_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {b.file_size_display} • {new Date(b.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await backupsApi.download(b.id, b.original_filename);
                            } catch (err: any) {
                              toast.error(err?.message || "Failed to download backup.");
                            }
                          }}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="mobile-nav" className="max-w-2xl">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                <span className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-sky-600" />
                  Mobile Bottom Navbar
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetMobileNavDefault();
                    toast.success("Bottom navbar reset to default.");
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset Default
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600">
                Choose {MIN_MOBILE_NAV_ITEMS} to {MAX_MOBILE_NAV_ITEMS} shortcuts to show in your mobile bottom navigation bar and reorder them with the arrows. Changes apply immediately on this device.
              </p>

              {/* Selected & Ordered Items */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Visible in Bottom Bar ({mobileNavHrefs.length}/{MAX_MOBILE_NAV_ITEMS})
                </p>
                {mobileNavHrefs.map((href, idx) => {
                  const opt = ALL_MOBILE_NAV_OPTIONS.find((o) => o.href === href);
                  if (!opt) return null;
                  const Icon = opt.icon;
                  const canDisable = mobileNavHrefs.length > MIN_MOBILE_NAV_ITEMS;
                  return (
                    <div
                      key={href}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked
                          disabled={!canDisable}
                          onChange={() => toggleMobileNavItem(href)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600"
                        />
                        <Icon className="h-4 w-4 text-sky-600" />
                        <span className="font-semibold text-slate-800">{t(opt.key)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() => moveMobileNavItem(href, "up")}
                          className="h-7 w-7 p-0"
                          aria-label={`Move ${t(opt.key)} left`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={idx === mobileNavHrefs.length - 1}
                          onClick={() => moveMobileNavItem(href, "down")}
                          className="h-7 w-7 p-0"
                          aria-label={`Move ${t(opt.key)} right`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Available Hidden Items */}
              {ALL_MOBILE_NAV_OPTIONS.some((o) => !mobileNavHrefs.includes(o.href)) && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    More Pages (Available to Add)
                  </p>
                  {ALL_MOBILE_NAV_OPTIONS.filter((o) => !mobileNavHrefs.includes(o.href)).map(
                    (opt) => {
                      const Icon = opt.icon;
                      const canAdd = mobileNavHrefs.length < MAX_MOBILE_NAV_ITEMS;
                      return (
                        <label
                          key={opt.href}
                          className={`flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs ${
                            canAdd ? "cursor-pointer hover:border-sky-300" : "opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={false}
                              disabled={!canAdd}
                              onChange={() => toggleMobileNavItem(opt.href)}
                              className="h-4 w-4 rounded border-slate-300 text-sky-600"
                            />
                            <Icon className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-slate-700">{t(opt.key)}</span>
                          </div>
                          {!canAdd && (
                            <span className="text-[11px] text-slate-400">
                              Max {MAX_MOBILE_NAV_ITEMS} reached
                            </span>
                          )}
                        </label>
                      );
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="max-w-2xl">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-emerald-600" />
                System Automation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    Pending-Bill Email Reminders
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    Runs at 7:00 PM daily. Sends only to unpaid tenants not reminded within the cooldown window.
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 font-bold ${
                    emailConfig?.auto_reminder_enabled
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {emailConfig?.auto_reminder_enabled
                    ? `Active (${emailConfig?.auto_reminder_cooldown_days ?? 15}d)`
                    : "Off"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    Daily DB Backup &amp; 14-Day Cleanup
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    Creates one SQLite backup per day and auto-deletes auto-backups older than 14 days.
                    {isSuperuser && backupsData?.items?.find((b: any) => b.is_auto) && (
                      <span className="block mt-1 text-sky-700 dark:text-sky-300 font-medium">
                        Latest: {backupsData.items.find((b: any) => b.is_auto).original_filename}
                      </span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 font-bold">
                  Active (7 PM)
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    SMS Reminders (Aakash SMS)
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    Never automated — only sent when you manually click Send SMS to protect your SMS credits.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 font-bold">
                  Manual Only
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    WhatsApp Reminders
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    1-Click queue in Batch Reminders (WA tab) and Room Detail using your own WhatsApp.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 px-2.5 py-0.5 font-bold">
                  1-Click Queue
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

