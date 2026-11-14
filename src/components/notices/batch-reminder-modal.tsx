"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { batchRemindersApi, housesApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Mail, MessageSquare, Send, AlertCircle } from "lucide-react";

interface BatchReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHouseId?: string;
}

export function BatchReminderModal({
  open,
  onOpenChange,
  initialHouseId = "all",
}: BatchReminderModalProps) {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();

  const [houseId, setHouseId] = useState<string>(initialHouseId);
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [language, setLanguage] = useState<"ne" | "en">(locale === "ne" ? "ne" : "en");
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      setHouseId(initialHouseId || "all");
    }
  }, [open, initialHouseId]);

  const { data: houses = [] } = useQuery({
    queryKey: ["houses"],
    queryFn: () => housesApi.list(),
    enabled: open,
  });

  const { data: preview, isLoading } = useQuery({
    queryKey: ["batch-reminders-preview", houseId],
    queryFn: () => batchRemindersApi.preview(houseId === "all" ? undefined : houseId),
    enabled: open,
  });

  const items: Array<Record<string, any>> = preview?.items || [];

  useEffect(() => {
    const eligible = (preview?.items || [])
      .filter((item: Record<string, any>) =>
        channel === "email" ? item.can_email : item.can_sms
      )
      .map((item: Record<string, any>) => item.room_id as number);
    setSelectedRoomIds(eligible);
  }, [preview, channel]);

  const sendMutation = useMutation({
    mutationFn: () =>
      batchRemindersApi.send({
        channel,
        language,
        house_id: houseId === "all" ? undefined : houseId,
        room_ids: selectedRoomIds,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["email-history"] });
      toast.success(
        `Sent: ${res.sent_count}, Skipped: ${res.skipped_count}${
          res.failed_count ? `, Failed: ${res.failed_count}` : ""
        }`
      );
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send batch reminders.");
    },
  });

  const toggleRoom = (roomId: number) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("batchNotice.title")}</DialogTitle>
          <p className="text-xs text-slate-500">{t("batchNotice.subtitle")}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-600">{t("roomDetail.house")}</label>
              <select
                value={houseId}
                onChange={(e) => setHouseId(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800"
              >
                <option value="all">{t("common.all")}</option>
                {houses.map((h: Record<string, any>) => (
                  <option key={h.id} value={String(h.id)}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">{t("batchNotice.channel")}</label>
              <div className="mt-1 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setChannel("email")}
                  className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold ${
                    channel === "email" ? "bg-sky-600 text-white" : "text-slate-600"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("sms")}
                  className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold ${
                    channel === "sms" ? "bg-sky-600 text-white" : "text-slate-600"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  SMS
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">{t("batchNotice.language")}</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "ne" | "en")}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800"
              >
                <option value="ne">नेपाली (Nepali)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {channel === "sms" && preview && !preview.sms_configured && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Aakash SMS API key is not configured in Settings yet.</span>
            </div>
          )}

          {/* Summary Strip */}
          {preview && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs">
              <span>
                {t("batchNotice.dueRooms")}: <strong>{preview.total_due_rooms}</strong>
              </span>
              <span>
                {t("batchNotice.totalDue")}:{" "}
                <strong className="text-rose-600">{formatCurrency(preview.total_due_amount)}</strong>
              </span>
            </div>
          )}

          {/* Rooms checklist */}
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-sky-600" />
              {t("common.loading")}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              <CheckCircle2 className="h-7 w-7 mx-auto mb-1.5 text-emerald-500" />
              {t("batchNotice.noDueRooms")}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {items.map((item) => {
                const canSend = channel === "email" ? item.can_email : item.can_sms;
                const checked = selectedRoomIds.includes(item.room_id);
                const target = channel === "email" ? item.email : item.contact;
                return (
                  <label
                    key={item.room_id}
                    className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 text-xs cursor-pointer ${
                      canSend
                        ? "border-slate-200 bg-white hover:border-sky-300"
                        : "border-slate-100 bg-slate-50 opacity-65 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!canSend}
                        onChange={() => canSend && toggleRoom(item.room_id)}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {item.room_name || item.room_number} · {item.house_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.tenant_name} ·{" "}
                          {target || <span className="text-rose-500">{t("batchNotice.missingContact")}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-rose-600">{formatCurrency(item.due_amount)}</p>
                      <p className="text-[11px] text-slate-500">{item.pending_bills_count} bill(s)</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending || selectedRoomIds.length === 0}
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  {t("batchNotice.sending")}
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  {t("batchNotice.sendAll").replace("{count}", String(selectedRoomIds.length))}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
