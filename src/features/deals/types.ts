import { z } from "zod";

export const dealItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  vendor: z.string().min(1),
  expiresAt: z.string().date(),
});

export type DealItem = z.infer<typeof dealItemSchema>;
