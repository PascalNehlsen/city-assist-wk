import { hasWasteApiConfig } from "@/config/env.server";
import { fetchWasteCollectionDates } from "@/services/waste-api-service";
import { wasteAddressSchema } from "@/types/waste";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(request: Request): Promise<NextResponse> {
  if (!hasWasteApiConfig()) {
    return NextResponse.json(
      { error: "Waste API is not configured." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const input = {
    street: url.searchParams.get("street") ?? "",
    houseNumber: url.searchParams.get("houseNumber") ?? "",
    postalCode: url.searchParams.get("postalCode") ?? "",
    city: url.searchParams.get("city") ?? "",
  };

  try {
    const address = wasteAddressSchema.parse(input);
    const data = await fetchWasteCollectionDates(address);
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Could not fetch waste collection dates." },
      { status: 502 },
    );
  }
}
