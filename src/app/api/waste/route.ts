import {
  fetchNextWasteCollections,
  fetchWasteHouseNumbers,
  fetchWasteStreets,
} from "@/services/waste-api-service";
import { NextResponse } from "next/server";
import { z } from "zod";

const wasteQuerySchema = z.object({
  mode: z.enum(["streets", "houseNumbers", "next"]),
  streetId: z.coerce.number().int().positive().optional(),
  houseNumberId: z.coerce.number().int().nonnegative().optional(),
});

function toErrorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

async function handleStreetsMode(): Promise<NextResponse> {
  const streets = await fetchWasteStreets();
  return NextResponse.json({ streets });
}

async function handleHouseNumbersMode(streetId?: number): Promise<NextResponse> {
  if (!streetId) {
    return toErrorResponse(400, "streetId is required.");
  }

  const houseNumbers = await fetchWasteHouseNumbers(streetId);

  if (houseNumbers.length === 0) {
    return NextResponse.json({
      supportsHouseNumbers: false,
      houseNumbers: [{ id: 0, nr: "Alle Hausnummern" }],
    });
  }

  return NextResponse.json({ supportsHouseNumbers: true, houseNumbers });
}

async function handleNextMode(streetId?: number, houseNumberId?: number): Promise<NextResponse> {
  if (!streetId) {
    return toErrorResponse(400, "streetId is required.");
  }

  const data = await fetchNextWasteCollections(streetId, houseNumberId ?? null);
  return NextResponse.json(data);
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const parsedQuery = wasteQuerySchema.parse({
      mode: url.searchParams.get("mode"),
      streetId: url.searchParams.get("streetId") ?? undefined,
      houseNumberId: url.searchParams.get("houseNumberId") ?? undefined,
    });

    if (parsedQuery.mode === "streets") {
      return handleStreetsMode();
    }

    if (parsedQuery.mode === "houseNumbers") {
      return handleHouseNumbersMode(parsedQuery.streetId);
    }

    return handleNextMode(parsedQuery.streetId, parsedQuery.houseNumberId);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return toErrorResponse(400, "Invalid request parameters.");
    }

    return toErrorResponse(502, "Could not load waste data.");
  }
}
