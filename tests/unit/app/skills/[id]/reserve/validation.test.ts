import { describe, it, expect } from "vitest";
import {
  parseReserve,
  toReservationData,
} from "../../../../../../app/skills/[id]/reserve/validation";

describe("parseReserve", () => {
  it("valid input", () => {
    const r = parseReserve({
      skillId: "1",
      date: "2025-12-18T10:30",
      message: "hello",
    });
    expect(r.success).toBe(true);
  });

  it("invalid date", () => {
    const r = parseReserve({ skillId: "1", date: "nope", message: "" });
    expect(r.success).toBe(false);
  });

  it("message can be empty string", () => {
    const r = parseReserve({
      skillId: "1",
      date: "2025-12-18T10:30",
      message: "",
    });
    expect(r.success).toBe(true);
  });

  it("message too long", () => {
    const r = parseReserve({
      skillId: "1",
      date: "2025-12-18T10:30",
      message: "a".repeat(2001),
    });
    expect(r.success).toBe(false);
  });

  it("missing skillId should fail", () => {
    const r = parseReserve({ date: "2025-12-18T10:30", message: "" });
    expect(r.success).toBe(false);
  });
});

describe("toReservationData", () => {
  it("converts types and empty message to null", () => {
    const d = toReservationData({
      skillId: "12",
      date: "2025-12-18T10:30",
      message: "",
    });
    expect(d.skillId).toBe(12);
    expect(d.message).toBeNull();
    expect(d.date).toBeInstanceOf(Date);
  });
});
