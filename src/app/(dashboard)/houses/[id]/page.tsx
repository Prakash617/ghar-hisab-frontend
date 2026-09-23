"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { housesApi, roomsApi } from "@/lib/api";
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
import { toast } from "@/components/ui/toast";
import { compareRoomNumbers } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";

export default function HouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const houseId = parseInt(id);
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [deletingRoom, setDeletingRoom] = useState<any>(null);
  const [statusConfirmRoom, setStatusConfirmRoom] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ room_number: "", room_name: "" });
  const [editForm, setEditForm] = useState({ room_number: "", room_name: "" });

  const { data: house, isLoading: houseLoading } = useQuery({
    queryKey: ["house", houseId],
    queryFn: () => housesApi.get(houseId),
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms", houseId],
    queryFn: () => roomsApi.list(houseId),
  });

  const toggleMutation = useMutation({
    mutationFn: (roomId: number) => roomsApi.toggleStatus(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", houseId] });
      toast.success("Room status updated.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update room status.");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => roomsApi.create({ ...data, house: houseId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", houseId] });
      setIsAddOpen(false);
      setAddForm({ room_number: "", room_name: "" });
      toast.success("Room created successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create room.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ roomId, data }: { roomId: number; data: any }) => roomsApi.update(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", houseId] });
      setEditingRoom(null);
      toast.success("Room updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update room.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: number) => roomsApi.delete(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", houseId] });
      setDeletingRoom(null);
      toast.success("Room deleted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete room.");
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(addForm);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateMutation.mutate({ roomId: editingRoom.id, data: editForm });
    }
  };

  const openEdit = (room: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingRoom(room);
    setEditForm({ room_number: room.room_number, room_name: room.room_name || "" });
  };

  const openDelete = (room: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingRoom(room);
  };

  const isLoading = houseLoading || roomsLoading;

  const sortedRooms = [...(rooms || [])].sort((a: any, b: any) =>
    compareRoomNumbers(a.room_number, b.room_number)
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {t("houseDetail.roomsTitle")} - {house?.name}
          </h1>
          <p className="text-sm text-slate-500">{t("houseDetail.roomsSubtitle")}</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-600"
        >
          {t("houseDetail.addRoom")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
                <div className="flex gap-2 mt-4">
                  <div className="h-8 bg-slate-200 rounded flex-1"></div>
                  <div className="h-8 bg-slate-200 rounded flex-1"></div>
                </div>
              </div>
            ))
          : sortedRooms.map((room: any) => (
              <div
                key={room.id}
                onClick={() => router.push(`/rooms/${room.id}`)}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {room.room_name || `${t("rooms.room")} ${room.room_number}`}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t("houseDetail.roomNumberLabel")}: {room.room_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500">
                      {room.is_active ? t("houses.active") : t("houses.inactive")}
                    </p>
                    <label
                      className="mt-1 inline-flex cursor-pointer items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={room.is_active}
                        onChange={() => setStatusConfirmRoom(room)}
                      />
                      <span className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 relative"></span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>{t("houseDetail.status")}: {room.is_occupied ? t("houseDetail.occupied") : t("houseDetail.available")}</span>
                  <span>{t("houseDetail.electricityRate")}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => openEdit(room, e)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={(e) => openDelete(room, e)}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            ))}

        {!isLoading && rooms?.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            {t("houseDetail.noRoomsFound")}
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("houseDetail.addRoom")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <Label>{t("houseDetail.roomNumber")}</Label>
              <Input
                value={addForm.room_number}
                onChange={(e) => setAddForm({ ...addForm, room_number: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("houseDetail.roomName")}</Label>
              <Input
                value={addForm.room_name}
                onChange={(e) => setAddForm({ ...addForm, room_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={!!editingRoom} onOpenChange={() => setEditingRoom(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("houseDetail.editRoom")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label>{t("houseDetail.roomNumber")}</Label>
              <Input
                value={editForm.room_number}
                onChange={(e) => setEditForm({ ...editForm, room_number: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("houseDetail.roomName")}</Label>
              <Input
                value={editForm.room_name}
                onChange={(e) => setEditForm({ ...editForm, room_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingRoom(null)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Room Modal */}
      <Dialog open={!!deletingRoom} onOpenChange={() => setDeletingRoom(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("houseDetail.deleteRoom")}</DialogTitle>
            <p className="text-sm text-slate-600">
              {t("houseDetail.deleteRoomConfirm")}
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setDeletingRoom(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingRoom && deleteMutation.mutate(deletingRoom.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Status Confirmation Dialog */}
      <Dialog open={!!statusConfirmRoom} onOpenChange={() => setStatusConfirmRoom(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <DialogTitle>{t("roomDetail.confirmRoomStatusTitle")}</DialogTitle>
                <p className="text-xs text-slate-500 mt-1">
                  {statusConfirmRoom?.room_name || `${t("rooms.room")} ${statusConfirmRoom?.room_number}`}
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              {t("roomDetail.confirmRoomStatusDesc")}
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                disabled={toggleMutation.isPending}
                onClick={() => {
                  if (statusConfirmRoom) {
                    toggleMutation.mutate(statusConfirmRoom.id);
                    setStatusConfirmRoom(null);
                  }
                }}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
              >
                {toggleMutation.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("roomDetail.confirmChange")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusConfirmRoom(null)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
