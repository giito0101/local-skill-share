import { describe, it, expect } from "vitest";
import { statusLabel, formatReservationDate } from "./format.js";

describe("statusLabel", () => {
  it("maps status to Japanese labels", () => {
    expect(statusLabel("PENDING")).toBe("未確定");
    expect(statusLabel("CONFIRMED")).toBe("確定");
    expect(statusLabel("CANCELED")).toBe("キャンセル");
  });
});

describe("formatReservationDate", () => {
  it("formats in Asia/Tokyo as YYYY/MM/DD HH:mm", () => {
    // UTC 00:00 は Tokyo 09:00
    expect(formatReservationDate("2025-12-19T00:00:00.000Z")).toBe(
      "2025/12/19 09:00"
    );
  });

  it("returns empty string for invalid date", () => {
    expect(formatReservationDate("not-a-date")).toBe("");
  });

  it("accepts Date object", () => {
    const d = new Date("2025-12-19T00:00:00.000Z");
    expect(formatReservationDate(d)).toBe("2025/12/19 09:00");
  });
});
