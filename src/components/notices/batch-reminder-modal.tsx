"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { batchRemindersApi, housesApi } from "@/lib/api";
import { formatMessagingPhone } from "@/lib/share-bill";
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
  const [channel, setChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [language, setLanguage] = useState<"ne" | "en">(locale === "ne" ? "ne" : "en");
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [whatsappSentIds, setWhatsappSentIds] = useState<number[]>([]);
  const [waQueueOrder, setWaQueueOrder] = useState<number[]>([]);
  const [waQueuePos, setWaQueuePos] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setHouseId(initialHouseId || "all");
      setWaQueueOrder([]);
      setWaQueuePos(0);
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
        channel === "email"
          ? item.can_email
          : channel === "sms"
            ? item.can_sms
            : item.can_whatsapp
      )
      .map((item: Record<string, any>) => item.room_id as number);
    setSelectedRoomIds(eligible);
  }, [preview, channel]);

  const handleSendSingleWhatsapp = (item: Record<string, any>) => {
    const digits = formatMessagingPhone(item.contact);
    if (!digits) {
      toast.error("Valid tenant phone number is missing.");
      return;
    }
    const baseMsg =
      language === "ne" ? item.whatsapp_message_ne : item.whatsapp_message_en;
    const portalUrl =
      item.portal_token && typeof window !== "undefined"
        ? `${window.location.origin}/portal/${item.portal_token}`
        : "";
    const text = [
      baseMsg,
      portalUrl ? `\nView online bill & QR: ${portalUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setWhatsappSentIds((prev) =>
      prev.includes(item.room_id) ? prev : [...prev, item.room_id]
    );
  };

  const selectedWaItems = items.filter(
    (item) => item.can_whatsapp && selectedRoomIds.includes(item.room_id)
  );
  const inWaQueue = channel === "whatsapp" && waQueueOrder.length > 0;
  const waQueueDone = inWaQueue && waQueuePos >= waQueueOrder.length;
  const nextWaRoomId = inWaQueue && !waQueueDone ? waQueueOrder[waQueuePos] : null;
  const nextWaItem = nextWaRoomId
    ? items.find((i) => i.room_id === nextWaRoomId)
    : null;

  const startWaQueue = () => {
    if (selectedWaItems.length === 0) return;
    const order = selectedWaItems.map((i) => i.room_id as number);
    setWaQueueOrder(order);
    handleSendSingleWhatsapp(selectedWaItems[0]);
    setWaQueuePos(1);
  };

  const advanceWaQueue = () => {
    if (!nextWaItem) return;
    handleSendSingleWhatsapp(nextWaItem);
    setWaQueuePos((p) => p + 1);
  };

  const sendMutation = useMutation({
    mutationFn: () =>
      batchRemindersApi.send({
        channel: channel === "sms" ? "sms" : "email",
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Notify due rooms via Email, SMS, or WhatsApp.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_1fr] gap-2.5 items-end">
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("batchNotice.channel")}</label>
              <div className="mt-1 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800/70">
                <button
                  type="button"
                  onClick={() => setChannel("email")}
                  className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    channel === "email"
                      ? "bg-sky-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("sms")}
                  className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    channel === "sms"
                      ? "bg-sky-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span>SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("whatsapp")}
                  className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    channel === "whatsapp"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Send className="h-3.5 w-3.5 shrink-0" />
                  <span>WA</span>
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
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1.5">
              {items.map((item) => {
                const canSend =
                  channel === "email"
                    ? item.can_email
                    : channel === "sms"
                      ? item.can_sms
                      : item.can_whatsapp;
                const checked = selectedRoomIds.includes(item.room_id);
                const target = channel === "email" ? item.email : item.contact;
                const waSent = whatsappSentIds.includes(item.room_id);

                if (channel === "whatsapp") {
                  return (
                    <div
                      key={item.room_id}
                      className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 text-xs ${
                        canSend ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-65"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!canSend}
                          onChange={() => canSend && toggleRoom(item.room_id)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {item.room_name || item.room_number} · {item.house_name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.tenant_name} ·{" "}
                            {target || <span className="text-rose-500">{t("batchNotice.missingContact")}</span>}
                            {" · "}
                            <strong className="text-rose-600">{formatCurrency(item.due_amount)}</strong>
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!canSend}
                        onClick={() => handleSendSingleWhatsapp(item)}
                        className={`shrink-0 h-8 text-xs ${
                          waSent
                            ? "bg-slate-100 text-emerald-700 hover:bg-slate-200 border border-emerald-200"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {waSent ? "Sent ✓" : "Send WhatsApp"}
                      </Button>
                    </div>
                  );
                }

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

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {channel === "whatsapp" ? t("common.close") : t("common.cancel")}
            </Button>
            {channel === "whatsapp" ? (
              !inWaQueue ? (
                <Button
                  type="button"
                  disabled={selectedWaItems.length === 0}
                  onClick={startWaQueue}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Send className="mr-1.5 h-4 w-4" />
                  Start Queue ({selectedWaItems.length})
                </Button>
              ) : waQueueDone ? (
                <Button
                  type="button"
                  onClick={() => {
                    setWaQueueOrder([]);
                    setWaQueuePos(0);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  All {waQueueOrder.length} Opened ✓
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={advanceWaQueue}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Send className="mr-1.5 h-4 w-4" />
                  Next ({waQueuePos}/{waQueueOrder.length}): {nextWaItem?.tenant_name} →
                </Button>
              )
            ) : (
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
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
