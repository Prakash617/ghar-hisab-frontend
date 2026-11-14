"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { moveOutApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { formatCurrency } from "@/lib/utils";
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
import { DoorOpen, Loader2 } from "lucide-react";

interface MoveOutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: number;
  tenant: Record<string, any> | null;
  todayNepaliDate: string;
  nextPreviousUnits: number;
  onCompleted?: () => void;
}

export function MoveOutModal({
  open,
  onOpenChange,
  roomId,
  tenant,
  todayNepaliDate,
  nextPreviousUnits,
  onCompleted,
}: MoveOutModalProps) {
  const { t } = useTranslation();

  const [moveOutDate, setMoveOutDate] = useState(todayNepaliDate);
  const [includeFinalBill, setIncludeFinalBill] = useState(false);
  const [finalUnits, setFinalUnits] = useState(String(nextPreviousUnits));
  const [finalRent, setFinalRent] = useState("");
  const [extraDeduction, setExtraDeduction] = useState("");
  const [deductionLabel, setDeductionLabel] = useState("");
  const [settledAmount, setSettledAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setMoveOutDate(todayNepaliDate);
      setIncludeFinalBill(false);
      setFinalUnits(String(nextPreviousUnits));
      setFinalRent("");
      setExtraDeduction("");
      setDeductionLabel("");
      setSettledAmount("");
      setNotes("");
    }
  }, [open, todayNepaliDate, nextPreviousUnits]);

  const { data: previewData, isLoading } = useQuery({
    queryKey: [
      "move-out-preview",
      roomId,
      includeFinalBill,
      finalUnits,
      finalRent,
      extraDeduction,
    ],
    queryFn: () =>
      moveOutApi.preview(roomId, {
        include_final_bill: includeFinalBill,
        final_units: includeFinalBill ? finalUnits : undefined,
        final_rent: includeFinalBill && finalRent !== "" ? finalRent : undefined,
        extra_deduction: extraDeduction || undefined,
      }),
    enabled: open && Boolean(tenant),
  });

  const executeMutation = useMutation({
    mutationFn: () =>
      moveOutApi.execute(roomId, {
        move_out_date: moveOutDate,
        include_final_bill: includeFinalBill,
        final_units: includeFinalBill && finalUnits ? Number(finalUnits) : undefined,
        final_rent: includeFinalBill && finalRent !== "" ? finalRent : undefined,
        extra_deduction: extraDeduction || 0,
        deduction_label: deductionLabel || undefined,
        settled_amount: settledAmount || 0,
        notes: notes || undefined,
      }),
    onSuccess: (res) => {
      toast.success(`Move-out settled for ${res.tenant_name || "tenant"}. Room is now vacant.`);
      onOpenChange(false);
      onCompleted?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to finalize move-out.");
    },
  });

  const settlement = previewData?.settlement;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("moveOut.title")}</DialogTitle>
          <p className="text-xs text-slate-500">{t("moveOut.subtitle")}</p>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mo-date">{t("moveOut.moveOutDate")}</Label>
              <Input
                id="mo-date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                required
                className="mt-1 font-semibold"
              />
            </div>
            <div>
              <Label htmlFor="mo-deduct">{t("moveOut.extraDeduction")}</Label>
              <Input
                id="mo-deduct"
                type="number"
                min="0"
                step="0.01"
                value={extraDeduction}
                onChange={(e) => setExtraDeduction(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          {parseFloat(extraDeduction || "0") > 0 && (
            <div>
              <Label htmlFor="mo-deduct-label">{t("moveOut.deductionLabel")}</Label>
              <Input
                id="mo-deduct-label"
                value={deductionLabel}
                onChange={(e) => setDeductionLabel(e.target.value)}
                placeholder="e.g. Wall repaint, broken glass"
                className="mt-1"
              />
            </div>
          )}

          {/* Optional final meter reading */}
          <div className="rounded-xl border border-slate-200 p-3 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer text-sm font-semibold">
              <span>{t("moveOut.includeFinalBill")}</span>
              <input
                type="checkbox"
                checked={includeFinalBill}
                onChange={(e) => setIncludeFinalBill(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600"
              />
            </label>

            {includeFinalBill && (
              <div className="grid grid-cols-2 gap-2.5 border-t border-slate-200 pt-2.5">
                <div>
                  <Label className="text-xs">
                    {t("moveOut.finalUnits")} ({t("bulkBilling.prevReading")}: {nextPreviousUnits})
                  </Label>
                  <Input
                    type="number"
                    min={nextPreviousUnits}
                    value={finalUnits}
                    onChange={(e) => setFinalUnits(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("moveOut.finalRent")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={finalRent}
                    onChange={(e) => setFinalRent(e.target.value)}
                    placeholder={String(tenant?.rent_price ?? 0)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Settlement Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 text-xs">
            {isLoading || !settlement ? (
              <div className="py-4 text-center text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                {t("common.loading")}
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t("moveOut.unpaidBills")}:</span>
                  <span className="font-semibold">{formatCurrency(settlement.unpaid_bills_due)}</span>
                </div>
                {parseFloat(settlement.opening_balance_remaining) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("moveOut.openingDue")}:</span>
                    <span className="font-semibold">
                      {formatCurrency(settlement.opening_balance_remaining)}
                    </span>
                  </div>
                )}
                {parseFloat(settlement.final_bill_total) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("moveOut.finalBill")}:</span>
                    <span className="font-semibold">{formatCurrency(settlement.final_bill_total)}</span>
                  </div>
                )}
                {parseFloat(settlement.extra_deduction) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("moveOut.deduction")}:</span>
                    <span className="font-semibold">{formatCurrency(settlement.extra_deduction)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-700">
                  <span>- {t("moveOut.securityDeposit")}:</span>
                  <span className="font-bold">{formatCurrency(settlement.security_deposit)}</span>
                </div>
                {parseFloat(settlement.unapplied_credit) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>- {t("moveOut.advanceCredit")}:</span>
                    <span className="font-bold">{formatCurrency(settlement.unapplied_credit)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-2 mt-1 flex items-center justify-between text-sm">
                  {parseFloat(settlement.refund_to_tenant) > 0 ? (
                    <>
                      <span className="font-bold text-emerald-800">{t("moveOut.refundTenant")}:</span>
                      <span className="font-extrabold text-emerald-700 text-base">
                        {formatCurrency(settlement.refund_to_tenant)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-rose-800">{t("moveOut.tenantOwes")}:</span>
                      <span className="font-extrabold text-rose-700 text-base">
                        {formatCurrency(settlement.tenant_owes)}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mo-settled">{t("moveOut.settledAmount")}</Label>
              <Input
                id="mo-settled"
                type="number"
                min="0"
                step="0.01"
                value={settledAmount}
                onChange={(e) => setSettledAmount(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mo-notes">{t("roomDetail.noteOptional")}</Label>
              <Input
                id="mo-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Keys returned"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={executeMutation.isPending}
            >
              {executeMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  {t("moveOut.confirming")}
                </>
              ) : (
                <>
                  <DoorOpen className="mr-1.5 h-4 w-4" />
                  {t("moveOut.confirmMoveOut")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
