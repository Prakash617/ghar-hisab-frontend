"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Mail, CheckCircle, Trash2, X, Send } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "@/i18n/provider";
import { BatchReminderModal } from "@/components/notices/batch-reminder-modal";

function EmailHistoryContent() {
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get("room_id");
  const roomId = roomIdParam ? parseInt(roomIdParam) : undefined;
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [isBatchOpen, setIsBatchOpen] = useState(false);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("emails.title")}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{t("emails.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsBatchOpen(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-sky-700 active:scale-95 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>{t("batchNotice.buttonLabel")}</span>
          </button>
          {roomId && (
            <Link
              href="/emails"
              className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-2 rounded-xl hover:bg-sky-100"
            >
              {t("emails.filteredByRoom")} #{roomId} <X className="h-3.5 w-3.5" /> {t("emails.clearFilter")}
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : emailList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("emails.noEmails")}</h3>
            <p className="text-sm text-slate-500">{t("emails.noEmailsDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Email History Cards */}
          <div className="md:hidden space-y-3">
            {emailList.map((email: any) => (
              <article
                key={email.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900 truncate">
                      {email.room_name || `${t("rooms.room")} ${email.room_number || email.room}`}
                    </h2>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {email.recipient_name || email.tenant_name || "-"} · {email.recipient_email}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(email.id)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition cursor-pointer"
                    title={t("emails.deleteLog")}
                    aria-label={t("emails.deleteLog")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm font-medium text-slate-800 line-clamp-2">{email.subject}</p>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${email.email_type === "pending" ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-700"}`}>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    {email.email_type === "pending" ? (t("roomDetail.messageLanguage") === "Message Language" ? "Pending notice" : "बाँकी सूचना") : (t("roomDetail.messageLanguage") === "Message Language" ? "Single bill" : "मासिक बिल")}
                  </span>
                  <span className="text-xs text-slate-600">{formatDateTime(email.sent_at)}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop Email History Table */}
          <Card className="hidden md:block">
            <CardContent>
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
                            className="inline-flex items-center rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
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
            </CardContent>
          </Card>
        </>
      )}

      <BatchReminderModal open={isBatchOpen} onOpenChange={setIsBatchOpen} />
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
