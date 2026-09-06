"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ApiError } from "@/lib/api/http";
import { usePlaceBid } from "@/lib/hooks/use-bids";
import { bidFormSchema, type BidFormValues } from "@/lib/validation/bid";
import type { Id } from "@/lib/api/types";

/** Place a bid on a request. One bid per request (Django enforces it). */
export function BidForm({ requestId }: { requestId: Id }) {
  const placeBid = usePlaceBid();

  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      proposed_price: undefined,
      delivery_days: undefined,
      message: "",
    },
  });

  const onSubmit = (values: BidFormValues) => {
    placeBid.mutate(
      { designRequest: requestId, ...values },
      {
        onSuccess: () => toast.success("Bid submitted"),
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't submit bid",
          ),
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="proposed_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step="0.01"
                    placeholder="e.g. 4200"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="delivery_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="e.g. 21"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Pitch your quality, materials, and why you're a good fit."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={placeBid.isPending}>
            {placeBid.isPending ? "Submitting…" : "Submit bid"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
