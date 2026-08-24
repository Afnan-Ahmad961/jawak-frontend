"use client";

import { useEffect, useState, type ReactElement } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/http";
import { PRODUCTION_STAGE_STEPS } from "@/lib/labels";
import { PRODUCTION_STAGES } from "@/lib/api/types";
import { useAddProductionUpdate } from "@/lib/hooks/use-orders";
import {
  productionUpdateFormSchema,
  type ProductionUpdateFormValues,
} from "@/lib/validation/production-update";
import type { Id, ProductionStage } from "@/lib/api/types";

const STAGE_LABEL = new Map(
  PRODUCTION_STAGE_STEPS.map((s) => [s.value, s.label]),
);

/** Stages strictly after the current one — the only forward-valid choices. */
function forwardStages(currentStage?: ProductionStage | null): ProductionStage[] {
  const idx = currentStage ? PRODUCTION_STAGES.indexOf(currentStage) : -1;
  return PRODUCTION_STAGES.slice(idx + 1);
}

/**
 * Post a production milestone. Stages move forward only (Django enforces it), so
 * the selector offers only stages after the current one and defaults to the
 * next. Multipart (optional photo). Inline validation; toast on outcome.
 */
export function ProductionUpdateDialog({
  orderId,
  currentStage,
  trigger,
}: {
  orderId: Id;
  currentStage?: ProductionStage | null;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const addUpdate = useAddProductionUpdate(orderId);

  const stages = forwardStages(currentStage);
  const stageItems = stages.map((value) => ({
    value,
    label: STAGE_LABEL.get(value) ?? value,
  }));
  const defaultStage = stages[0];

  const form = useForm<ProductionUpdateFormValues>({
    resolver: zodResolver(productionUpdateFormSchema),
    defaultValues: { stage: defaultStage, note: "", image: undefined },
  });

  // Re-seed the form each time the dialog opens (and when the order advances),
  // so the default is always the *next* valid stage.
  const { reset } = form;
  useEffect(() => {
    if (open) reset({ stage: defaultStage, note: "", image: undefined });
  }, [open, defaultStage, reset]);

  const onSubmit = (values: ProductionUpdateFormValues) => {
    addUpdate.mutate(
      { stage: values.stage, note: values.note || undefined, image: values.image },
      {
        onSuccess: () => {
          toast.success("Production update posted");
          setOpen(false);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't post update",
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post a production update</DialogTitle>
          <DialogDescription>
            Move the order forward and keep the client informed.
          </DialogDescription>
        </DialogHeader>
        {stages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs">
              This order is at its final stage — no further updates to post.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select
                    items={stageItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stageItems.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Fabric sourced, cutting starts Monday."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel>Photo (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormDescription>A progress photo (max 5 MB).</FormDescription>
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
              <Button type="submit" disabled={addUpdate.isPending}>
                {addUpdate.isPending ? "Posting…" : "Post update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
