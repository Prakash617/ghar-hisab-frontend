
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BillItem, PaymentHistory } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentHistory } from "@/lib/bills";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  month: z.string().min(1, { message: "Month is required." }),
  previousUnits: z.number().min(0, { message: "Previous units cannot be negative." }),
  currentUnits: z.number().min(0, { message: "Current units cannot be negative." }),
  water: z.number().min(0, { message: "Water amount cannot be negative." }),
  rent: z.number().min(0, { message: "Rent amount cannot be negative." }),
});

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  lastBill: PaymentHistory | null;
}

const ELECTRICITY_RATE = 15;

export function AddBillModal({ isOpen, onClose, lastBill, roomId }: AddBillModalProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: lastBill?.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      previousUnits: lastBill?.currentUnits || 0,
      currentUnits: 0,
      water: lastBill?.water.amount || 0,
      rent: lastBill?.rent.amount || 0,
    },
  });

  const createPaymentHistoryMutation = useMutation({
    mutationFn: createPaymentHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentHistories", roomId] });
      toast.success("Bill added successfully!");
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to add bill.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newBillData = {
      room: roomId,
      month: values.month,
      previousUnits: values.previousUnits,
      currentUnits: values.currentUnits,
      electricity: (values.currentUnits - values.previousUnits) * ELECTRICITY_RATE,
      water: values.water,
      rent: values.rent,
      total: (values.currentUnits - values.previousUnits) * ELECTRICITY_RATE + values.water + values.rent,
      status: "Unpaid", // Default status
    };
    createPaymentHistoryMutation.mutate(newBillData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Bill</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => {
                console.log("Rendering month field", field);
                return (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="month" className="text-right">Month</FormLabel>
                    <FormControl>
                      <Input id="month" className="col-span-3" {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 offset-col-span-1" />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="previousUnits"
              render={({ field }) => {
                console.log("Rendering previousUnits field", field); // Added console.log
                return (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="previousUnits" className="text-right">Previous Units</FormLabel>
                    <FormControl>
                      <Input id="previousUnits" type="number" className="col-span-3" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                    </FormControl>
                    <FormMessage className="col-span-4 offset-col-span-1" />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="currentUnits"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel htmlFor="currentUnits" className="text-right">Current Units</FormLabel>
                  <FormControl>
                    <Input id="currentUnits" type="number" className="col-span-3" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                  </FormControl>
                  <FormMessage className="col-span-4 offset-col-span-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="water"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel htmlFor="waterAmount" className="text-right">Water Amount</FormLabel>
                  <FormControl>
                    <Input id="waterAmount" type="number" className="col-span-3" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                  </FormControl>
                  <FormMessage className="col-span-4 offset-col-span-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rent"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel htmlFor="rentAmount" className="text-right">Rent Amount</FormLabel>
                  <FormControl>
                    <Input id="rentAmount" type="number" className="col-span-3" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                  </FormControl>
                  <FormMessage className="col-span-4 offset-col-span-1" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Bill</Button>
            </DialogFooter>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  );
}
