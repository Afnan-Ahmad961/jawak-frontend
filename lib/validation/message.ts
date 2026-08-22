import { z } from "zod";

/** A single chat message body. */
export const messageFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Type a message")
    .max(2000, "Keep messages under 2000 characters"),
});

export type MessageFormValues = z.infer<typeof messageFormSchema>;
