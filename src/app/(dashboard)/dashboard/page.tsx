"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { Card } from "@/components/ui/card";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import {
  formatNepaliMonth,
  getPrevNepaliMonth,
  getNextNepaliMonth,
} from "@/lib/nepaliDate";
import {
  Zap,
  Droplets,
  Trash2,
  Wifi,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Printer,
  Building2,
  TrendingUp,
  RefreshCw,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [houseFilter, setHouseFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboard", selectedMonth, statusFilter, houseFilter, searchQuery],
    queryFn: () =>
      dashboardApi.get({
        month: selectedMonth || undefined,
        status: statusFilter || undefined,
        house: houseFilter || undefined,
        search: searchQuery.trim() || undefined,
      }),
  });

  const utilitySummary = dashboard?.utility_summary || {
    month: "",
    electricity_units: 0,
    electricity_price_collected: "0.00",
    electricity_total: "0.00",
    water_collected: "0.00",
    water_total: "0.00",
    waste_collected: "0.00",
    waste_total: "0.00",
    internet_collected: "0.00",
    internet_total: "0.00",
    total_billed: "0.00",
    total_collected: "0.00",
    has_internet: false,
    bills_count: 0,
    paid_count: 0,
    unpaid_count: 0,
    partial_count: 0,
  };

  const activeMonth = selectedMonth || dashboard?.selected_nepali_month || "";
  const availableMonths: string[] = dashboard?.available_nepali_months || [];
  const houses: Array<{ id: number; name: string }> = dashboard?.houses || [];

  const todayNepaliMonth = dashboard?.today_nepali_date
    ? dashboard.today_nepali_date.substring(0, 7)
    : "";
  const isCurrentMonth = Boolean(todayNepaliMonth && activeMonth === todayNepaliMonth);

  const hasInternet = Boolean(
    utilitySummary.has_internet ||
      (utilitySummary.internet_total && parseFloat(utilitySummary.internet_total) > 0) ||
      (utilitySummary.internet_collected && parseFloat(utilitySummary.internet_collected) > 0)
  );

  const formattedActiveMonth = activeMonth
    ? formatNepaliMonth(activeMonth, locale === "ne" ? "ne" : "both")
    : t("dashboard.allMonths");

  // Financial calculations
  const totalBilledNum = parseFloat(utilitySummary.total_billed || "0");
  const totalCollectedNum = parseFloat(utilitySummary.total_collected || "0");
  const pendingAmountNum = Math.max(0, totalBilledNum - totalCollectedNum);
  const collectionRate =
    totalBilledNum > 0
      ? Math.min(100, Math.max(0, Math.round((totalCollectedNum / totalBilledNum) * 100)))
      : 0;

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (activeMonth && activeMonth !== "all") {
      const prev = getPrevNepaliMonth(activeMonth);
      if (prev) setSelectedMonth(prev);
    }
  };

  const handleNextMonth = () => {
    if (activeMonth && activeMonth !== "all") {
      const next = getNextNepaliMonth(activeMonth);
      if (next) setSelectedMonth(next);
    }
  };

  const handleCurrentMonth = () => {
    if (todayNepaliMonth) setSelectedMonth(todayNepaliMonth);
  };

  // CSV Export for monthly utility records
  const handleExportCsv = () => {
    const items = dashboard?.recent_payments || [];
    if (!items.length) return;

    const headers = [
      "Room",
      "House",
      "Tenant",
      "Billing Month",
      "Electricity Units",
      "Electricity (NPR)",
      "Water (NPR)",
      "Waste (NPR)",
      ...(hasInternet ? ["Internet (NPR)"] : []),
      "Total Billed (NPR)",
      "Status",
    ];

    const rows = items.map((p: any) => {
      const unitsUsed =
        p.current_units !== undefined && p.previous_units !== undefined
          ? Math.max(0, p.current_units - p.previous_units)
          : "";
      return [
        `"${p.room_number || p.roomName || ""}"`,
        `"${p.houseName || ""}"`,
        `"${p.tenant_name || ""}"`,
        `"${p.billing_month || ""}"`,
        `"${unitsUsed}"`,
        `"${p.electricity || "0"}"`,
        `"${p.water || "0"}"`,
        `"${p.waste || "0"}"`,
        ...(hasInternet ? [`"${p.internet || "0"}"`] : []),
        `"${p.amount || p.total || "0"}"`,
        `"${p.status || ""}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: string[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gharhisab_bills_${activeMonth || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-1 sm:p-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded-lg w-56"></div>
            <div className="h-4 bg-slate-200 rounded w-72"></div>
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-64"></div>
        </div>
        <div className="h-28 bg-slate-200/70 rounded-2xl"></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200/80 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-200/70 rounded-2xl"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-rose-900">
          {locale === "ne" ? "ड्यासबोर्ड डेटा लोड गर्न सकिएन" : "Failed to load dashboard data"}
        </h3>
        <p className="mt-1 text-sm text-rose-600">
          {locale === "ne"
            ? "कृपया इन्टरनेट वा सर्भर जडान जाँच्नुहोस् र पुनः प्रयास गर्नुहोस्।"
            : "Please check your network or server connection and try again."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          {locale === "ne" ? "पुनः प्रयास गर्नुहोस्" : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-slide-up">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
              {t("dashboard.title")}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200/60">
              <Sparkles className="h-3 w-3 text-brand-500" />
              {locale === "ne" ? "नेपाली वि.सं. क्यालेन्डर" : "Nepali BS Calendar"}
            </span>
            {isFetching && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <RefreshCw className="h-3 w-3 animate-spin" />
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t("dashboard.monthSummary")}:{" "}
            <span className="font-semibold text-slate-800">{formattedActiveMonth}</span>
          </p>
        </div>

        {/* Nepali Month Navigator & Property Filter */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* House Filter */}
          {houses.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-2xs transition focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
              <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={houseFilter}
                onChange={(e) => setHouseFilter(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-700 outline-hidden cursor-pointer"
                title={t("dashboard.allHouses")}
              >
                <option value="">{t("dashboard.allHouses")}</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Month Stepper: Prev, Select, Next, and Today Shortcut */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              disabled={activeMonth === "all"}
              title={t("dashboard.prevMonth")}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="h-4 w-4 text-brand-600 shrink-0" />
              <select
                value={activeMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-hidden cursor-pointer max-w-[150px] sm:max-w-none"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatNepaliMonth(m, locale === "ne" ? "ne" : "both")}
                  </option>
                ))}
                <option value="all">{t("dashboard.allMonths")}</option>
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              disabled={activeMonth === "all"}
              title={t("dashboard.nextMonth")}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Jump to Today's Month */}
          {todayNepaliMonth && !isCurrentMonth && (
            <button
              onClick={handleCurrentMonth}
              className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 border border-brand-200 hover:bg-brand-100 transition shadow-2xs"
            >
              {t("dashboard.currentMonth")}
            </button>
          )}
        </div>
      </div>

      {/* Monthly Financial Health Banner */}
      <Card className="p-5 border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t("dashboard.financialOverview")} — {formattedActiveMonth}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {formatCurrency(totalCollectedNum)}
              </span>
              <span className="text-sm text-slate-300">
                / {formatCurrency(totalBilledNum)} {t("dashboard.billed")}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {locale === "ne"
                ? `बाँकी बक्यौता रकम: ${formatCurrency(pendingAmountNum)}`
                : `Pending balance to collect: ${formatCurrency(pendingAmountNum)}`}
            </p>
          </div>

          {/* Progress Bar & Rate */}
          <div className="flex-1 lg:max-w-md space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">{t("dashboard.collectionRate")}</span>
              <span className="font-display font-bold text-emerald-400 text-sm">
                {collectionRate}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-700/80 overflow-hidden p-0.5 border border-slate-600/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 font-medium text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                {utilitySummary.paid_count} {t("dashboard.paid")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/80 border border-amber-700/50 px-2 py-0.5 font-medium text-amber-300">
                <Clock className="h-3 w-3" />
                {utilitySummary.partial_count} {t("dashboard.partiallyPaid")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-950/80 border border-rose-700/50 px-2 py-0.5 font-medium text-rose-300">
                <AlertCircle className="h-3 w-3" />
                {utilitySummary.unpaid_count} {t("dashboard.unpaid")}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Utility Cards: Electricity (units & price collected), Water, Waste, and conditional Internet */}
      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          hasInternet ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {/* Card 1: Electricity */}
        <div className="stat-card border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                {t("dashboard.electricity")}
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-extrabold text-amber-600">
                  {utilitySummary.electricity_units}
                </span>
                <span className="text-sm font-semibold text-amber-700">
                  {t("dashboard.units")}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("dashboard.electricityUnitsUsed")}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 shadow-inner">
              <Zap className="h-6 w-6 fill-amber-400 text-amber-600" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">{t("dashboard.collectedLabel")}:</span>
              <span className="ml-1 font-bold text-emerald-700">
                {formatCurrency(utilitySummary.electricity_price_collected)}
              </span>
            </div>
            <div className="text-slate-400">
              {t("dashboard.billed")}: {formatCurrency(utilitySummary.electricity_total)}
            </div>
          </div>
        </div>

        {/* Card 2: Water */}
        <div className="stat-card border-sky-200/80 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/40 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                {t("dashboard.water")}
              </p>
              <div className="mt-2">
                <span className="font-display text-3xl font-extrabold text-sky-700">
                  {formatCurrency(utilitySummary.water_collected)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("dashboard.waterPriceCollected")}
              </p>
            </div>
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-600 shadow-inner">
              <Droplets className="h-6 w-6 text-sky-600" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">{t("dashboard.collectedLabel")}:</span>
              <span className="ml-1 font-bold text-sky-700">
                {formatCurrency(utilitySummary.water_collected)}
              </span>
            </div>
            <div className="text-slate-400">
              {t("dashboard.billed")}: {formatCurrency(utilitySummary.water_total)}
            </div>
          </div>
        </div>

        {/* Card 3: Waste */}
        <div className="stat-card border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {t("dashboard.waste")}
              </p>
              <div className="mt-2">
                <span className="font-display text-3xl font-extrabold text-emerald-700">
                  {formatCurrency(utilitySummary.waste_collected)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("dashboard.wastePriceCollected")}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 shadow-inner">
              <Trash2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">{t("dashboard.collectedLabel")}:</span>
              <span className="ml-1 font-bold text-emerald-700">
                {formatCurrency(utilitySummary.waste_collected)}
              </span>
            </div>
            <div className="text-slate-400">
              {t("dashboard.billed")}: {formatCurrency(utilitySummary.waste_total)}
            </div>
          </div>
        </div>

        {/* Card 4: Internet (Conditionally rendered ONLY if there is internet data) */}
        {hasInternet && (
          <div className="stat-card border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 shadow-xs hover:shadow-md transition-all duration-200 animate-slide-up">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  {t("dashboard.internet")}
                </p>
                <div className="mt-2">
                  <span className="font-display text-3xl font-extrabold text-indigo-700">
                    {formatCurrency(utilitySummary.internet_collected)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {t("dashboard.internetPriceCollected")}
                </p>
              </div>
              <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 shadow-inner">
                <Wifi className="h-6 w-6 text-indigo-600" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">{t("dashboard.collectedLabel")}:</span>
                <span className="ml-1 font-bold text-indigo-700">
                  {formatCurrency(utilitySummary.internet_collected)}
                </span>
              </div>
              <div className="text-slate-400">
                {t("dashboard.billed")}: {formatCurrency(utilitySummary.internet_total)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bill & Utility Breakdown Table for the Selected Nepali Month */}
      <Card className="p-5 shadow-xs border-slate-200/80">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {t("dashboard.recentPayments")} — {formattedActiveMonth}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === "ne"
                ? `यस महिनाका कुल ${dashboard?.payments?.total_count || 0} बिल प्रविष्टिहरू`
                : `Showing ${dashboard?.payments?.total_count || 0} bill entries for this month`}
            </p>
          </div>

          {/* Search, Status Filter & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("dashboard.searchBills")}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent outline-hidden cursor-pointer"
              >
                <option value="">{t("dashboard.allStatuses")}</option>
                <option value="Paid">{t("dashboard.paid")}</option>
                <option value="Partially Paid">{t("dashboard.partiallyPaid")}</option>
                <option value="Unpaid">{t("dashboard.unpaid")}</option>
              </select>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              disabled={!dashboard?.recent_payments?.length}
              title={t("dashboard.exportCsv")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">{t("dashboard.exportCsv")}</span>
            </button>

            {/* Print Summary */}
            <button
              onClick={handlePrint}
              title={t("dashboard.printSummary")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">{t("dashboard.printSummary")}</span>
            </button>
          </div>
        </div>

        {dashboard?.recent_payments?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">{t("payments.room")}</th>
                  <th className="px-4 py-3 text-left">{t("payments.tenant")}</th>
                  <th className="px-4 py-3 text-left">{t("dashboard.nepaliMonth")}</th>
                  <th className="px-4 py-3 text-right">
                    {t("dashboard.electricity")} ({t("dashboard.units")})
                  </th>
                  <th className="px-4 py-3 text-right">{t("dashboard.electricity")}</th>
                  <th className="px-4 py-3 text-right">{t("dashboard.water")}</th>
                  <th className="px-4 py-3 text-right">{t("dashboard.waste")}</th>
                  {hasInternet && (
                    <th className="px-4 py-3 text-right">{t("dashboard.internet")}</th>
                  )}
                  <th className="px-4 py-3 text-right font-bold text-slate-900">
                    {t("dashboard.billed")}
                  </th>
                  <th className="px-4 py-3 text-left">{t("rooms.status")}</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.recent_payments.map((payment: any) => {
                  const unitsUsed =
                    payment.current_units !== undefined && payment.previous_units !== undefined
                      ? Math.max(0, payment.current_units - payment.previous_units)
                      : null;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex flex-col">
                          <span>{payment.room_number || payment.roomName}</span>
                          {payment.houseName && (
                            <span className="text-xs font-normal text-slate-400">
                              {payment.houseName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {payment.tenant_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {payment.billing_month}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {unitsUsed !== null ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                            {unitsUsed} {t("dashboard.units")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {formatCurrency(payment.electricity)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatCurrency(payment.water)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatCurrency(payment.waste)}
                      </td>
                      {hasInternet && (
                        <td className="px-4 py-3 text-right text-slate-700">
                          {formatCurrency(payment.internet)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right font-display font-bold text-slate-900">
                        {formatCurrency(payment.amount || payment.total)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {payment.status === "Paid" && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                          {payment.status === "Partially Paid" && <Clock className="h-3 w-3 text-amber-600" />}
                          {payment.status === "Unpaid" && <AlertCircle className="h-3 w-3 text-rose-600" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.roomId && (
                          <Link
                            href={`/rooms/${payment.roomId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            <span>{locale === "ne" ? "हेर्नुहोस्" : "View"}</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <p className="text-sm font-medium text-slate-500">{t("dashboard.noPayments")}</p>
            {activeMonth && (
              <p className="text-xs text-slate-400 mt-1">
                {locale === "ne"
                  ? `${formattedActiveMonth} मा कुनै भुक्तानी वा बिल फेला परेन।`
                  : `No billing records found for ${formattedActiveMonth}.`}
              </p>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
