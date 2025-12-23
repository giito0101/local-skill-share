import { describe, it, expect } from "vitest";

import { getFirstError, FieldErrors } from "@/lib/skills/utils";
import { createSkillSchema, updateSkillSchema } from "@/lib/skills/validation";

describe("createSkillSchema", () => {
  it("valid input parses and transforms price to number", () => {
    const input = {
      title: "テスト",
      description: "0123456789", // 10文字
      price: "1000",
      area: "東京",
      category: "ENGLISH",
    };

    const parsed = createSkillSchema.parse(input);
    expect(parsed.price).toBe(1000);
    expect(typeof parsed.price).toBe("number");
  });

  it("rejects price that is not digits", () => {
    const res = createSkillSchema.safeParse({
      title: "テスト",
      description: "0123456789",
      price: "10.5",
      area: "東京",
      category: "ENGLISH",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.price?.[0]).toBe(
        "数値で入力してください"
      );
    }
  });

  it("rejects price 0", () => {
    const res = createSkillSchema.safeParse({
      title: "テスト",
      description: "0123456789",
      price: "0",
      area: "東京",
      category: "ENGLISH",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.price?.[0]).toBe(
        "0円より大きい値にしてください"
      );
    }
  });

  it("rejects invalid category", () => {
    const res = createSkillSchema.safeParse({
      title: "テスト",
      description: "0123456789",
      price: "1000",
      area: "東京",
      category: "FOO",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.category?.[0]).toBe(
        "カテゴリを選択してください"
      );
    }
  });
});

describe("updateSkillSchema", () => {
  it("coerces id from string", () => {
    const parsed = updateSkillSchema.parse({
      id: "1",
      title: "テスト",
      description: "0123456789",
      price: "1000",
      area: "東京",
      category: "ENGLISH",
    });
    expect(parsed.id).toBe("1");
  });

  it("rejects invalid id", () => {
    const res = updateSkillSchema.safeParse({
      id: "",
      title: "テスト",
      description: "0123456789",
      price: "1000",
      area: "東京",
      category: "ENGLISH",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.id?.[0]).toBe("不正なIDです");
    }
  });
});

describe("getFirstError", () => {
  it("returns first message", () => {
    const errors: FieldErrors = { title: ["A", "B"] };
    expect(getFirstError(errors, "title")).toBe("A");
  });

  it("returns undefined when missing", () => {
    const errors: FieldErrors = {};
    expect(getFirstError(errors, "title")).toBeUndefined();
    expect(getFirstError(undefined, "title")).toBeUndefined();
  });
});
