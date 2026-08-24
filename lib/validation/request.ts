import { z } from "zod";
import { APPAREL_TYPES } from "@/lib/labels";

/**
 * Design-request create/edit schema. This *is* the payload contract — the form
 * builds `FormData` from these fields at submit (the endpoint is multipart
 * because of `design_image`). Reference images are managed separately.
 */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const APPAREL_VALUES = APPAREL_TYPES.map((a) => a.value) as [
  string,
  ...string[],
];

/** A browser File under the size limit, or nothing. */
const optionalImage = z
  .custom<File>((v) => v instanceof File, "Expected a file")
  .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image must be 5 MB or smaller")
  .optional();

export const requestFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give the request a clear title (3+ characters)")
    .max(120, "Keep the title under 120 characters"),
  apparel_type: z.enum(APPAREL_VALUES, {
    message: "Pick an apparel type",
  }),
  quantity: z.coerce
    .number({ message: "Enter a quantity" })
    .int("Whole pieces only")
    .min(1, "At least 1 piece"),
  material: z
    .string()
    .trim()
    .max(120, "Keep material under 120 characters")
    .optional()
    .or(z.literal("")),
  sizes: z
    .string()
    .trim()
    .max(200, "Keep sizes under 200 characters")
    .optional()
    .or(z.literal("")),
  color_preferences: z
    .string()
    .trim()
    .max(200, "Keep colors under 200 characters")
    .optional()
    .or(z.literal("")),
  deadline: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(2000, "Keep the description under 2000 characters")
    .optional()
    .or(z.literal("")),
  design_image: optionalImage,
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;
