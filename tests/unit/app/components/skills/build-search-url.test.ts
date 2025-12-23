import { describe, it, expect } from "vitest";
import { buildSearchUrl } from "../../../../../app/components/skills/build-search-url";

describe("build-search-form", () => {
  it("qが空白だけならqは付けない", () => {
    expect(buildSearchUrl({ q: "   ", category: "", area: "" })).toBe(
      "/?page=1"
    );
  });

  it("qはtrimされて付与される", () => {
    expect(buildSearchUrl({ q: "  英会話  " })).toBe(
      "/?q=%E8%8B%B1%E4%BC%9A%E8%A9%B1&page=1"
    );
  });

  it("category/areaがあれば付与される", () => {
    const url = buildSearchUrl({
      q: "犬",
      category: "DOG_TRAINING",
      area: "新宿",
    });
    expect(url).toBe(
      "/?q=%E7%8A%AC&category=DOG_TRAINING&area=%E6%96%B0%E5%AE%BF&page=1"
    );
  });

  it("pageは常に1になる", () => {
    expect(buildSearchUrl({ q: "a" })).toContain("page=1");
  });
});
