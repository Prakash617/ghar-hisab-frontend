"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi, expensesApi, housesApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { formatCurrency } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv";
import { getTodayNepaliDate } from "@/lib/nepaliDate";
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
import {
  Download,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const CATEGORY_KEYS = [
  "electricity",
  "water",
  "maintenance",
  "tax",
  "salary",
  "other",
] as const;

export default function ExpensesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [houseFilter, setHouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Record<string, any> | null>(null);
  const [formState, setFormState] = useState({
    house: "",
    category: "electricity",
    title: "",
    amount: "",
    expense_date: getTodayNepaliDate(),
    notes: "",
  });

  const { data: houses = [] } = useQuery({
    queryKey: ["houses"],
    queryFn: () => housesApi.list(),
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", monthFilter || "current", houseFilter],
    queryFn: () =>
      dashboardApi.get({
        month: monthFilter || undefined,
        house: houseFilter !== "all" ? houseFilter : undefined,
      }),
  });

  const effectiveMonth = monthFilter || dashboard?.selected_nepali_month || "";
  const availableMonths: string[] = dashboard?.available_nepali_months || [];
  const todayBs = dashboard?.today_nepali_date || getTodayNepaliDate();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", houseFilter, categoryFilter, effectiveMonth, search],
    queryFn: () =>
      expensesApi.list({
        house_id: houseFilter,
        category: categoryFilter,
        month: effectiveMonth || undefined,
        search: search.trim() || undefined,
      }),
  });

  const { data: summary } = useQuery({
    queryKey: ["expenses-summary", houseFilter, categoryFilter, effectiveMonth],
    queryFn: () =>
      expensesApi.summary({
        house_id: houseFilter,
        category: categoryFilter,
        month: effectiveMonth || undefined,
      }),
  });

  const totalExpenses = parseFloat(summary?.total_expenses || dashboard?.utility_summary?.total_expenses || "0");
  const totalCollected = parseFloat(dashboard?.utility_summary?.total_collected || "0");
  const netProfit = totalCollected - totalExpenses;

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        house: Number(formState.house),
        category: formState.category,
        title: formState.title.trim(),
        amount: formState.amount,
        expense_date: formState.expense_date.trim() || todayBs,
        notes: formState.notes.trim(),
      };
      if (editingExpense) {
        return expensesApi.update(editingExpense.id, payload);
      }
      return expensesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setIsModalOpen(false);
      setEditingExpense(null);
      toast.success(editingExpense ? "Expense updated!" : "Expense recorded!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save expense.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Expense deleted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete expense.");
    },
  });

  const openAdd = () => {
    setEditingExpense(null);
    setFormState({
      house:
        houseFilter !== "all"
          ? houseFilter
          : houses[0]?.id
          ? String(houses[0].id)
          : "",
      category: "electricity",
      title: "",
      amount: "",
      expense_date: todayBs,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: Record<string, any>) => {
    setEditingExpense(item);
    setFormState({
      house: String(item.house),
      category: item.category || "other",
      title: item.title || "",
      amount: String(item.amount || ""),
      expense_date: item.expense_date || todayBs,
      notes: item.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleExportCsv = () => {
    if (!expenses.length) return;
    downloadCsv(
      `gharhisab_expenses_${effectiveMonth || "all"}.csv`,
      ["Date (BS)", "House", "Category", "Title", "Amount (NPR)", "Notes"],
      expenses.map((e: Record<string, any>) => [
        e.expense_date,
        e.house_name,
        t(`expenses.categories.${e.category || "other"}`),
        e.title,
        e.amount,
        e.notes || "",
      ])
    );
  };

  return (
    <section className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("expenses.title")}</h1>
          <p className="text-sm text-slate-500">{t("expenses.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleExportCsv} disabled={!expenses.length}>
            <Download className="mr-1.5 h-4 w-4" />
            {t("expenses.exportCsv")}
          </Button>
          <Button type="button" onClick={openAdd} disabled={!houses.length}>
            <Plus className="mr-1.5 h-4 w-4" />
            {t("expenses.addExpense")}
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>{t("expenses.collectedIncome")}</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="mt-1.5 text-xl font-extrabold text-emerald-900">
            {formatCurrency(totalCollected)}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
            <span>{t("expenses.totalExpenses")}</span>
            <TrendingDown className="h-4 w-4" />
          </div>
          <p className="mt-1.5 text-xl font-extrabold text-rose-900">
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 ${
            netProfit >= 0
              ? "border-sky-200/80 bg-sky-50/70 text-sky-900"
              : "border-amber-200/80 bg-amber-50/70 text-amber-900"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>{t("expenses.netProfit")}</span>
            <Receipt className="h-4 w-4" />
          </div>
          <p className="mt-1.5 text-xl font-extrabold">{formatCurrency(netProfit)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={houseFilter}
          onChange={(e) => setHouseFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
        >
          <option value="all">{t("common.all")} {t("nav.houses")}</option>
          {houses.map((h: Record<string, any>) => (
            <option key={h.id} value={String(h.id)}>
              {h.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">{t("common.all")}</option>
            {CATEGORY_KEYS.map((cat) => (
              <option key={cat} value={cat}>
                {t(`expenses.categories.${cat}`)}
              </option>
            ))}
          </select>
          <select
            value={effectiveMonth}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">{t("common.all")}</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-sky-600" />
          {t("common.loading")}
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          {t("expenses.noExpenses")}
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-2.5 md:hidden">
            {expenses.map((exp: Record<string, any>) => (
              <div
                key={exp.id}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{exp.title}</p>
                    <p className="text-xs text-slate-500">
                      {exp.house_name} · {t(`expenses.categories.${exp.category || "other"}`)} ·{" "}
                      {exp.expense_date}
                    </p>
                  </div>
                  <span className="font-extrabold text-rose-600 text-sm shrink-0">
                    {formatCurrency(exp.amount)}
                  </span>
                </div>
                {exp.notes && <p className="text-xs text-slate-500">{exp.notes}</p>}
                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <Button type="button" size="sm" variant="outline" onClick={() => openEdit(exp)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(exp.id)}
                    className="text-rose-600 border-rose-200"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    {t("common.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">{t("expenses.date")}</th>
                  <th className="px-4 py-3 text-left">{t("roomDetail.house")}</th>
                  <th className="px-4 py-3 text-left">{t("expenses.category")}</th>
                  <th className="px-4 py-3 text-left">{t("expenses.expenseTitle")}</th>
                  <th className="px-4 py-3 text-right">{t("expenses.amount")}</th>
                  <th className="px-4 py-3 text-right">{t("common.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp: Record<string, any>) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-700">{exp.expense_date}</td>
                    <td className="px-4 py-3 text-slate-700">{exp.house_name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {t(`expenses.categories.${exp.category || "other"}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{exp.title}</p>
                      {exp.notes && <p className="text-xs text-slate-500">{exp.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(exp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(exp.id)}
                          className="text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add / Edit Expense Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? t("expenses.editExpense") : t("expenses.addExpense")}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-3.5"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="exp-house">{t("roomDetail.house")}</Label>
                <select
                  id="exp-house"
                  value={formState.house}
                  onChange={(e) => setFormState({ ...formState, house: e.target.value })}
                  required
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm"
                >
                  {houses.map((h: Record<string, any>) => (
                    <option key={h.id} value={String(h.id)}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="exp-cat">{t("expenses.category")}</Label>
                <select
                  id="exp-cat"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm"
                >
                  {CATEGORY_KEYS.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`expenses.categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="exp-title">{t("expenses.expenseTitle")}</Label>
              <Input
                id="exp-title"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="e.g. NEA Main Meter Bill"
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="exp-amt">{t("expenses.amount")}</Label>
                <Input
                  id="exp-amt"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formState.amount}
                  onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                  placeholder="0"
                  required
                  className="mt-1 font-bold"
                />
              </div>
              <div>
                <Label htmlFor="exp-date">{t("expenses.date")}</Label>
                <Input
                  id="exp-date"
                  value={formState.expense_date}
                  onChange={(e) => setFormState({ ...formState, expense_date: e.target.value })}
                  required
                  className="mt-1 font-semibold"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="exp-notes">{t("expenses.notes")}</Label>
              <Input
                id="exp-notes"
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
