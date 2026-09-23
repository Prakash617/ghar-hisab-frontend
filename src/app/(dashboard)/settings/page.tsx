"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { profileApi, emailApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Save } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "@/i18n/provider";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.get(),
  });

  const { data: emailConfig, isLoading: emailLoading } = useQuery({
    queryKey: ["email-settings"],
    queryFn: () => emailApi.getSettings(),
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailMutation.mutate(emailSettings);
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
      </div>
    </div>
  );
}
