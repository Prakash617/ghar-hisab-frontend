"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { getStatusColor } from "@/lib/utils";
import { useTranslation } from "@/i18n/provider";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentsApi.list(),
  });

  const filteredPayments = payments?.filter(
    (payment: any) =>
      payment.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      payment.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      payment.roomName?.toLowerCase().includes(search.toLowerCase()) ||
      payment.billing_month?.toLowerCase().includes(search.toLowerCase()) ||
      payment.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("payments.title")}</h1>
          <p className="text-sm text-slate-500">{t("payments.subtitle")}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("payments.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-72 text-sm"
          />
        </div>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredPayments?.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("payments.noPayments")}</h3>
              <p className="text-gray-500">
                {search ? t("common.noData") : t("payments.noPaymentsDesc")}
              </p>
            </div>
          ) : (
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
                              className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300"
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
                        {formatCurrency(payment.total || payment.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-emerald-600 font-medium">
                        {formatCurrency(payment.total_paid || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-rose-600 font-bold">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
