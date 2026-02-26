import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);
vi.mock("server-only", () => ({}));

describe("waste-api-service", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.WASTE_API_BASE_URL = "https://bav-abfallapp.regioit.de/abfall-app-bav/rest";
    process.env.APP_BASE_URL = "http://localhost:3000";
    process.env.NODE_ENV = "test";
  });

  it("loads and sorts streets", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 2, name: "Bergstraße" },
        { id: 1, name: "Adlerweg" },
      ],
    });

    const { fetchWasteStreets } = await import("@/services/waste-api-service");
    const result = await fetchWasteStreets();

    expect(result.map((item) => item.name)).toEqual(["Adlerweg", "Bergstraße"]);
  });

  it("loads house numbers for a street", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 123,
        hausNrList: [
          { id: 200, nr: "10" },
          { id: 100, nr: "1" },
        ],
      }),
    });

    const { fetchWasteHouseNumbers } = await import("@/services/waste-api-service");
    const result = await fetchWasteHouseNumbers(123);

    expect(result.map((item) => item.nr)).toEqual(["1", "10"]);
  });
});
