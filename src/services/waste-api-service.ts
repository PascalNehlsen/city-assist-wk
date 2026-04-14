import "server-only";

import { serverEnv } from "@/config/env.server";
import {
  type WasteCollectionType,
  type WasteFraction,
  type WasteHouseNumber,
  type WasteNextCollection,
  type WasteNextCollectionsResponse,
  type WastePickup,
  type WasteStreet,
  wasteFractionSchema,
  wasteHouseNumberSchema,
  wasteNextCollectionsResponseSchema,
  wastePickupSchema,
  wasteStreetSchema,
} from "@/types/waste";
import { z } from "zod";

const WASTE_REGION = "bav";
const WERMELSKIRCHEN_ORT_ID = 2813240;

const streetsResponseSchema = z.array(wasteStreetSchema);
const streetDetailSchema = z.object({
  id: z.number(),
  hausNrList: z.array(wasteHouseNumberSchema).default([]),
});
const fractionsResponseSchema = z.array(wasteFractionSchema);
const pickupsResponseSchema = z.array(wastePickupSchema);

function getWasteApiBaseUrl(): string {
  if (serverEnv.WASTE_API_BASE_URL) {
    return serverEnv.WASTE_API_BASE_URL.replace(/\/$/, "");
  }

  return `https://${WASTE_REGION}-abfallapp.regioit.de/abfall-app-${WASTE_REGION}/rest`;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`Waste API request failed with status ${response.status}.`);
  }

  return response.json();
}

function normalizeColorHex(color: string | undefined): string {
  if (!color) {
    return "#d1d5db";
  }

  const stripped = color.replace("#", "").trim();

  if (/^[0-9a-fA-F]{6}$/.test(stripped)) {
    return `#${stripped.toLowerCase()}`;
  }

  return "#d1d5db";
}

function buildFractionMap(fractions: WasteFraction[]): Map<number, WasteCollectionType> {
  const fractionMap = new Map<number, WasteCollectionType>();

  for (const fraction of fractions) {
    fractionMap.set(fraction.id, {
      type: fraction.name,
      colorHex: normalizeColorHex(fraction.farbeRgb),
    });
  }

  return fractionMap;
}

function getFractionIdFromPickup(pickup: WastePickup): number | null {
  for (const district of pickup.bezirk) {
    if (typeof district.fraktionId === "number") {
      return district.fraktionId;
    }

    if (typeof district.fraktiionId === "number") {
      return district.fraktiionId;
    }
  }

  return null;
}

function toTodayDateOnlyString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function groupPickupsByDate(
  pickups: WastePickup[],
  fractionMap: Map<number, WasteCollectionType>,
): WasteNextCollection[] {
  const today = toTodayDateOnlyString();
  const byDate = new Map<string, Map<string, WasteCollectionType>>();

  for (const pickup of pickups) {
    if (pickup.datum < today) {
      continue;
    }

    const fractionId = getFractionIdFromPickup(pickup);

    if (fractionId === null) {
      continue;
    }

    const fraction = fractionMap.get(fractionId);

    if (!fraction) {
      continue;
    }

    if (!byDate.has(pickup.datum)) {
      byDate.set(pickup.datum, new Map());
    }

    byDate.get(pickup.datum)?.set(fraction.type, fraction);
  }

  return [...byDate.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, pickupMap]) => {
      return {
        date,
        pickups: [...pickupMap.values()].toSorted((a, b) => a.type.localeCompare(b.type, "de")),
      };
    });
}

function buildPickupsUrl(streetId: number, houseNumberId: number | null, fractions: number[]): string {
  const baseUrl = getWasteApiBaseUrl();
  const params = new URLSearchParams();

  for (const fractionId of fractions) {
    params.append("fraktion", String(fractionId));
  }

  if (houseNumberId && houseNumberId > 0) {
    return `${baseUrl}/hausnummern/${houseNumberId}/termine?${params.toString()}`;
  }

  return `${baseUrl}/strassen/${streetId}/termine?${params.toString()}`;
}

function buildFractionsUrl(streetId: number, houseNumberId: number | null): string {
  const baseUrl = getWasteApiBaseUrl();

  if (houseNumberId && houseNumberId > 0) {
    return `${baseUrl}/hausnummern/${houseNumberId}/fraktionen`;
  }

  return `${baseUrl}/strassen/${streetId}/fraktionen`;
}

export async function fetchWasteStreets(): Promise<WasteStreet[]> {
  const baseUrl = getWasteApiBaseUrl();
  const json = await fetchJson(`${baseUrl}/orte/${WERMELSKIRCHEN_ORT_ID}/strassen`);
  const streets = streetsResponseSchema.parse(json);

  return streets.toSorted((a, b) => a.name.localeCompare(b.name, "de"));
}

export async function fetchWasteHouseNumbers(streetId: number): Promise<WasteHouseNumber[]> {
  const baseUrl = getWasteApiBaseUrl();
  const json = await fetchJson(`${baseUrl}/strassen/${streetId}`);
  const street = streetDetailSchema.parse(json);

  return street.hausNrList.toSorted((a, b) => a.nr.localeCompare(b.nr, "de"));
}

export async function fetchNextWasteCollections(
  streetId: number,
  houseNumberId: number | null,
): Promise<WasteNextCollectionsResponse> {
  const fractionsJson = await fetchJson(buildFractionsUrl(streetId, houseNumberId));
  const fractions = fractionsResponseSchema.parse(fractionsJson);

  if (fractions.length === 0) {
    return { nextCollections: [] };
  }

  const fractionIds = fractions.map((fraction) => fraction.id);
  const pickupsJson = await fetchJson(buildPickupsUrl(streetId, houseNumberId, fractionIds));
  const pickups = pickupsResponseSchema.parse(pickupsJson);

  const nextCollections = groupPickupsByDate(pickups, buildFractionMap(fractions));
  return wasteNextCollectionsResponseSchema.parse({ nextCollections });
}
