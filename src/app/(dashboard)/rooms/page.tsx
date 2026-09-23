"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi, housesApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
import { DoorOpen, Search, Filter, Home, CheckCircle2, AlertCircle, ArrowRight, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { compareRoomNumbers } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RoomsPage() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedHouse, setSelectedHouse] = useState<string>("all");
  const [occupancyFilter, setOccupancyFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ house: "", room_number: "", room_name: "" });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomsApi.list(),
  });

  const { data: houses } = useQuery({
    queryKey: ["houses"],
    queryFn: () => housesApi.list(),
  });

  const createRoomMutation = useMutation({
    mutationFn: (data: { house: number; room_number: string; room_name?: string }) =>
      roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      setIsAddOpen(false);
      setAddForm({ house: "", room_number: "", room_name: "" });
      toast.success(locale === "ne" ? "नयाँ कोठा सफलतापूर्वक थपियो।" : "Room added successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || (locale === "ne" ? "कोठा थप्न असफल।" : "Failed to add room."));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (roomId: number) => roomsApi.toggleStatus(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success(locale === "ne" ? "कोठाको स्थिति अद्यावधिक भयो।" : "Room status updated.");
    },
    onError: (err: any) => {
      toast.error(err?.message || (locale === "ne" ? "स्थिति परिवर्तन गर्न असफल।" : "Failed to toggle status."));
    },
  });

  const filteredRooms = rooms?.filter((room: any) => {
    const matchesSearch =
      (room.room_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (room.room_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (room.house_name || "").toLowerCase().includes(search.toLowerCase());

    const matchesHouse =
      selectedHouse === "all" || String(room.house) === String(selectedHouse);

    const matchesOccupancy =
      occupancyFilter === "all"
        ? true
        : occupancyFilter === "occupied"
        ? Boolean(room.is_occupied)
        : !room.is_occupied;

    return matchesSearch && matchesHouse && matchesOccupancy;
  });

  const sortedRooms = [...(filteredRooms || [])].sort((a: any, b: any) => {
    const cmp = compareRoomNumbers(a.room_number, b.room_number);
    if (cmp !== 0) {
      return sortOrder === "asc" ? cmp : -cmp;
    }
    return String(a.house_name || "").localeCompare(String(b.house_name || ""));
  });

  const totalCount = rooms?.length || 0;
  const occupiedCount = rooms?.filter((r: any) => r.is_occupied).length || 0;
  const vacantCount = totalCount - occupiedCount;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("rooms.title")}</h1>
          <p className="text-sm text-slate-500">
            {locale === "ne" ? "सबै घरहरूका कोठा विवरण र स्थिति।" : "Directory of all rooms across all houses."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick occupancy pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
              <DoorOpen className="h-3.5 w-3.5 text-slate-500" />
              {totalCount} {t("rooms.title")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              {occupiedCount} {t("roomDetail.occupied")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              {vacantCount} {t("roomDetail.vacant")}
            </span>
          </div>

          {/* Add Room button */}
          <button
            onClick={() => {
              const defaultHouse = selectedHouse !== "all" ? selectedHouse : (houses?.[0]?.id ? String(houses[0].id) : "");
              setAddForm({ house: defaultHouse, room_number: "", room_name: "" });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-600 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            {t("rooms.addRoom")}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={locale === "ne" ? "कोठा वा घर खोज्नुहोस्..." : "Search room number, name, house..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* House filter */}
          <select
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
            className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
          >
            <option value="all">{t("dashboard.allHouses")}</option>
            {houses?.map((h: any) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Occupancy filter */}
          <select
            value={occupancyFilter}
            onChange={(e) => setOccupancyFilter(e.target.value)}
            className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
          >
            <option value="all">{t("common.all")}</option>
            <option value="occupied">{t("roomDetail.occupied")}</option>
            <option value="vacant">{t("roomDetail.vacant")}</option>
          </select>

          {/* Sort order (Ascending by default) */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            title={t("rooms.sortBy")}
          >
            <option value="asc">{t("rooms.sortAsc")}</option>
            <option value="desc">{t("rooms.sortDesc")}</option>
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roomsLoading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-36"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            ))
          : sortedRooms.map((room: any) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="group block rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-display text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {room.room_name || `${t("rooms.room")} ${room.room_number}`}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Home className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{room.house_name || "-"}</span>
                      <span>&middot;</span>
                      <span>{t("houseDetail.roomNumberLabel")} #{room.room_number}</span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      room.is_occupied
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${room.is_occupied ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                    {room.is_occupied ? t("roomDetail.occupied") : t("roomDetail.vacant")}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-600 group-hover:text-sky-700 inline-flex items-center gap-1">
                    {t("rooms.viewDetails")}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {room.is_active ? t("houses.active") : t("houses.inactive")}
                  </span>
                </div>
              </Link>
            ))}

        {!roomsLoading && sortedRooms.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <DoorOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">{t("rooms.noRooms")}</p>
            <p className="mt-1 text-xs text-slate-500">{t("rooms.noRoomsDesc")}</p>
          </div>
        )}
      </div>

      {/* Add Room Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("rooms.addRoom")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!addForm.house) {
                toast.error(locale === "ne" ? "कृपया घर छान्नुहोस्।" : "Please select a house.");
                return;
              }
              if (!addForm.room_number.trim()) {
                toast.error(locale === "ne" ? "कोठा नम्बर आवश्यक छ।" : "Room number is required.");
                return;
              }
              createRoomMutation.mutate({
                house: parseInt(addForm.house),
                room_number: addForm.room_number.trim(),
                room_name: addForm.room_name.trim(),
              });
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("rooms.selectHouse")}</Label>
              <select
                value={addForm.house}
                onChange={(e) => setAddForm({ ...addForm, house: e.target.value })}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              >
                <option value="" disabled>-- {locale === "ne" ? "घर छान्नुहोस्" : "Select a house"} --</option>
                {houses?.map((h: any) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("rooms.roomNumber")}</Label>
              <Input
                value={addForm.room_number}
                onChange={(e) => setAddForm({ ...addForm, room_number: e.target.value })}
                placeholder="e.g. 101, 1, 2A"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">{t("rooms.roomName")}</Label>
              <Input
                value={addForm.room_name}
                onChange={(e) => setAddForm({ ...addForm, room_name: e.target.value })}
                placeholder="e.g. Ground Floor Front, Kirana"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={createRoomMutation.isPending}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
              >
                {createRoomMutation.isPending ? (
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
    </section>
  );
}
