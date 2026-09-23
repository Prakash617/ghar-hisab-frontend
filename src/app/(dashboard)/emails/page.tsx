"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Mail, CheckCircle, Trash2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "@/i18n/provider";

function EmailHistoryContent() {
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get("room_id");
  const roomId = roomIdParam ? parseInt(roomIdParam) : undefined;
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["email-history", roomId],
    queryFn: () => emailApi.getHistory(roomId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => emailApi.deleteHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-history"] });
      toast.success(t("emails.deleteLog") + " " + t("common.delete"));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete email log.");
    },
  });

  const emailList: any[] = Array.isArray(data) ? data : data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("emails.title")}</h1>
          <p className="text-sm text-slate-500">{t("emails.subtitle")}</p>
        </div>
        {roomId && (
          <Link
            href="/emails"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-md hover:bg-sky-100"
          >
            {t("emails.filteredByRoom")} #{roomId} <X className="h-3 w-3" /> {t("emails.clearFilter")}
          </Link>
        )}
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : emailList.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("emails.noEmails")}</h3>
              <p className="text-gray-500">{t("emails.noEmailsDesc")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("emails.room")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("emails.recipient")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("emails.email")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("emails.subject")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("emails.type")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t("emails.sentAt")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {t("emails.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emailList.map((email: any) => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {email.room_name || `${t("rooms.room")} ${email.room_number || email.room}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {email.recipient_name || email.tenant_name || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {email.recipient_email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate font-medium">
                        {email.subject}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${email.email_type === "pending" ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-700"}`}>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          {email.email_type === "pending" ? (t("roomDetail.messageLanguage") === "Message Language" ? "Pending notice" : "बाँकी सूचना") : (t("roomDetail.messageLanguage") === "Message Language" ? "Single bill" : "मासिक बिल")}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(email.sent_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => deleteMutation.mutate(email.id)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title={t("emails.deleteLog")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

export default function EmailsPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="p-6">{t("emails.loadingHistory")}</div>}>
      <EmailHistoryContent />
    </Suspense>
  );
}
