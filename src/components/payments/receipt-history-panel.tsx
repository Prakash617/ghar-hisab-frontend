"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { receiptsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/i18n/provider";
import { toast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
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
  Banknote,
  Calendar,
  Pencil,
  RotateCcw,
  FileText,
  ExternalLink,
  Loader2,
  Share2,
} from "lucide-react";
import { ShareCardDialog } from "./share-card-dialog";

interface ReceiptHistoryPanelProps {
  receipts: any[];
  isLoading?: boolean;
  showRoomInfo?: boolean;
  onChanged?: () => void;
}

export function ReceiptHistoryPanel({
  receipts,
  isLoading = false,
  showRoomInfo = false,
  onChanged,
}: ReceiptHistoryPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [editingReceipt, setEditingReceipt] = useState<any | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [reversingReceipt, setReversingReceipt] = useState<any | null>(null);
  const [sharingReceipt, setSharingReceipt] = useState<any | null>(null);

  const invalidateRelated = () => {
    queryClient.invalidateQueries({ queryKey: ["receipts"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["room"] });
    onChanged?.();
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { received_date: string; remarks: string } }) =>
      receiptsApi.update(id, data),
    onSuccess: () => {
      toast.success(t("payments.receiptUpdated"));
      setEditingReceipt(null);
      invalidateRelated();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update receipt.");
    },
  });

  const reverseMutation = useMutation({
    mutationFn: (id: number) => receiptsApi.reverse(id),
    onSuccess: () => {
      toast.success(t("payments.receiptReversed"));
      setReversingReceipt(null);
      invalidateRelated();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reverse receipt.");
    },
  });

  const openEditModal = (receipt: any) => {
    setEditingReceipt(receipt);
    setEditDate(receipt.received_date || "");
    setEditRemarks(receipt.remarks || "");
  };

  const renderAllocationLabel = (alloc: any) => {
    if (alloc.allocation_label) {
      return alloc.is_opening_balance ? t("payments.openingBalance") : alloc.allocation_label;
    }
    if (alloc.billing_month || alloc.payment_history?.billing_month) {
      return alloc.billing_month || alloc.payment_history?.billing_month;
    }
    if (alloc.tenant && !alloc.payment_history) {
      return t("payments.openingBalance");
    }
    return "-";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-slate-200 bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Banknote className="mx-auto mb-3 h-11 w-11 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-900">{t("payments.noReceipts")}</h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">{t("payments.noReceiptsDesc")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile Receipt Cards */}
      <div className="md:hidden space-y-3">
        {receipts.map((receipt: any) => {
          const hasUnapplied = Number(receipt.unapplied_amount || 0) > 0;
          const allocations = receipt.allocations || [];

          return (
            <article
              key={receipt.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                      {t("payments.receiptNumber")} #{receipt.id}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {receipt.received_date}
                    </span>
                  </div>
                  {showRoomInfo && (
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-xs">
                      <Link
                        href={`/rooms/${receipt.room_id || receipt.room}`}
                        className="font-bold text-slate-900 hover:text-sky-600 inline-flex items-center gap-1"
                      >
                        {receipt.room_name || `${t("rooms.room")} ${receipt.room_number}`}
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </Link>
                      {receipt.house_name && (
                        <span className="text-slate-600">· {receipt.house_name}</span>
                      )}
                      {receipt.tenant_name && (
                        <span className="text-slate-600">· {receipt.tenant_name}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="font-display text-lg font-extrabold text-emerald-700 tabular-nums whitespace-nowrap">
                    {formatCurrency(receipt.amount)}
                  </p>
                </div>
              </div>

              {/* Allocation Summary Strip */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-slate-600 block">
                    {t("payments.allocated")}
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(receipt.allocated_amount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold uppercase text-slate-600 block">
                    {t("payments.unapplied")}
                  </span>
                  <span className={`font-bold tabular-nums ${hasUnapplied ? "text-amber-700" : "text-slate-600"}`}>
                    {formatCurrency(receipt.unapplied_amount)}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              {receipt.remarks && (
                <div className="flex items-start gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span>{receipt.remarks}</span>
                </div>
              )}

              {/* Allocations Breakdown Chips */}
              {allocations.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    {t("payments.appliedTo")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allocations.map((alloc: any, idx: number) => (
                      <span
                        key={alloc.id || idx}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-medium text-indigo-900 dark:border-indigo-800/80 dark:bg-indigo-950/70 dark:text-indigo-200 tabular-nums"
                      >
                        <span className="font-semibold">{renderAllocationLabel(alloc)}</span>
                        <span>·</span>
                        <span>{formatCurrency(alloc.allocated_amount)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSharingReceipt(receipt)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700 hover:bg-sky-100 active:scale-95 transition cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {t("shareCard.share")}
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(receipt)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => setReversingReceipt(receipt)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 active:scale-95 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("payments.undoPayment")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop Receipts Table */}
      <Card className="hidden md:block">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    {t("payments.receiptNumber")} / {t("payments.receivedDate")}
                  </th>
                  {showRoomInfo && (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                      {t("payments.room")} / {t("payments.tenant")}
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">
                    {t("payments.amountReceived")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">
                    {t("payments.allocated")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">
                    {t("payments.unapplied")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    {t("payments.appliedTo")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    {t("payments.remarks")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">
                    {t("payments.action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {receipts.map((receipt: any) => {
                  const hasUnapplied = Number(receipt.unapplied_amount || 0) > 0;
                  const allocations = receipt.allocations || [];

                  return (
                    <tr key={receipt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-indigo-700">
                            #{receipt.id}
                          </span>
                          <span className="text-xs text-slate-600">
                            {receipt.received_date}
                          </span>
                        </div>
                      </td>
                      {showRoomInfo && (
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <Link
                              href={`/rooms/${receipt.room_id || receipt.room}`}
                              className="font-semibold text-slate-900 hover:text-sky-600"
                            >
                              {receipt.room_name || `${t("rooms.room")} ${receipt.room_number}`}
                            </Link>
                            <span className="text-xs text-slate-600">
                              {receipt.tenant_name || "-"}
                              {receipt.house_name ? ` · ${receipt.house_name}` : ""}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                        {formatCurrency(receipt.amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                        {formatCurrency(receipt.allocated_amount)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span
                          className={`font-semibold tabular-nums ${
                            hasUnapplied ? "text-amber-700" : "text-slate-600"
                          }`}
                        >
                          {formatCurrency(receipt.unapplied_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {allocations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {allocations.map((alloc: any, idx: number) => (
                              <span
                                key={alloc.id || idx}
                                className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/70 px-2 py-0.5 text-xs font-medium text-indigo-900 dark:border-indigo-800/80 dark:bg-indigo-950/70 dark:text-indigo-200 tabular-nums"
                              >
                                <span>{renderAllocationLabel(alloc)}:</span>
                                <span className="font-semibold">{formatCurrency(alloc.allocated_amount)}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[180px]">
                        {receipt.remarks || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSharingReceipt(receipt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 cursor-pointer"
                            title={t("shareCard.share")}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            {t("shareCard.share")}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(receipt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            title={t("payments.editReceipt")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {t("common.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setReversingReceipt(receipt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                            title={t("payments.undoPayment")}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {t("payments.undoPayment")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Receipt Modal */}
      <Dialog open={!!editingReceipt} onOpenChange={(open) => !open && setEditingReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("payments.editReceipt")} #{editingReceipt?.id}
            </DialogTitle>
            <p className="text-xs text-slate-600">{t("payments.editReceiptDesc")}</p>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingReceipt) return;
              updateMutation.mutate({
                id: editingReceipt.id,
                data: {
                  received_date: editDate.trim(),
                  remarks: editRemarks.trim(),
                },
              });
            }}
            className="space-y-4 pt-2"
          >
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">{t("payments.amountReceived")}</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {formatCurrency(editingReceipt?.amount)}
              </span>
            </div>

            <div>
              <Label htmlFor="edit_receipt_date">{t("payments.receivedDate")}</Label>
              <Input
                id="edit_receipt_date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                placeholder="YYYY-MM-DD (BS)"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit_receipt_remarks">{t("payments.remarks")}</Label>
              <Input
                id="edit_receipt_remarks"
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                placeholder="e.g. Paid via eSewa, Cash, Bank Transfer"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingReceipt(null)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Undo / Reverse Receipt Modal */}
      <Dialog open={!!reversingReceipt} onOpenChange={(open) => !open && setReversingReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("payments.undoConfirmTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">{t("payments.undoConfirmDesc")}</p>
            {reversingReceipt && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs space-y-1">
                <p className="font-bold text-rose-900">
                  {t("payments.receiptNumber")} #{reversingReceipt.id} ·{" "}
                  {formatCurrency(reversingReceipt.amount)}
                </p>
                <p className="text-rose-800">
                  {t("payments.receivedDate")}: {reversingReceipt.received_date}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setReversingReceipt(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={reverseMutation.isPending}
                onClick={() => reversingReceipt && reverseMutation.mutate(reversingReceipt.id)}
              >
                {reverseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("payments.confirmUndo")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ShareCardDialog
        open={!!sharingReceipt}
        onOpenChange={(open) => !open && setSharingReceipt(null)}
        mode="receipt"
        receipt={sharingReceipt}
      />
    </>
  );
}
