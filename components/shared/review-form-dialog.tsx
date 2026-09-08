"use client";

import { useState } from "react";
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
import { StarRating } from "@/components/shared/star-rating";
import { ApiError } from "@/lib/api/http";
import { useCreateReview } from "@/lib/hooks/use-reviews";
import { reviewFormSchema, type ReviewFormValues } from "@/lib/validation/review";
import type { Id } from "@/lib/api/types";
import type { ReactElement } from "react";

/**
 * Review dialog used after an order completes. Rating is required (inline
 * validation); the outcome is a toast (AGENTS.md → Toasts). Shared because both
 * client and vendor review each other.
 */
export function ReviewFormDialog({
  orderId,
  trigger,
  title = "Leave a review",
  description = "Rate your experience and share any feedback.",
}: {
  orderId: Id;
  trigger: ReactElement;
  title?: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const createReview = useCreateReview();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = (values: ReviewFormValues) => {
    createReview.mutate(
      { order: orderId, ...values },
      {
        onSuccess: () => {
          toast.success("Review submitted");
          form.reset({ rating: 0, comment: "" });
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't submit review",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div>
                      <StarRating
                        value={field.value}
                        onChange={field.onChange}
                        size="lg"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How was the quality, communication, timeliness?"
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
              <Button type="submit" disabled={createReview.isPending}>
                {createReview.isPending ? "Submitting…" : "Submit review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
