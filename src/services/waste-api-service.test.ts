import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);
vi.mock("server-only", () => ({}));

describe("fetchWasteCollectionDates", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.WASTE_API_BASE_URL = "https://waste.example.com";
    process.env.WASTE_API_KEY = "test-key";
    process.env.APP_BASE_URL = "http://localhost:3000";
    process.env.NODE_ENV = "test";
  });

  it("returns parsed collections on successful API response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        collections: [{ date: "2026-03-03", type: "Restmüll" }],
      }),
    });

    const { fetchWasteCollectionDates } = await import("@/services/waste-api-service");

    const result = await fetchWasteCollectionDates({
      street: "Telegrafenstraße",
      houseNumber: "10",
      postalCode: "42929",
      city: "Wermelskirchen",
    });

    expect(result.collections).toHaveLength(1);
    expect(result.collections[0]?.type).toBe("Restmüll");
  });

  it("throws for invalid API payload", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ collections: [{ foo: "bar" }] }),
    });

    const { fetchWasteCollectionDates } = await import("@/services/waste-api-service");

    await expect(
      fetchWasteCollectionDates({
        street: "Telegrafenstraße",
        houseNumber: "10",
        postalCode: "42929",
        city: "Wermelskirchen",
      }),
    ).rejects.toThrow();
  });
});
