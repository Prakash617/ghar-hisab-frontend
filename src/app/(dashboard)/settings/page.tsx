"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi, emailApi, smsApi } from "@/lib/api";
import { getMediaUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, MessageSquare, Save, QrCode, Upload, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "@/i18n/provider";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? t("settings.saving") : t("settings.saveChanges")}
              </Button>
            </form>
          </CardContent>
        </Card>

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
              <Button type="submit" disabled={updateEmailMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateEmailMutation.isPending ? t("settings.saving") : t("settings.saveChanges")}
              </Button>
            </form>
          </CardContent>
        </Card>
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
      </div>
    </div>
  );
}

