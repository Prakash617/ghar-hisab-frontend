"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { formatCurrency, getMediaUrl } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildCardPlainSummary,
  deliverImageToMessagingApp,
  renderCardCanvasBlob,
  triggerPngDownload,
} from "@/lib/share-bill";
import {
  Download,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  Share2,
  AlertTriangle,
} from "lucide-react";

type SendChannel = "email" | "whatsapp" | "viber";

interface SendBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Record<string, any> | null;
  roomLabel?: string;
  houseLabel?: string;
  tenantName?: string;
  tenantEmail?: string | null;
  tenantPhone?: string | null;
  portalUrl?: string;
  isSendingEmail?: boolean;
  onSendEmail: (paymentId: number) => void;
}

export function SendBillDialog({
  open,
  onOpenChange,
  bill,
  roomLabel,
  houseLabel,
  tenantName,
  tenantEmail,
  tenantPhone,
  portalUrl,
  isSendingEmail = false,
  onSendEmail,
}: SendBillDialogProps) {
  const { t } = useTranslation();
  const [channel, setChannel] = useState<SendChannel>("email");
  const [extraNote, setExtraNote] = useState("");
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [isSendingMessaging, setIsSendingMessaging] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.get(),
    enabled: open,
  });

  const qrUrl = profile?.payment_qr_image_url
    ? getMediaUrl(profile.payment_qr_image_url)
    : null;
  const meterPhotoUrl = bill?.meter_photo ? getMediaUrl(bill.meter_photo) : null;

  // Always reset to Email (Default) when opening for a bill.
  useEffect(() => {
    if (open) {
      setChannel("email");
      setExtraNote("");
    }
  }, [open, bill?.id]);

  // Pre-render the Bill Image PNG when viewing WhatsApp or Viber channel.
  useEffect(() => {
    if (!open || !bill || channel === "email") return;

    let cancelled = false;
    let objectUrl = "";
    setIsRendering(true);

    renderCardCanvasBlob({
      mode: "bill",
      bill,
      roomLabel,
      houseLabel,
      tenantName,
      qrUrl,
      meterPhotoUrl,
    })
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewBlob(blob);
        setPreviewUrl(objectUrl);
      })
      .finally(() => {
        if (!cancelled) setIsRendering(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setPreviewBlob(null);
      setPreviewUrl("");
    };
  }, [open, bill, channel, roomLabel, houseLabel, tenantName, qrUrl, meterPhotoUrl]);

  if (!bill) return null;

  const billTotal = Number(bill.total ?? bill.amount ?? 0);
  const billPaid = Number(bill.total_paid ?? 0);
  const billDue = Math.max(billTotal - billPaid, 0);

  const handleSendMessaging = async (target: "whatsapp" | "viber") => {
    setIsSendingMessaging(true);
    try {
      const blob =
        previewBlob ||
        (await renderCardCanvasBlob({
          mode: "bill",
          bill,
          roomLabel,
          houseLabel,
          tenantName,
          qrUrl,
          meterPhotoUrl,
        }));

      const summary = buildCardPlainSummary({
        mode: "bill",
        bill,
        roomLabel,
        houseLabel,
        tenantName,
        billTitle: t("shareCard.billTitle"),
        portalUrl,
        extraNote,
      });

      const result = await deliverImageToMessagingApp({
        channel: target,
        blob,
        filename: `bill_${bill.billing_month || "statement"}.png`,
        summary,
        phone: tenantPhone,
        title: `Bill ${bill.billing_month || ""}`,
      });

      if (result === "native_share") {
        toast.success(t("sendBill.sentViaNative"));
      } else if (result === "clipboard_and_link") {
        toast.success(t("sendBill.imageCopiedOpened"));
      } else if (result === "download_and_link") {
        toast.success(t("sendBill.imageDownloadedOpened"));
      }
    } finally {
      setIsSendingMessaging(false);
    }
  };

  const handleDownloadImage = async () => {
    const blob =
      previewBlob ||
      (await renderCardCanvasBlob({
        mode: "bill",
        bill,
        roomLabel,
        houseLabel,
        tenantName,
        qrUrl,
        meterPhotoUrl,
      }));
    if (!blob) return;
    triggerPngDownload(blob, `bill_${bill.billing_month || "statement"}.png`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-sky-600" />
            <span>
              {t("sendBill.title")} — {bill.billing_month}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Channel Switcher: Email is Default */}
        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setChannel("email")}
            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition cursor-pointer ${
              channel === "email"
                ? "bg-white text-sky-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span>{t("sendBill.channelEmail")}</span>
            <span className="hidden sm:inline rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
              {t("sendBill.defaultBadge")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setChannel("whatsapp")}
            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition cursor-pointer ${
              channel === "whatsapp"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Share2 className="h-3.5 w-3.5 shrink-0" />
            <span>{t("sendBill.channelWhatsApp")}</span>
          </button>

          <button
            type="button"
            onClick={() => setChannel("viber")}
            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition cursor-pointer ${
              channel === "viber"
                ? "bg-white text-violet-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{t("sendBill.channelViber")}</span>
          </button>
        </div>

        {channel === "email" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">
                  {t("sendBill.recipientEmail")}
                </span>
                <span className="font-bold text-slate-900">
                  {tenantEmail || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-600">{t("roomDetail.netCol")}</span>
                <span className="font-bold text-slate-900">{formatCurrency(billTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t("roomDetail.paidCol")}</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(billPaid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t("roomDetail.dueCol")}</span>
                <span className="font-bold text-rose-700">{formatCurrency(billDue)}</span>
              </div>
            </div>

            {!tenantEmail ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs font-medium text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{t("sendBill.missingEmail")}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500">{t("sendBill.emailNote")}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                disabled={!tenantEmail || bill.status === "Paid" || isSendingEmail}
                onClick={() => onSendEmail(bill.id)}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {isSendingEmail ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-1.5 h-4 w-4" />
                )}
                {isSendingEmail ? t("sendBill.sendingEmail") : t("sendBill.sendViaEmail")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs">
              <span className="font-semibold text-slate-600">
                {t("sendBill.recipientPhone")}
              </span>
              <span className="font-bold text-slate-900">
                {tenantPhone || t("sendBill.missingPhone")}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5">
                {t("sendBill.imagePreview")}
              </p>
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 min-h-40 max-h-72 overflow-auto">
                {isRendering ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-8">
                    <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                    <span>{t("sendBill.renderingImage")}</span>
                  </div>
                ) : previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt={t("sendBill.imagePreview")}
                    className="max-h-64 w-auto rounded-lg shadow-xs border border-slate-200"
                  />
                ) : null}
              </div>
            </div>

            <div>
              <Label htmlFor="send-bill-note" className="text-xs">
                {t("sendBill.optionalNote")}
              </Label>
              <Input
                id="send-bill-note"
                value={extraNote}
                onChange={(e) => setExtraNote(e.target.value)}
                placeholder={t("sendBill.optionalNotePlaceholder")}
                className="mt-1 text-xs"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={handleDownloadImage}>
                <Download className="mr-1.5 h-4 w-4" />
                {t("shareCard.downloadPng")}
              </Button>
              {channel === "whatsapp" ? (
                <Button
                  type="button"
                  disabled={isSendingMessaging || isRendering}
                  onClick={() => handleSendMessaging("whatsapp")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSendingMessaging ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Share2 className="mr-1.5 h-4 w-4" />
                  )}
                  {t("sendBill.sendViaWhatsApp")}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSendingMessaging || isRendering}
                  onClick={() => handleSendMessaging("viber")}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isSendingMessaging ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                  )}
                  {t("sendBill.sendViaViber")}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
