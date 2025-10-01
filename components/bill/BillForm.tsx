"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { PaymentHistory, PaymentStatus } from "@/lib/types"

const FormSchema = z.object({
  type: z.string({
    required_error: "Please select a bill type.",
  }),
  billing_month: z.date({
    required_error: "A date is required.",
  }),
  amount: z.string().min(2, {
    message: "Amount must be at least 2 characters.",
  }),
  previous_units: z.number().optional(),
  current_units: z.number().optional(),
  status: z.string().optional(),
})

interface BillFormProps {
  lastBill: PaymentHistory | null
  roomId: number
}

export function BillForm({ lastBill, roomId }: BillFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      previous_units: lastBill?.current_units || 0,
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bill Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bill type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This is the type of bill that will be displayed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billing_month"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Billing Month</FormLabel>
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
              <FormDescription>
                The month for which the bill is generated.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1500" {...field} />
              </FormControl>
              <FormDescription>
                This is the amount of the bill.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="previous_units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Previous Units</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 100" {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))} />
              </FormControl>
              <FormDescription>
                The previous electricity unit reading.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="current_units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Units</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 200" {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))} />
              </FormControl>
              <FormDescription>
                The current electricity unit reading.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The current status of the bill.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
