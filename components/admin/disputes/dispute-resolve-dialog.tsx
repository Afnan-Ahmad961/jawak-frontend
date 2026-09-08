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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/http";
import { useResolveDispute } from "@/lib/hooks/use-disputes";
import {
  disputeResolutionSchema,
  type DisputeResolutionValues,
} from "@/lib/validation/dispute-resolution";
import type { Id } from "@/lib/api/types";

const OUTCOME_ITEMS = [
  { value: "resolved", label: "Resolve (return order to active)" },
  { value: "rejected", label: "Reject" },
];

/**
 * Admin resolves or rejects a dispute with a written rationale. Resolving
 * returns the affected order to `active` and notifies the raiser.
 */
export function DisputeResolveDialog({
  disputeId,
  trigger,
}: {
  disputeId: Id;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const resolveDispute = useResolveDispute();

  const form = useForm<DisputeResolutionValues>({
    resolver: zodResolver(disputeResolutionSchema),
    defaultValues: { status: "resolved", resolution: "" },
  });

  const onSubmit = (values: DisputeResolutionValues) => {
    resolveDispute.mutate(
      { id: disputeId, ...values },
      {
        onSuccess: () => {
          toast.success(
            values.status === "resolved"
              ? "Dispute resolved"
              : "Dispute rejected",
          );
          form.reset({ status: "resolved", resolution: "" });
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't update dispute",
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve dispute</DialogTitle>
          <DialogDescription>
            Choose an outcome and record your reasoning. The person who raised it
            is notified.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <Select
                    items={OUTCOME_ITEMS}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an outcome" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OUTCOME_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the decision and any action taken."
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
              <Button type="submit" disabled={resolveDispute.isPending}>
                {resolveDispute.isPending ? "Saving…" : "Submit decision"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
