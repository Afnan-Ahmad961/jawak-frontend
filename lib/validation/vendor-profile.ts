import { z } from "zod";

/**
 * Vendor profile create/edit. `specialties` is a comma-separated string in the
 * form; the component splits it into the string[] the JSONField expects.
 */
export const vendorProfileFormSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(2, "Enter your company name")
    .max(120, "Keep the name under 120 characters"),
  location: z
    .string()
    .trim()
    .max(120, "Keep the location under 120 characters")
    .optional()
    .or(z.literal("")),
  specialties: z
    .string()
    .trim()
    .max(300, "Keep specialties under 300 characters")
    .optional()
    .or(z.literal("")),
  // A plain optional number — the input's onChange sends `undefined` for a
  // blank field, so an empty capacity stays omitted rather than coercing to 0.
  capacity: z
    .number({ message: "Enter a number" })
    .int("Whole units only")
    .min(0, "Can't be negative")
    .optional(),
  bio: z
    .string()
    .trim()
    .max(2000, "Keep the bio under 2000 characters")
    .optional()
    .or(z.literal("")),
});

export type VendorProfileFormValues = z.infer<typeof vendorProfileFormSchema>;
