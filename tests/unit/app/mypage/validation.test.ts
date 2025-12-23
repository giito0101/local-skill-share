import { describe, it, expect } from "vitest";
import {
  profileSchema,
  skillIdSchema,
  reservationSchema,
  toProfileInput,
  zodIssuesToMessages,
} from "../../../../app/mypage/validation";

describe("profileSchema", () => {
  it("fails when name is empty", () => {
    const r = profileSchema.safeParse({ name: "", bio: "hi" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(zodIssuesToMessages(r.error.issues)).toContain("名前は必須です");
    }
  });

  it("passes when name exists", () => {
    const r = profileSchema.safeParse({ name: "Taro", bio: "hi" });
    expect(r.success).toBe(true);
  });

  it("fails when bio is too long", () => {
    const bio = "a".repeat(501);
    const r = profileSchema.safeParse({ name: "Taro", bio });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(zodIssuesToMessages(r.error.issues)).toContain(
        "自己紹介は500文字以内にしてください"
      );
    }
  });

  it("passes when bio is omitted", () => {
    const r = profileSchema.safeParse({ name: "Taro" });
    expect(r.success).toBe(true);
  });
});

describe("toProfileInput", () => {
  it("maps FormData values", () => {
    const fd = new FormData();
    fd.set("name", "Hanako");
    fd.set("bio", "hello");

    expect(toProfileInput(fd)).toEqual({ name: "Hanako", bio: "hello" });
  });

  it("keeps missing fields as null", () => {
    const fd = new FormData();
    expect(toProfileInput(fd)).toEqual({ name: null, bio: null });
  });
});

describe("skillIdSchema", () => {
  it("fails when skillId is empty (min(1))", () => {
    const r = skillIdSchema.safeParse({ skillId: "" });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(zodIssuesToMessages(r.error.issues)).toContain("不正なIDです");
  });

  it("passes on non-number", () => {
    const r = skillIdSchema.safeParse({ skillId: "abc" });
    expect(r.success).toBe(true);
  });
});

describe("reservationSchema", () => {
  it("passes approve/cancel", () => {
    expect(
      reservationSchema.safeParse({ reservationId: "rid", intent: "approve" })
        .success
    ).toBe(true);

    expect(
      reservationSchema.safeParse({ reservationId: "rid", intent: "cancel" })
        .success
    ).toBe(true);
  });

  it("fails on invalid intent", () => {
    const r = reservationSchema.safeParse({
      reservationId: "rid",
      intent: "foo",
    });
    expect(r.success).toBe(false);
  });
});
