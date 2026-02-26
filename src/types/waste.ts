import { z } from "zod";

export const wasteStreetSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
});

export const wasteHouseNumberSchema = z.object({
  id: z.number(),
  nr: z.string().min(1),
});

export const wasteFractionSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  farbeRgb: z.string().optional(),
});

export const wasteDistrictSchema = z
  .object({
    fraktionId: z.number().optional(),
    fraktiionId: z.number().optional(),
  })
  .passthrough();

const wasteDistrictListSchema = z
  .union([wasteDistrictSchema, z.array(wasteDistrictSchema)])
  .transform((value) => {
    return Array.isArray(value) ? value : [value];
  });

export const wastePickupSchema = z
  .object({
    datum: z.string().min(1),
    bezirk: wasteDistrictListSchema.default([]),
  })
  .passthrough();

export const wasteCollectionTypeSchema = z.object({
  type: z.string().min(1),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const wasteNextCollectionSchema = z.object({
  date: z.string().date(),
  pickups: z.array(wasteCollectionTypeSchema),
});

export const wasteNextCollectionsResponseSchema = z.object({
  nextCollections: z.array(wasteNextCollectionSchema),
});

export type WasteStreet = z.infer<typeof wasteStreetSchema>;
export type WasteHouseNumber = z.infer<typeof wasteHouseNumberSchema>;
export type WasteFraction = z.infer<typeof wasteFractionSchema>;
export type WastePickup = z.infer<typeof wastePickupSchema>;
export type WasteCollectionType = z.infer<typeof wasteCollectionTypeSchema>;
export type WasteNextCollection = z.infer<typeof wasteNextCollectionSchema>;
export type WasteNextCollectionsResponse = z.infer<
  typeof wasteNextCollectionsResponseSchema
>;
