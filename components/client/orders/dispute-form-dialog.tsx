"use client";

import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ApiError } from "@/lib/api/http";
import { useCreateDispute } from "@/lib/hooks/use-disputes";
import { disputeFormSchema, type DisputeFormValues } from "@/lib/validation/dispute";
import type { Id } from "@/lib/api/types";

/**
 * Raise a dispute on an order. Moves the order to `disputed` until an admin
 * resolves it (Overview.md §Admin). Inline validation; toast on outcome.
 */
export function DisputeFormDialog({
  orderId,
  trigger,
}: {
  orderId: Id;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const createDispute = useCreateDispute();

  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: { reason: "", description: "" },
  });

  const onSubmit = (values: DisputeFormValues) => {
    createDispute.mutate(
      { order: orderId, ...values },
      {
        onSuccess: () => {
          toast.success("Dispute submitted");
          form.reset({ reason: "", description: "" });
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't submit dispute",
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise a dispute</DialogTitle>
          <DialogDescription>
            Tell us what went wrong. An admin will review and mediate.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Quality not as agreed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue in detail so the admin can help resolve it."
                      className="min-h-28"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={createDispute.isPending}
              >
                {createDispute.isPending ? "Submitting…" : "Submit dispute"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
