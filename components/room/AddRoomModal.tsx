"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateRoom } from "@/hooks/rooms/useCreateRoom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface AddRoomModalProps {
  houseId: number;
}

const formSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  tenant: z.object({
    name: z.string().min(1, "Tenant name is required"),
    contact: z.string().min(1, "Contact is required"),
    moveInDate: z.string().min(1, "Move-in date is required"),
    electricityPricePerUnit: z.string().min(1, "Price per unit is required"),
    water_price: z.string().min(1, "Water price is required"),
    rent_price: z.string().min(1, "Rent price is required"),
    waste_price: z.string().min(1, "Waste price is required"),
  }),
});

export function AddRoomModal({ houseId }: AddRoomModalProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createRoom, isPending } = useCreateRoom(String(houseId));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      room_number: "",
      tenant: {
        name: "",
        contact: "",
        moveInDate: new Date().toISOString().split("T")[0],
        electricityPricePerUnit: "15",
        water_price: "500",
        rent_price: "",
        waste_price: "100",
      },
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createRoom({ ...values, house: houseId }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Room and Tenant</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="room_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h3 className="text-lg font-semibold pt-4">Tenant Details</h3>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="tenant.name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="tenant.contact"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                        <Input placeholder="98********" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="tenant.moveInDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move-in Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="tenant.rent_price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Monthly Rent</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="tenant.electricityPricePerUnit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Electricity (per unit)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="tenant.water_price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Water Price (monthly)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="tenant.waste_price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Waste Management (monthly)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Room & Tenant"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}