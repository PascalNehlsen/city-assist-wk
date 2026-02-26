import dealsData from "@/features/deals/data/deals.json";
import { dealItemSchema, type DealItem } from "@/features/deals/types";
import { z } from "zod";

const dealsSchema = z.array(dealItemSchema);

export function listActiveDeals(referenceDate = new Date()): DealItem[] {
  const allDeals = dealsSchema.parse(dealsData);

  return allDeals.filter((deal) => new Date(deal.expiresAt) >= referenceDate);
}
