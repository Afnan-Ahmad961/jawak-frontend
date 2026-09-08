import { z } from "zod";
import { productionStage } from "@/lib/validation/enums";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/** A production milestone: which stage, an optional note, an optional photo. */
export const productionUpdateFormSchema = z.object({
  stage: productionStage,
  note: z
    .string()
    .trim()
    .max(1000, "Keep the note under 1000 characters")
    .optional()
    .or(z.literal("")),
  image: z
    .custom<File>((v) => v instanceof File, "Expected a file")
    .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image must be 5 MB or smaller")
    .optional(),
});

export type ProductionUpdateFormValues = z.infer<
  typeof productionUpdateFormSchema
>;
