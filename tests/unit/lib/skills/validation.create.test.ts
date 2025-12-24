import { createSkillSchema, skillCategories } from "@/lib/skills/validation";
import { describe, it, expect } from "vitest";

describe("createSkillSchema", () => {
  it("valid input passes and transforms price to number", () => {
    const input = {
      title: "英会話レッスン",
      description: "初心者向けです！!！！！！",
      price: "1000",
      area: "オンライン",
      category: "ENGLISH",
    };

    const result = createSkillSchema.parse(input);
    expect(result.price).toBe(1000);
    expect(typeof result.price).toBe("number");
  });

  it("title is required", () => {
    const res = createSkillSchema.safeParse({
      title: "",
      description: "1234567890",
      price: "100",
      area: "東京",
      category: "ENGLISH",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      const f = res.error.flatten().fieldErrors;
      expect(f.title?.[0]).toBe("タイトルは必須です");
    }
  });

  it("description must be at least 10 chars", () => {
    const res = createSkillSchema.safeParse({
      title: "t",
      description: "123456789", // 9
      price: "100",
      area: "東京",
      category: "ENGLISH",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      const f = res.error.flatten().fieldErrors;
      expect(f.description?.[0]).toBe("説明は10文字以上にしてください");
    }
  });

  it("price must be digits", () => {
    const res = createSkillSchema.safeParse({
      title: "t",
      description: "1234567890",
      price: "12a",
      area: "東京",
      category: "ENGLISH",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      const f = res.error.flatten().fieldErrors;
      expect(f.price?.[0]).toBe("数値で入力してください");
    }
  });

  it("price must be > 0", () => {
    const res = createSkillSchema.safeParse({
      title: "t",
      description: "1234567890",
      price: "0",
      area: "東京",
      category: "ENGLISH",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      const f = res.error.flatten().fieldErrors;
      expect(f.price?.[0]).toBe("0円より大きい値にしてください");
    }
  });

  it("category must be one of skillCategories values", () => {
    const res = createSkillSchema.safeParse({
      title: "t",
      description: "1234567890",
      price: "100",
      area: "東京",
      category: "INVALID",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      // z.enum のエラーメッセージは Zod の出し方に依存しやすいので
      // “メッセージ断定”より “categoryにエラーが入る”を見た方が安定。
      const f = res.error.flatten().fieldErrors;
      expect(f.category?.[0]).toBeTruthy();
    }
  });

  it("skillCategories values are unique", () => {
    const values = skillCategories.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
