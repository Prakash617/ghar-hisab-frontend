"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { housesApi } from "@/lib/api";
import { useTranslation } from "@/i18n/provider";
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
import { Plus, DoorOpen, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";

export default function HousesPage() {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_number: "",
  });

  const queryClient = useQueryClient();

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
      toast.success("House added successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create house.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => housesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      setEditingHouse(null);
      setFormData({ name: "", address: "", contact_number: "" });
      toast.success("House updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update house.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => housesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      toast.success("House deleted.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete house.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => housesApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      toast.success("House status updated.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to toggle status.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      contact_number: house.contact_number,
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("houses.title")}</h1>
          <p className="text-sm text-slate-500">{t("houses.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-200 hover:bg-sky-600"
        >
          {t("houses.addHouse")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {houses?.map((house: any) => (
          <div
            key={house.id}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/houses/${house.id}`} className="group">
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600">
                    {house.name}
                  </h2>
                  <p className="text-sm text-slate-500">{house.address}</p>
                </Link>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500">
                  {house.is_active ? t("houses.active") : t("houses.inactive")}
                </p>
                <label className="mt-1 inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={house.is_active}
                    onChange={() => toggleMutation.mutate(house.id)}
                  />
                  <span className="h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 relative"></span>
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">{t("rooms.title")}</p>
                <p className="font-semibold text-slate-900">{house.room_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("rooms.active")}</p>
                <p className="font-semibold text-slate-900">{house.occupied_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("rooms.vacant")}</p>
                <p className="font-semibold text-slate-900">{house.vacant_count || 0}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => openEdit(house)}
                className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                {t("common.edit")}
              </button>
              <button
                onClick={() => {
                  if (confirm(t("common.confirm"))) {
                    deleteMutation.mutate(house.id);
                  }
                }}
                className="flex-1 rounded-lg bg-rose-50 px-3 py-2 text-center text-sm font-medium text-rose-600 hover:bg-rose-100"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        ))}

        {houses?.length === 0 && !isLoading && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            {t("houses.noHouses")}
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("houses.addHouse")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t("houses.houseName")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("houses.address")}</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("houses.contactNumber")}</Label>
              <Input
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                {createMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="flex-1">
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingHouse} onOpenChange={() => setEditingHouse(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("houses.editHouse")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t("houses.houseName")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("houses.address")}</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("houses.contactNumber")}</Label>
              <Input
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingHouse(null)} className="flex-1">
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
