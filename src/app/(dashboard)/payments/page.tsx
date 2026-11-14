"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentsApi, receiptsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { ReceiptHistoryPanel } from "@/components/payments/receipt-history-panel";
import {
  CreditCard,
  Search,
  Banknote,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n/provider";

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"receipts" | "bills">("receipts");
  const [search, setSearch] = useState("");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [receiptStatus, setReceiptStatus] = useState("");
  const [receiptPage, setReceiptPage] = useState(1);
  const { t } = useTranslation();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentsApi.list(),
  });

  const { data: receiptsData, isLoading: receiptsLoading } = useQuery({
    queryKey: ["receipts", receiptSearch, receiptStatus, receiptPage],
    queryFn: () =>
      receiptsApi.list({
        search: receiptSearch || undefined,
        status: receiptStatus || undefined,
        page: receiptPage,
        page_size: 20,
      }),
  });

  const receiptSummary = receiptsData?.summary || {
    total_count: 0,
    total_received: "0.00",
    total_allocated: "0.00",
    total_unapplied: "0.00",
  };
  const receiptItems = receiptsData?.items || [];
  const receiptTotalPages = receiptsData?.total_pages || 1;

  const filteredPayments = payments?.filter(
    (payment: any) =>
      payment.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      payment.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      payment.roomName?.toLowerCase().includes(search.toLowerCase()) ||
      payment.billing_month?.toLowerCase().includes(search.toLowerCase()) ||
      payment.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeTab === "receipts" ? t("payments.receiveHistoryTitle") : t("payments.title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {activeTab === "receipts" ? t("payments.receiveHistorySubtitle") : t("payments.subtitle")}
          </p>
        </div>

        {/* Section Switcher: Receive History vs Bills Ledger */}
        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1 shadow-inner self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("receipts")}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === "receipts"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Banknote className="h-4 w-4 text-emerald-600" />
            <span>{t("payments.receiveHistoryTab")}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
              {receiptSummary.total_count || 0}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bills")}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === "bills"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4 text-sky-600" />
            <span>{t("payments.billsTab")}</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {payments?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {activeTab === "receipts" ? (
        <div className="space-y-4">
          {/* Receive History Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="stat-card p-3.5">
              <p className="section-header">{t("payments.totalReceipts")}</p>
              <p className="mt-1 font-display text-xl font-bold text-slate-900 tabular-nums">
                {receiptSummary.total_count}
              </p>
            </div>
            <div className="stat-card p-3.5">
              <p className="section-header">{t("payments.totalReceived")}</p>
              <p className="mt-1 font-display text-xl font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                {formatCurrency(receiptSummary.total_received)}
              </p>
            </div>
            <div className="stat-card p-3.5">
              <p className="section-header">{t("payments.totalAllocated")}</p>
              <p className="mt-1 font-display text-xl font-bold text-sky-700 tabular-nums whitespace-nowrap">
                {formatCurrency(receiptSummary.total_allocated)}
              </p>
            </div>
            <div className="stat-card p-3.5">
              <p className="section-header">{t("payments.totalUnapplied")}</p>
              <p className="mt-1 font-display text-xl font-bold text-amber-700 tabular-nums whitespace-nowrap">
                {formatCurrency(receiptSummary.total_unapplied)}
              </p>
            </div>
          </div>

          {/* Search & Allocation Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t("payments.searchReceiptsPlaceholder")}
                value={receiptSearch}
                onChange={(e) => {
                  setReceiptSearch(e.target.value);
                  setReceiptPage(1);
                }}
                className="min-h-11 sm:min-h-10 pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 w-full text-sm shadow-2xs"
              />
            </div>

            <div className="flex min-h-11 sm:min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={receiptStatus}
                onChange={(e) => {
                  setReceiptStatus(e.target.value);
                  setReceiptPage(1);
                }}
                className="w-full bg-transparent outline-none cursor-pointer"
              >
                <option value="">{t("payments.allStatuses")}</option>
                <option value="allocated">{t("payments.fullyAllocated")}</option>
                <option value="unapplied">{t("payments.hasUnapplied")}</option>
              </select>
            </div>
          </div>

          <ReceiptHistoryPanel
            receipts={receiptItems}
            isLoading={receiptsLoading}
            showRoomInfo
          />

          {/* Pagination */}
          {receiptTotalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-medium text-slate-600">
                {t("common.page")} {receiptPage} / {receiptTotalPages}
              </span>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  disabled={receiptPage <= 1}
                  onClick={() => setReceiptPage((p) => Math.max(1, p - 1))}
                  className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("common.previous")}
                </button>
                <button
                  type="button"
                  disabled={receiptPage >= receiptTotalPages}
                  onClick={() => setReceiptPage((p) => Math.min(receiptTotalPages, p + 1))}
                  className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  {t("common.next")}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("payments.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-11 sm:min-h-9 pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 w-full text-sm shadow-2xs"
            />
          </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredPayments?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("payments.noPayments")}</h3>
            <p className="text-sm text-slate-500">
              {search ? t("common.noData") : t("payments.noPaymentsDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Payment Cards */}
          <div className="md:hidden space-y-3">
            {filteredPayments?.map((payment: any) => {
              const due = payment.due_amount ?? Math.max(0, Number(payment.total || 0) - Number(payment.total_paid || 0));
              return (
                <article
                  key={payment.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900 truncate">
                        {payment.roomName || `${t("rooms.room")} ${payment.room_number}`}
                      </h2>
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 mt-0.5">
                        <span>{payment.tenant_name || "-"}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-700">{payment.billing_month || "-"}</span>
                        {payment.is_meter_reset && (
                          <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">
                            {t("payments.resetMeter")}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === "Paid" ? t("dashboard.paid") : payment.status === "Partially Paid" ? t("dashboard.partiallyPaid") : t("dashboard.unpaid")}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-xs">
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-slate-600 block">{t("payments.totalBill")}</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(payment.total || payment.amount)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-emerald-700 block">{t("payments.paid")}</span>
                      <span className="font-bold text-emerald-700 tabular-nums">{formatCurrency(payment.total_paid || 0)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-rose-600 block">{t("payments.due")}</span>
                      <span className="font-bold text-rose-600 tabular-nums">{formatCurrency(due)}</span>
                    </div>
                  </div>

                  {parseFloat(payment.extra_charge || "0") > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-amber-50/70 border border-amber-200/70 px-3 py-1.5 text-xs">
                      <span className="text-amber-800 font-medium truncate">
                        {payment.extra_charge_label || t("roomDetail.extraCost")}
                      </span>
                      <span className="font-bold text-amber-800 tabular-nums shrink-0 ml-2">
                        {formatCurrency(payment.extra_charge)}
                      </span>
                    </div>
                  )}

                  <Link
                    href={`/rooms/${payment.roomId || payment.room}`}
                    className="flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-50 text-xs font-semibold text-sky-700 hover:bg-sky-100 active:scale-[0.99] transition"
                  >
                    {t("payments.viewRoom")}
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Desktop Payments Table */}
          <Card className="hidden md:block">
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("payments.room")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("payments.month")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("payments.tenant")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t("payments.status")}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t("payments.totalBill")}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t("payments.paid")}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t("payments.due")}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t("payments.action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments?.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {payment.roomName || `${t("rooms.room")} ${payment.room_number}`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span>{payment.billing_month || "-"}</span>
                            {payment.is_meter_reset && (
                              <span
                                className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300"
                                title={payment.meter_reset_reason || "Meter Reset / Replaced"}
                              >
                                {t("payments.resetMeter")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {payment.tenant_name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status === "Paid" ? t("dashboard.paid") : payment.status === "Partially Paid" ? t("dashboard.partiallyPaid") : t("dashboard.unpaid")}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-gray-900 tabular-nums">
                          {formatCurrency(payment.total || payment.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-emerald-600 font-medium tabular-nums">
                          {formatCurrency(payment.total_paid || 0)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-rose-600 font-bold tabular-nums">
                          {formatCurrency(payment.due_amount || (Number(payment.total || 0) - Number(payment.total_paid || 0)))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          <Link
                            href={`/rooms/${payment.roomId || payment.room}`}
                            className="inline-flex items-center text-xs font-semibold text-sky-600 hover:text-sky-800 hover:underline"
                          >
                            {t("payments.viewRoom")}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
        </div>
      )}
    </div>
  );
}
