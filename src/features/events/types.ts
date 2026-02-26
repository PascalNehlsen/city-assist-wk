import { z } from "zod";

export const eventItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string().date(),
  location: z.string().min(1),
});

export type EventItem = z.infer<typeof eventItemSchema>;
