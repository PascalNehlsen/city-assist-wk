import "server-only";

import { serverEnv } from "@/config/env.server";
import {
  type WasteAddress,
  type WasteApiResponse,
  wasteAddressSchema,
  wasteApiResponseSchema,
} from "@/types/waste";

function buildWasteQuery(address: WasteAddress): URL {
  const url = new URL("/collections", serverEnv.WASTE_API_BASE_URL);
  url.searchParams.set("street", address.street);
  url.searchParams.set("houseNumber", address.houseNumber);
  url.searchParams.set("postalCode", address.postalCode);
  url.searchParams.set("city", address.city);
  return url;
}

function assertWasteApiConfig(): void {
  if (!serverEnv.WASTE_API_BASE_URL || !serverEnv.WASTE_API_KEY) {
    throw new Error("Waste API configuration is missing.");
  }
}

export async function fetchWasteCollectionDates(
  addressInput: WasteAddress,
): Promise<WasteApiResponse> {
  assertWasteApiConfig();
  const address = wasteAddressSchema.parse(addressInput);
  const endpoint = buildWasteQuery(address);

  const response = await fetch(endpoint, {
    headers: {
      "x-api-key": serverEnv.WASTE_API_KEY!,
      accept: "application/json",
    },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`Waste API request failed with status ${response.status}.`);
  }

  const json: unknown = await response.json();
  return wasteApiResponseSchema.parse(json);
}
