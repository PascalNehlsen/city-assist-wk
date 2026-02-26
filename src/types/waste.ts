import { z } from "zod";

export const wasteAddressSchema = z.object({
  street: z.string().min(1),
  houseNumber: z.string().min(1),
  postalCode: z.string().min(4),
  city: z.string().min(1),
});

export const wasteCollectionEntrySchema = z.object({
  date: z.string().date(),
  type: z.string().min(1),
});

export const wasteApiResponseSchema = z.object({
  collections: z.array(wasteCollectionEntrySchema),
});

export type WasteAddress = z.infer<typeof wasteAddressSchema>;
export type WasteCollection = z.infer<typeof wasteCollectionEntrySchema>;
export type WasteApiResponse = z.infer<typeof wasteApiResponseSchema>;
