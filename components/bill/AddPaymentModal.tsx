"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreatePaymentReceived } from "@/hooks/bills/useCreatePaymentReceived";
import { toast } from "@/components/ui/use-toast";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  received_date: z.date({ message: "A received date is required." }),
  remarks: z.string().optional(),
});

type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

interface AddPaymentModalProps {
  tenantId: string;
  onPaymentAdded: () => void;
}

export function AddPaymentModal({ tenantId, onPaymentAdded }: AddPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: createPayment, isPending } = useCreatePaymentReceived();

  const form = useForm<FormInput, object, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      remarks: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    try {
      await createPayment({
        tenant: tenantId,
        amount: values.amount,
        received_date: format(values.received_date, "yyyy-MM-dd"),
        remarks: values.remarks,
      });
      toast({
        title: "Payment added successfully!",
        description: "The payment has been recorded.",
      });
      form.reset();
      setIsOpen(false);
      onPaymentAdded();
    } catch (error) {
      toast({
        title: "Failed to add payment",
        description: "There was an error recording the payment. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to add payment:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
          <DialogDescription>
            Record a new payment received from the tenant.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={(field.value as number).toString()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="received_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Received Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Adding Payment..." : "Add Payment"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
