import { z } from "zod";

/** Raise a dispute on an order: a short reason + a fuller description. */
export const disputeFormSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Give a short reason (3+ characters)")
    .max(120, "Keep the reason under 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Describe the problem (10+ characters)")
    .max(2000, "Keep the description under 2000 characters"),
});

export type DisputeFormValues = z.infer<typeof disputeFormSchema>;
