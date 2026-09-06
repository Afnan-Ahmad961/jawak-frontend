import { z } from "zod";

/** Vendor's bid on a request: price + timeline + optional pitch. */
export const bidFormSchema = z.object({
  proposed_price: z.coerce
    .number({ message: "Enter a price" })
    .positive("Price must be greater than 0"),
  delivery_days: z.coerce
    .number({ message: "Enter delivery days" })
    .int("Whole days only")
    .min(1, "At least 1 day"),
  message: z
    .string()
    .trim()
    .max(1000, "Keep the message under 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type BidFormValues = z.infer<typeof bidFormSchema>;
