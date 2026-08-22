import { z } from "zod";

/** Two-way review after an order completes: rating (1–5) + optional comment. */
export const reviewFormSchema = z.object({
  rating: z.coerce
    .number({ message: "Pick a rating" })
    .int()
    .min(1, "Pick a rating")
    .max(5, "Max rating is 5"),
  comment: z
    .string()
    .trim()
    .max(1000, "Keep the comment under 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
