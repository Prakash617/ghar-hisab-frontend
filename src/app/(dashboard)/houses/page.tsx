"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { housesApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
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
  Plus,
  DoorOpen,
  Home,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Send,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { BatchReminderModal } from "@/components/notices/batch-reminder-modal";

export default function HousesPage() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<any>(null);
  const [deletingHouse, setDeletingHouse] = useState<any>(null);
  const [statusConfirmHouse, setStatusConfirmHouse] = useState<any>(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchHouseId, setBatchHouseId] = useState<string>("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_number: "",
  });

  const { data: houses, isLoading } = useQuery({
    queryKey: ["houses"],
    queryFn: () => housesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => housesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      setIsAddOpen(false);
      setFormData({ name: "", address: "", contact_number: "" });
      toast.success(locale === "ne" ? "घर सफलतापूर्वक थपियो।" : "House added successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || (locale === "ne" ? "घर थप्न असफल।" : "Failed to create house."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => housesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      setEditingHouse(null);
      setFormData({ name: "", address: "", contact_number: "" });
      toast.success(locale === "ne" ? "घर अद्यावधिक भयो।" : "House updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || (locale === "ne" ? "घर अद्यावधिक गर्न असफल।" : "Failed to update house."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => housesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      setDeletingHouse(null);
      toast.success(locale === "ne" ? "घर मेटाइयो।" : "House deleted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || (locale === "ne" ? "घर मेटाउन असफल।" : "Failed to delete house."));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => housesApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      setStatusConfirmHouse(null);
      toast.success(locale === "ne" ? "घरको स्थिति अद्यावधिक भयो।" : "House status updated.");
    },
    onError: (err: any) => {
      toast.error(err?.message || (locale === "ne" ? "स्थिति परिवर्तन गर्न असफल।" : "Failed to toggle status."));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(locale === "ne" ? "घरको नाम आवश्यक छ।" : "House name is required.");
      return;
    }
    if (!formData.address.trim()) {
      toast.error(locale === "ne" ? "ठेगाना आवश्यक छ।" : "Address is required.");
      return;
    }
    if (editingHouse) {
      updateMutation.mutate({ id: editingHouse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (house: any) => {
    setEditingHouse(house);
    setFormData({
      name: house.name,
      address: house.address,
      contact_number: house.contact_number || "",
    });
  };

  const filteredHouses = houses?.filter((house: any) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (house.name || "").toLowerCase().includes(q) ||
      (house.address || "").toLowerCase().includes(q) ||
      (house.contact_number || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? Boolean(house.is_active)
        : !house.is_active;

    return matchesSearch && matchesStatus;
  });

  const totalHouses = houses?.length || 0;
  const totalRooms = houses?.reduce((acc: number, h: any) => acc + (h.room_count || 0), 0) || 0;
  const occupiedRooms = houses?.reduce((acc: number, h: any) => acc + (h.occupied_count || 0), 0) || 0;
  const vacantRooms = houses?.reduce((acc: number, h: any) => acc + (h.vacant_count || 0), 0) || 0;

  return (
    <section className="space-y-4 sm:space-y-6 pb-8">
      {/* Header & KPI Strip */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t("houses.title")}</h1>
            <p className="text-xs sm:text-sm text-slate-500">{t("houses.subtitle")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setBatchHouseId("");
                setIsBatchOpen(true);
              }}
              className="inline-flex h-10 sm:h-9 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs sm:text-sm font-semibold text-amber-800 hover:bg-amber-100 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{t("batchNotice.buttonLabel")}</span>
            </button>
            <Link
              href="/bulk-billing"
              className="inline-flex h-10 sm:h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
            >
              <ClipboardList className="h-4 w-4 text-sky-600" />
              <span>{t("nav.bulkBilling")}</span>
            </Link>
            <button
              onClick={() => {
                setFormData({ name: "", address: "", contact_number: "" });
                setIsAddOpen(true);
              }}
              className="inline-flex h-10 sm:h-9 items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-700 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t("houses.addHouse")}</span>
            </button>
          </div>
        </div>

        {/* Stat Strip matching Rooms page layout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <div className="flex items-center gap-2.5 rounded-xl bg-white border border-slate-200/90 p-2.5 sm:px-3.5 shadow-2xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
              <Home className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-slate-900 leading-none tabular-nums">{totalHouses}</div>
              <div className="text-xs text-slate-600 font-medium truncate mt-0.5">{t("houses.totalHouses")}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80 p-2.5 sm:px-3.5 shadow-2xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 shrink-0">
              <DoorOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-sky-900 leading-none tabular-nums">{totalRooms}</div>
              <div className="text-xs text-sky-700 font-medium truncate mt-0.5">{t("rooms.title")}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-2.5 sm:px-3.5 shadow-2xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-emerald-900 leading-none tabular-nums">{occupiedRooms}</div>
              <div className="text-xs text-emerald-700 font-medium truncate mt-0.5">{t("roomDetail.occupied")}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 p-2.5 sm:px-3.5 shadow-2xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600"></span>
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-amber-900 leading-none tabular-nums">{vacantRooms}</div>
              <div className="text-xs text-amber-700 font-medium truncate mt-0.5">{t("roomDetail.vacant")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("houses.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 sm:min-h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-11 sm:min-h-9 flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
          >
            <option value="all">{t("common.all")}</option>
            <option value="active">{t("houses.active")}</option>
            <option value="inactive">{t("houses.inactive")}</option>
          </select>
        </div>
      </div>

      {/* Houses Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 rounded w-28"></div>
                <div className="h-4 bg-slate-200 rounded w-44"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            ))
          : filteredHouses?.map((house: any) => (
              <div
                key={house.id}
                className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top: Name & Active Status Toggle */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/rooms?house_id=${house.id}`}>
                        <h2 className="font-display text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                          {house.name}
                        </h2>
                      </Link>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{house.address}</span>
                      </div>
                      {house.contact_number && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{house.contact_number}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <button
                        type="button"
                        onClick={() => setStatusConfirmHouse(house)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all ${
                          house.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                        }`}
                        title={locale === "ne" ? "स्थिति परिवर्तन गर्न क्लिक गर्नुहोस्" : "Click to toggle status"}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            house.is_active ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        ></span>
                        {house.is_active ? t("houses.active") : t("houses.inactive")}
                      </button>
                    </div>
                  </div>

                  {/* Room Counts Pill Grid */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-2">
                      <p className="text-xs text-slate-600 font-medium">{t("rooms.title")}</p>
                      <p className="mt-0.5 font-display text-base font-bold text-slate-900 tabular-nums">
                        {house.room_count || 0}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-2">
                      <p className="text-xs text-emerald-700 font-medium">{t("roomDetail.occupied")}</p>
                      <p className="mt-0.5 font-display text-base font-bold text-emerald-800 tabular-nums">
                        {house.occupied_count || 0}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-2">
                      <p className="text-xs text-amber-700 font-medium">{t("roomDetail.vacant")}</p>
                      <p className="mt-0.5 font-display text-base font-bold text-amber-800 tabular-nums">
                        {house.vacant_count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/rooms?house_id=${house.id}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200 px-2.5 font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      <span>{t("houses.viewRooms")}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href={`/bulk-billing?house_id=${house.id}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{t("nav.bulkBilling")}</span>
                    </Link>
                  </div>

                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setBatchHouseId(String(house.id));
                        setIsBatchOpen(true);
                      }}
                      className="inline-flex h-9 sm:h-8 items-center gap-1 rounded-xl sm:rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 active:scale-95 transition-all cursor-pointer"
                      aria-label={t("batchNotice.buttonLabel")}
                      title={t("batchNotice.buttonLabel")}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{locale === "ne" ? "सूचना" : "Notify"}</span>
                    </button>
                    <button
                      onClick={() => openEdit(house)}
                      className="inline-flex h-9 sm:h-8 items-center gap-1.5 rounded-xl sm:rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => setDeletingHouse(house)}
                      className="inline-flex h-9 sm:h-8 items-center gap-1.5 rounded-xl sm:rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}

        {!isLoading && filteredHouses?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Home className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">{t("houses.noHouses")}</p>
            <p className="mt-1 text-xs text-slate-500">{t("houses.noHousesDesc")}</p>
          </div>
        )}
      </div>

      {/* Add House Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("houses.addHouse")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("houses.houseName")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sunrise Villa"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("houses.address")} *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Kathmandu, Baneshwor"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("houses.contactNumber")}</Label>
              <Input
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                placeholder="e.g. 9800000000"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("common.save")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit House Dialog */}
      <Dialog open={!!editingHouse} onOpenChange={() => setEditingHouse(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("houses.editHouse")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("houses.houseName")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("houses.address")} *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("houses.contactNumber")}</Label>
              <Input
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("common.save")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingHouse(null)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingHouse} onOpenChange={() => setDeletingHouse(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <DialogTitle>{t("houses.deleteHouse")}</DialogTitle>
                <p className="text-xs text-slate-500 mt-1">{deletingHouse?.name}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              {t("houses.confirmDelete")}
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deletingHouse && deleteMutation.mutate(deletingHouse.id)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {deleteMutation.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("common.delete")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingHouse(null)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={!!statusConfirmHouse} onOpenChange={() => setStatusConfirmHouse(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <DialogTitle>{locale === "ne" ? "स्थिति परिवर्तन पुष्टि गर्नुहोस्" : "Confirm Status Change"}</DialogTitle>
                <p className="text-xs text-slate-500 mt-1">{statusConfirmHouse?.name}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              {locale === "ne"
                ? `के तपाईं "${statusConfirmHouse?.name}" को स्थिति ${
                    statusConfirmHouse?.is_active ? "निष्क्रिय" : "सक्रिय"
                  } मा परिवर्तन गर्न निश्चित हुनुहुन्छ?`
                : `Are you sure you want to change the status of "${statusConfirmHouse?.name}" to ${
                    statusConfirmHouse?.is_active ? "Inactive" : "Active"
                  }?`}
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                disabled={toggleMutation.isPending}
                onClick={() => statusConfirmHouse && toggleMutation.mutate(statusConfirmHouse.id)}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
              >
                {toggleMutation.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("common.save")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusConfirmHouse(null)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BatchReminderModal
        open={isBatchOpen}
        onOpenChange={setIsBatchOpen}
        initialHouseId={batchHouseId}
      />
    </section>
  );
}
