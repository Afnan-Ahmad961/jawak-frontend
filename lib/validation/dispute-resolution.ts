import { z } from "zod";

/** Admin decision on a dispute: resolve or reject, with a written rationale. */
export const disputeResolutionSchema = z.object({
  status: z.enum(["resolved", "rejected"], {
    message: "Pick an outcome",
  }),
  resolution: z
    .string()
    .trim()
    .min(5, "Explain the decision (5+ characters)")
    .max(2000, "Keep it under 2000 characters"),
});

export type DisputeResolutionValues = z.infer<typeof disputeResolutionSchema>;
