"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tenantPortalApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { formatCurrency, getMediaUrl } from "@/lib/utils";
import { BrandMark } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Banknote,
  Camera,
  CheckCircle2,
  FileText,
  Home,
  Loader2,
  QrCode,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function TenantPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { t } = useTranslation();

  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tenant-portal", token],
    queryFn: () => tenantPortalApi.getPublicPortal(token),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600 mx-auto" />
          <p className="text-sm font-medium text-slate-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <BrandMark className="h-12 w-12 mb-4" />
        <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
        <h1 className="text-lg font-bold text-slate-900">{t("portal.notFoundTitle")}</h1>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{t("portal.notFoundDesc")}</p>
      </div>
    );
  }

  const { tenant, room, landlord, summary, bills = [], receipts = [] } = data;
  const qrUrl = landlord?.payment_qr_url ? getMediaUrl(landlord.payment_qr_url) : "";
  const pendingAmt = parseFloat(summary?.total_pending || "0");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2 min-w-0">
            <BrandMark className="h-8 w-8 rounded-xl" />
            <div className="min-w-0">
              <p className="font-display text-sm font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                Ghar <span className="text-sky-600 dark:text-sky-400">Hisaab</span>
              </p>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {t("portal.readOnlyBadge")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle className="h-9 w-9" />
            <LanguageSwitcher compact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 pt-5">
        {/* Tenant & Room Identity Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                <Home className="h-3.5 w-3.5" />
                {room.house_name} · #{room.room_number}
                {room.room_name ? ` (${room.room_name})` : ""}
              </span>
              <h1 className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                {tenant.name}
              </h1>
              <p className="text-xs text-slate-500">
                {t("roomDetail.moveInDate")}: {tenant.move_in_date || "-"} · {landlord?.name}
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-2.5 text-right ${
                pendingAmt > 0
                  ? "border-rose-200 bg-rose-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {t("roomDetail.totalPending")}
              </p>
              <p
                className={`font-display text-2xl font-extrabold tabular-nums ${
                  pendingAmt > 0 ? "text-rose-700" : "text-emerald-700"
                }`}
              >
                {formatCurrency(summary.total_pending || "0")}
              </p>
            </div>
          </div>

          {!tenant.is_active && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              {t("portal.movedOutBanner")}: {tenant.moved_out_date || "-"}
            </div>
          )}

          {/* Quick Info Row */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
              <span className="text-slate-500">{t("roomDetail.monthlyRent")}</span>
              <p className="font-bold text-slate-900 mt-0.5 tabular-nums">
                {formatCurrency(tenant.rent_price || "0")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
              <span className="text-slate-500">{t("moveOut.securityDeposit")}</span>
              <p className="font-bold text-emerald-700 mt-0.5 tabular-nums">
                {formatCurrency(tenant.security_deposit || "0")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
              <span className="text-slate-500">{t("dashboard.unpaid")}</span>
              <p className="font-bold text-rose-700 mt-0.5 tabular-nums">
                {(summary?.unpaid_count || 0) + (summary?.partial_count || 0)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
              <span className="text-slate-500">{t("moveOut.advanceCredit")}</span>
              <p className="font-bold text-sky-700 mt-0.5 tabular-nums">
                {formatCurrency(summary?.total_unapplied_credit || "0")}
              </p>
            </div>
          </div>
        </div>

        {/* Landlord Payment QR Card */}
        {qrUrl && (
          <div className="rounded-2xl border border-sky-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">
                <QrCode className="h-4 w-4" />
                {t("portal.payNowTitle")}
              </div>
              <p className="text-sm font-semibold text-slate-900">{landlord?.name}</p>
              <p className="text-xs text-slate-500">{t("portal.scanQrHint")}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="self-start sm:self-center rounded-xl border border-slate-200 bg-white p-2 shadow-xs hover:border-sky-300 transition cursor-pointer"
              title="Tap to enlarge QR"
            >
              <img
                src={qrUrl}
                alt="Landlord Payment QR"
                className="h-24 w-24 rounded-lg object-contain"
              />
            </button>
          </div>
        )}

        {/* Monthly Bills List */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-600" />
            <h2 className="font-display text-base font-bold text-slate-900">
              {t("portal.billsTitle")} ({bills.length})
            </h2>
          </div>

          {bills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              {t("roomDetail.noBillingHistory")}
            </div>
          ) : (
            <div className="space-y-2.5">
              {bills.map((bill: any) => {
                const meterPhotoUrl = bill.meter_photo ? getMediaUrl(bill.meter_photo) : "";
                return (
                  <div
                    key={bill.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-base font-bold text-slate-900">
                          {bill.billing_month}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <span>
                            {bill.previous_units} → {bill.current_units} (
                            {Math.max(0, Number(bill.current_units) - Number(bill.previous_units))}{" "}
                            {t("roomDetail.units")})
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            bill.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : bill.status === "Partially Paid"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {bill.status === "Paid" && <CheckCircle2 className="h-3 w-3" />}
                          {bill.status}
                        </span>
                        <p className="mt-1 font-display text-base font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(bill.total || "0")}
                        </p>
                        {parseFloat(bill.due_amount || "0") > 0 && (
                          <p className="text-xs font-semibold text-rose-600 tabular-nums">
                            Due: {formatCurrency(bill.due_amount)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-[11px] text-slate-600 bg-slate-50 rounded-xl p-2.5">
                      <div>
                        <span className="block text-slate-400">{t("roomDetail.rentCol")}</span>
                        <strong className="text-slate-800">{formatCurrency(bill.rent || "0")}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">{t("dashboard.electricity")}</span>
                        <strong className="text-slate-800">{formatCurrency(bill.electricity || "0")}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">{t("roomDetail.waterCol")}</span>
                        <strong className="text-slate-800">{formatCurrency(bill.water || "0")}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">{t("roomDetail.wasteCol")}</span>
                        <strong className="text-slate-800">{formatCurrency(bill.waste || "0")}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">{t("dashboard.internet")}</span>
                        <strong className="text-slate-800">{formatCurrency(bill.internet || "0")}</strong>
                      </div>
                    </div>

                    {(Number(bill.extra_charge || 0) > 0 || bill.remarks || meterPhotoUrl) && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <div className="space-y-0.5 text-slate-600">
                          {Number(bill.extra_charge || 0) > 0 && (
                            <p className="font-medium text-amber-700">
                              + {bill.extra_charge_label || t("roomDetail.extraCost")}:{" "}
                              {formatCurrency(bill.extra_charge)}
                            </p>
                          )}
                          {bill.remarks && <p className="text-slate-500">{bill.remarks}</p>}
                        </div>

                        {meterPhotoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPhoto({
                                url: meterPhotoUrl,
                                title: `${bill.billing_month} · ${bill.previous_units} → ${bill.current_units}`,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 cursor-pointer"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            <span>{t("meterPhoto.viewProof")}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Payment Receipts History */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-emerald-600" />
            <h2 className="font-display text-base font-bold text-slate-900">
              {t("portal.receiptsTitle")} ({receipts.length})
            </h2>
          </div>

          {receipts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              {t("payments.noReceipts")}
            </div>
          ) : (
            <div className="space-y-2">
              {receipts.map((r: any) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      Receipt #{r.id} · {r.received_date}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {r.remarks || t("payments.allocated")}
                    </p>
                  </div>
                  <p className="font-display text-base font-extrabold text-emerald-700 tabular-nums shrink-0">
                    {formatCurrency(r.amount || "0")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="pt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Verified Read-Only Ledger · Ghar Hisaab</span>
        </footer>
      </main>

      {/* Meter Photo Lightbox */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewPhoto?.title || t("meterPhoto.modalTitle")}</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="space-y-3">
              <img
                src={previewPhoto.url}
                alt="Sub-meter reading proof"
                className="w-full max-h-[70vh] rounded-xl object-contain bg-slate-100"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment QR Lightbox */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("portal.payNowTitle")}</DialogTitle>
          </DialogHeader>
          {qrUrl && (
            <div className="text-center space-y-2">
              <img
                src={qrUrl}
                alt="Payment QR"
                className="mx-auto w-64 h-64 rounded-xl border border-slate-200 object-contain bg-white p-2"
              />
              <p className="text-xs text-slate-500">{t("portal.scanQrHint")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
