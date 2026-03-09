import { describe, expect, it } from "vitest";

import { formatWasteDate, parseWasteDate } from "@/features/waste/utils/waste-date";

describe("waste-date", () => {
  it("parses YYYY-MM-DD dates in local time", () => {
    const date = parseWasteDate("2026-01-05");

    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(5);
  });

  it("returns null for invalid calendar dates", () => {
    expect(parseWasteDate("2026-02-30")).toBeNull();
  });

  it("formats valid dates as German short weekday and day/month", () => {
    expect(formatWasteDate("2026-01-05")).toBe("Mo, 05.01.");
  });

  it("keeps invalid dates untouched", () => {
    expect(formatWasteDate("not-a-date")).toBe("not-a-date");
  });
});
