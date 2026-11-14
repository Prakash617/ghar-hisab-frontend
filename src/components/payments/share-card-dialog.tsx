"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { formatCurrency, getMediaUrl } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Download, Printer, Share2, Loader2, QrCode, MessageCircle } from "lucide-react";
import {
  buildCardPlainSummary,
  deliverImageToMessagingApp,
  renderCardCanvasBlob,
  triggerPngDownload,
} from "@/lib/share-bill";

interface ShareCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "receipt" | "bill";
  receipt?: Record<string, any> | null;
  bill?: Record<string, any> | null;
  roomLabel?: string;
  houseLabel?: string;
  tenantName?: string;
  tenantPhone?: string | null;
  portalUrl?: string;
}

export function ShareCardDialog({
  open,
  onOpenChange,
  mode,
  receipt,
  bill,
  roomLabel,
  houseLabel,
  tenantName,
  tenantPhone,
  portalUrl,
}: ShareCardDialogProps) {
  const { t } = useTranslation();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.get(),
    enabled: open,
  });

  const qrUrl = profile?.payment_qr_image_url
    ? getMediaUrl(profile.payment_qr_image_url)
    : null;
  const meterPhotoUrl = bill?.meter_photo ? getMediaUrl(bill.meter_photo) : null;

  const isReceipt = mode === "receipt" && receipt;
  const resolvedRoom =
    roomLabel || receipt?.room_name || receipt?.room_number || bill?.roomName || "";
  const resolvedHouse = houseLabel || receipt?.house_name || bill?.houseName || "";
  const resolvedTenant =
    tenantName || receipt?.tenant_name || bill?.tenant_name || "";

  const billDue = bill
    ? Math.max(
        (parseFloat(bill.amount || bill.total || "0") || 0) -
          (parseFloat(bill.total_paid || "0") || 0),
        0
      )
    : 0;

  const buildPlainSummary = () =>
    buildCardPlainSummary({
      mode,
      receipt,
      bill,
      roomLabel: resolvedRoom,
      houseLabel: resolvedHouse,
      tenantName: resolvedTenant,
      receiptTitle: t("shareCard.receiptTitle"),
      billTitle: t("shareCard.billTitle"),
      portalUrl,
    });

  const renderCanvasBlob = () =>
    renderCardCanvasBlob({
      mode,
      receipt,
      bill,
      roomLabel: resolvedRoom,
      houseLabel: resolvedHouse,
      tenantName: resolvedTenant,
      qrUrl,
      meterPhotoUrl,
    });

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const blob = await renderCanvasBlob();
      if (!blob) return;
      triggerPngDownload(
        blob,
        isReceipt
          ? `receipt_${receipt.id}.png`
          : `bill_${bill?.billing_month || "statement"}.png`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendMessaging = async (channel: "whatsapp" | "viber") => {
    setIsExporting(true);
    const summary = buildPlainSummary();
    try {
      const blob = await renderCanvasBlob();
      const result = await deliverImageToMessagingApp({
        channel,
        blob,
        filename: isReceipt
          ? `receipt-${receipt.id}.png`
          : `bill-${bill?.billing_month || "card"}.png`,
        summary,
        phone: tenantPhone,
        title: isReceipt ? `Receipt #${receipt.id}` : `Bill ${bill?.billing_month || ""}`,
      });
      if (result === "native_share") {
        toast.success(t("sendBill.sentViaNative"));
      } else if (result === "clipboard_and_link") {
        toast.success(t("sendBill.imageCopiedOpened"));
      } else if (result === "download_and_link") {
        toast.success(t("sendBill.imageDownloadedOpened"));
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainSummary());
      toast.success(t("shareCard.copied"));
    } catch {
      toast.error("Copy failed");
    }
  };

  const handlePrint = () => {
    const content = printAreaRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=520,height=720");
    if (!win) {
      window.print();
      return;
    }
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${isReceipt ? `Receipt #${receipt.id}` : `Bill ${bill?.billing_month || ""}`}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; }
            .card { max-width: 440px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; }
            img { max-width: 160px; max-height: 160px; display: block; margin: 10px auto 0; }
            @media print { body { padding: 0; } .card { border: none; } }
          </style>
        </head>
        <body>
          <div class="card">${content}</div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  if (!isReceipt && !bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReceipt ? `${t("shareCard.receiptTitle")} #${receipt.id}` : t("shareCard.billTitle")}
          </DialogTitle>
        </DialogHeader>

        {/* Preview Card */}
        <div
          ref={printAreaRef}
          className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700">GharHisab</p>
              <p className="text-sm font-bold text-slate-900">
                {isReceipt ? `${t("shareCard.receiptTitle")} #${receipt.id}` : t("shareCard.billTitle")}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {isReceipt ? receipt.received_date : bill?.billing_month}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {resolvedTenant && (
              <div className="flex justify-between">
                <span className="text-slate-500">{t("roomDetail.tenant")}:</span>
                <span className="font-semibold text-slate-900">{resolvedTenant}</span>
              </div>
            )}
            {resolvedRoom && (
              <div className="flex justify-between">
                <span className="text-slate-500">{t("payments.room")}:</span>
                <span className="font-semibold text-slate-900">
                  {resolvedRoom}
                  {resolvedHouse ? ` (${resolvedHouse})` : ""}
                </span>
              </div>
            )}
          </div>

          {isReceipt ? (
            <div className="space-y-2 border-t border-slate-200 pt-2.5 text-xs">
              <div className="flex justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm">
                <span className="font-semibold text-emerald-900">{t("payments.received")}</span>
                <span className="font-extrabold text-emerald-700">{formatCurrency(receipt.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t("roomDetail.allocated")}:</span>
                <span className="font-semibold">{formatCurrency(receipt.allocated_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t("roomDetail.unapplied")}:</span>
                <span className="font-semibold">{formatCurrency(receipt.unapplied_amount)}</span>
              </div>
              {(receipt.allocations || []).length > 0 && (
                <div className="border-t border-slate-100 pt-2 space-y-1">
                  <p className="font-semibold text-slate-700">{t("payments.allocationsBreakdown")}:</p>
                  {(receipt.allocations || []).map((a: Record<string, any>) => (
                    <div key={a.id} className="flex justify-between text-slate-600">
                      <span>{a.allocation_label}</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(a.allocated_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {receipt.remarks && (
                <p className="text-slate-500 italic">Note: {receipt.remarks}</p>
              )}
            </div>
          ) : (
            bill && (
              <div className="space-y-1.5 border-t border-slate-200 pt-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("roomDetail.rentCol")}:</span>
                  <span className="font-semibold">{formatCurrency(bill.rent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {t("dashboard.electricity")} ({bill.previous_units ?? 0} → {bill.current_units ?? 0}):
                  </span>
                  <span className="font-semibold">{formatCurrency(bill.electricity)}</span>
                </div>
                {parseFloat(bill.water || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("roomDetail.waterCol")}:</span>
                    <span className="font-semibold">{formatCurrency(bill.water)}</span>
                  </div>
                )}
                {parseFloat(bill.waste || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("roomDetail.wasteCol")}:</span>
                    <span className="font-semibold">{formatCurrency(bill.waste)}</span>
                  </div>
                )}
                {parseFloat(bill.internet || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("dashboard.internet")}:</span>
                    <span className="font-semibold">{formatCurrency(bill.internet)}</span>
                  </div>
                )}
                {parseFloat(bill.extra_charge || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{bill.extra_charge_label || t("roomDetail.extraCost")}:</span>
                    <span className="font-semibold">{formatCurrency(bill.extra_charge)}</span>
                  </div>
                )}
                <div className="flex justify-between rounded-lg bg-sky-50 px-3 py-2 text-sm mt-2">
                  <span className="font-bold text-slate-900">{t("roomDetail.netCol")}</span>
                  <span className="font-extrabold text-sky-700">
                    {formatCurrency(bill.amount || bill.total)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-slate-600">
                  <span>{t("roomDetail.paidCol")}: {formatCurrency(bill.total_paid || 0)}</span>
                  <span className="font-bold text-rose-600">
                    {t("roomDetail.dueCol")}: {formatCurrency(billDue)}
                  </span>
                </div>
              </div>
            )
          )}

          {qrUrl && (
            <div className="border-t border-slate-200 pt-3 text-center">
              <p className="text-[11px] font-semibold text-slate-600 flex items-center justify-center gap-1 mb-1.5">
                <QrCode className="h-3.5 w-3.5 text-sky-600" />
                {t("shareCard.scanToPay")}
              </p>
              <img
                src={qrUrl}
                alt="Payment QR"
                className="mx-auto h-28 w-28 rounded-lg border border-slate-200 object-contain bg-white p-1"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            onClick={() => handleSendMessaging("whatsapp")}
            disabled={isExporting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isExporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Share2 className="mr-1.5 h-4 w-4" />}
            {t("shareCard.shareWhatsApp")}
          </Button>
          <Button
            type="button"
            onClick={() => handleSendMessaging("viber")}
            disabled={isExporting}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isExporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-1.5 h-4 w-4" />}
            {t("shareCard.shareViber")}
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadPng} disabled={isExporting}>
            <Download className="mr-1.5 h-4 w-4" />
            {t("shareCard.downloadPng")}
          </Button>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="mr-1.5 h-4 w-4" />
            {t("shareCard.printPdf")}
          </Button>
          <Button type="button" variant="outline" onClick={handleCopyText} className="col-span-2">
            <Copy className="mr-1.5 h-4 w-4" />
            {t("shareCard.copyText")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
