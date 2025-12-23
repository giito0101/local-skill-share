import { describe, it, expect } from "vitest";
import { reviewSchema } from "../../../../../app/skills/[id]/validation";

describe("reviewSchema", () => {
  it("valid: rating '5' -> number 5", () => {
    const res = reviewSchema.parse({ rating: "5", comment: "" });
    expect(res.rating).toBe(5);
    expect(typeof res.rating).toBe("number");
  });

  it("invalid: rating outside 1-5", () => {
    const res = reviewSchema.safeParse({ rating: "6", comment: "" });
    expect(res.success).toBe(false);
  });

  it("valid: comment omitted", () => {
    const res = reviewSchema.parse({ rating: "3" });
    expect(res.comment).toBeUndefined();
  });

  it("valid: empty comment is allowed", () => {
    const res = reviewSchema.parse({ rating: "3", comment: "" });
    expect(res.comment).toBe("");
  });

  it("invalid: comment too long", () => {
    const res = reviewSchema.safeParse({
      rating: "3",
      comment: "a".repeat(2001),
    });
    expect(res.success).toBe(false);
  });
});
