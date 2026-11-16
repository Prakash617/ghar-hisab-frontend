"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bulkBillingApi, housesApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { formatCurrency } from "@/lib/utils";
import { getTodayNepaliDate } from "@/lib/nepaliDate";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2, ClipboardList, DoorOpen, FileText, Loader2, Plus, X, Zap } from "lucide-react";

interface RowInputState {
  current_units: string;
  extra_charge: string;
  extra_charge_label: string;
  showExtra?: boolean;
  showDetails?: boolean;
  meter_photo?: File | null;
  meter_photo_preview?: string;
}

function BulkBillingContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const houseParam = searchParams.get("house_id") || "";
  const [selectedHouseId, setSelectedHouseId] = useState<string>(houseParam);
  const [billingDate, setBillingDate] = useState<string>(getTodayNepaliDate());
  const [includeVacant, setIncludeVacant] = useState(false);
  const [rowInputs, setRowInputs] = useState<Record<number, RowInputState>>({});

  const { data: houses = [], isLoading: loadingHouses } = useQuery({
    queryKey: ["houses"],
    queryFn: () => housesApi.list(),
  });

  useEffect(() => {
    if (houseParam) {
      setSelectedHouseId(houseParam);
    } else if (!selectedHouseId && houses.length > 0) {
      setSelectedHouseId(String(houses[0].id));
    }
  }, [houseParam, houses, selectedHouseId]);

  const numericHouseId = selectedHouseId ? Number(selectedHouseId) : 0;

  const { data: preview, isLoading: loadingPreview } = useQuery({
    queryKey: ["bulk-billing-preview", numericHouseId, includeVacant],
    queryFn: () => bulkBillingApi.preview(numericHouseId, includeVacant),
    enabled: numericHouseId > 0,
  });

  useEffect(() => {
    if (preview?.today_nepali_date) {
      setBillingDate(preview.today_nepali_date);
    }
    setRowInputs({});
  }, [preview?.house?.id, preview?.today_nepali_date]);

  const items: Array<Record<string, any>> = preview?.items || [];

  const updateRow = (roomId: number, patch: Partial<RowInputState>) => {
    setRowInputs((prev) => {
      const existing = prev[roomId];
      return {
        ...prev,
        [roomId]: {
          current_units: existing?.current_units ?? "",
          extra_charge: existing?.extra_charge ?? "",
          extra_charge_label: existing?.extra_charge_label ?? "",
          showExtra: existing?.showExtra,
          showDetails: existing?.showDetails,
          meter_photo: existing?.meter_photo ?? null,
          meter_photo_preview: existing?.meter_photo_preview ?? "",
          ...patch,
        },
      };
    });
  };

  const computeRowPreview = (item: Record<string, any>) => {
    const state = rowInputs[item.room_id];
    const curr = parseInt(state?.current_units || "", 10);
    const prev = Number(item.previous_units ?? 0);
    const isEntered = state?.current_units !== undefined && state.current_units.trim() !== "";
    const isValid = isEntered && !isNaN(curr) && curr > prev;
    const units = isValid ? curr - prev : 0;

    const tenant = item.tenant;
    const rate = tenant ? parseFloat(tenant.electricity_price_per_unit || "15") : 15;
    const rent = tenant ? parseFloat(tenant.rent_price || "0") : 0;
    const water = tenant ? parseFloat(tenant.water_price || "0") : 0;
    const waste = tenant ? parseFloat(tenant.waste_price || "0") : 0;
    const internet = tenant ? parseFloat(tenant.internet_price || "0") : 0;
    const extra = Math.max(0, parseFloat(state?.extra_charge || "0") || 0);
    const electricityCost = units * rate;
    const estimated = isValid ? electricityCost + rent + water + waste + internet + extra : 0;

    return {
      state,
      curr,
      prev,
      isEntered,
      isValid,
      units,
      rate,
      electricityCost,
      rent,
      water,
      waste,
      internet,
      extra,
      estimated,
    };
  };

  const validEntries = items
    .map((item) => ({ item, calc: computeRowPreview(item) }))
    .filter(({ calc }) => calc.isValid);

  const invalidEnteredCount = items.filter((item) => {
    const c = computeRowPreview(item);
    return c.isEntered && !c.isValid;
  }).length;

  const grandTotal = validEntries.reduce((sum, { calc }) => sum + calc.estimated, 0);

  const createMutation = useMutation({
    mutationFn: () => {
      const entriesPayload = validEntries.map(({ item, calc }) => ({
        room_id: item.room_id,
        current_units: calc.curr,
        extra_charge: calc.state?.extra_charge || 0,
        extra_charge_label: calc.state?.extra_charge_label || undefined,
      }));
      const hasPhotos = validEntries.some(({ calc }) => Boolean(calc.state?.meter_photo));
      if (hasPhotos) {
        const fd = new FormData();
        fd.append("billing_month", billingDate);
        fd.append("entries", JSON.stringify(entriesPayload));
        validEntries.forEach(({ item, calc }) => {
          if (calc.state?.meter_photo) {
            fd.append(`meter_photo_${item.room_id}`, calc.state.meter_photo);
          }
        });
        return bulkBillingApi.create(numericHouseId, fd);
      }
      return bulkBillingApi.create(numericHouseId, {
        billing_month: billingDate,
        entries: entriesPayload,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["bulk-billing-preview", numericHouseId] });
      toast.success(
        t("bulkBilling.success").replace("{count}", String(res.created_count || validEntries.length))
      );
      setRowInputs({});
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to generate bills.");
    },
  });

  return (
    <section className="space-y-5 pb-28 sm:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/houses"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t("bulkBilling.title")}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">{t("bulkBilling.subtitle")}</p>
        </div>
      </div>

      {/* Controls Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="bulk-house">{t("bulkBilling.selectHouse")}</Label>
            <select
              id="bulk-house"
              value={selectedHouseId}
              onChange={(e) => {
                setSelectedHouseId(e.target.value);
                router.replace(`/bulk-billing?house_id=${e.target.value}`);
              }}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {houses.map((h: Record<string, any>) => (
                <option key={h.id} value={String(h.id)}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="bulk-date">{t("bulkBilling.billingDate")}</Label>
            <Input
              id="bulk-date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              className="mt-1 h-10 font-semibold"
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={includeVacant}
            onChange={(e) => setIncludeVacant(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-600"
          />
          {t("bulkBilling.includeVacant")}
        </label>
      </div>

      {/* Rooms Entry List */}
      {loadingHouses || loadingPreview ? (
        <div className="py-12 text-center text-sm text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-sky-600" />
          {t("common.loading")}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <DoorOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">{t("bulkBilling.noRooms")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => {
            const calc = computeRowPreview(item);
            return (
              <div
                key={item.room_id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 shadow-2xs transition ${
                  calc.isValid
                    ? "border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200/70 dark:ring-emerald-800/50"
                    : calc.isEntered && !calc.isValid
                    ? "border-rose-300 dark:border-rose-700 ring-1 ring-rose-200/70 dark:ring-rose-800/50"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/rooms/${item.room_id}`}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-sky-600"
                    >
                      {item.room_name || `Room ${item.room_number}`}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.tenant ? item.tenant.name : t("roomDetail.vacant")}
                      {item.latest_bill_month ? ` · Last: ${item.latest_bill_month}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <Zap className="h-3 w-3 text-amber-500" />
                      {t("bulkBilling.prevReading")}: {calc.prev}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2.5 items-end">
                  <div>
                    <Label className="text-xs text-slate-600">
                      {t("bulkBilling.currReading")} (&gt; {calc.prev})
                    </Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={calc.prev + 1}
                      value={calc.state?.current_units || ""}
                      onChange={(e) => updateRow(item.room_id, { current_units: e.target.value })}
                      placeholder={`> ${calc.prev}`}
                      className="mt-1 h-11 text-base font-bold"
                    />
                  </div>
                  <div className="min-w-[110px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-right">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {calc.isValid ? `${calc.units} ${t("bulkBilling.unitsUsed")}` : t("bulkBilling.estimatedBill")}
                    </p>
                    <p
                      className={`text-sm font-extrabold ${
                        calc.isValid ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"
                      }`}
                    >
                      {calc.isValid ? formatCurrency(calc.estimated) : "-"}
                    </p>
                  </div>
                </div>

                {calc.isEntered && !calc.isValid && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">
                    Must be greater than {calc.prev}
                  </p>
                )}

                <div className="mt-2.5 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateRow(item.room_id, { showExtra: !calc.state?.showExtra })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      {t("bulkBilling.extraCost")}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateRow(item.room_id, { showDetails: !calc.state?.showDetails })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {calc.state?.showDetails ? "Hide Invoice" : "Invoice Details"}
                    </button>

                    <label className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer">
                      <Camera className="h-3.5 w-3.5" />
                      <span>
                        {calc.state?.meter_photo ? t("meterPhoto.change") : t("meterPhoto.attach")}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const previewUrl = URL.createObjectURL(file);
                          updateRow(item.room_id, {
                            meter_photo: file,
                            meter_photo_preview: previewUrl,
                          });
                        }}
                      />
                    </label>
                  </div>

                  {calc.state?.meter_photo_preview && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-1.5">
                      <img
                        src={calc.state.meter_photo_preview}
                        alt="Meter proof preview"
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                      />
                      <span className="text-xs font-medium text-slate-700 truncate flex-1">
                        {calc.state.meter_photo?.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateRow(item.room_id, { meter_photo: null, meter_photo_preview: "" })
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        title={t("meterPhoto.remove")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {calc.state?.showExtra && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input
                        value={calc.state.extra_charge_label}
                        onChange={(e) => updateRow(item.room_id, { extra_charge_label: e.target.value })}
                        placeholder={t("bulkBilling.extraLabel")}
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={calc.state.extra_charge}
                        onChange={(e) => updateRow(item.room_id, { extra_charge: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  )}

                  {calc.state?.showDetails && (
                    <div className="mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 p-3 text-xs space-y-1.5">
                      <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1">
                        <span>Invoice Preview ({billingDate || "-"})</span>
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                          {item.tenant ? item.tenant.name : t("roomDetail.vacant")}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>
                          Electricity ({calc.prev} → {calc.isValid ? calc.curr : "—"} = {calc.units}u × Rs. {calc.rate})
                        </span>
                        <span className="font-semibold tabular-nums">{formatCurrency(calc.electricityCost)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Rent</span>
                        <span className="font-semibold tabular-nums">{formatCurrency(calc.rent)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Water</span>
                        <span className="font-semibold tabular-nums">{formatCurrency(calc.water)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Waste</span>
                        <span className="font-semibold tabular-nums">{formatCurrency(calc.waste)}</span>
                      </div>
                      {calc.internet > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Internet</span>
                          <span className="font-semibold tabular-nums">{formatCurrency(calc.internet)}</span>
                        </div>
                      )}
                      {calc.extra > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>{calc.state?.extra_charge_label || "Extra"}</span>
                          <span className="font-semibold tabular-nums">{formatCurrency(calc.extra)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-1.5 font-extrabold text-slate-900 dark:text-white">
                        <span>Estimated Total</span>
                        <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {calc.isValid
                            ? formatCurrency(calc.estimated)
                            : formatCurrency(calc.rent + calc.water + calc.waste + calc.internet + calc.extra)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Footer */}
      {items.length > 0 && (
        <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-4 z-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <ClipboardList className="h-4 w-4 text-sky-600" />
              {t("bulkBilling.readyCount").replace("{count}", String(validEntries.length))}
            </span>
            {validEntries.length > 0 && (
              <span className="font-extrabold text-emerald-700">
                Total: {formatCurrency(grandTotal)}
              </span>
            )}
            {invalidEnteredCount > 0 && (
              <span className="text-rose-600 font-medium">
                ({invalidEnteredCount} invalid)
              </span>
            )}
          </div>
          <Button
            type="button"
            disabled={
              validEntries.length === 0 || invalidEnteredCount > 0 || createMutation.isPending
            }
            onClick={() => createMutation.mutate()}
            className="w-full sm:w-auto"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {t("bulkBilling.generating")}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                {t("bulkBilling.generateBills").replace("{count}", String(validEntries.length))}
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}

export default function BulkBillingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
        </div>
      }
    >
      <BulkBillingContent />
    </Suspense>
  );
}
