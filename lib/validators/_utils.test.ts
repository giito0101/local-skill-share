import { describe, it, expect } from "vitest";
import { getFirstError } from "./_utils";

describe("getFirstError", () => {
  it("returns first error message for the field", () => {
    const errors = { title: ["必須です", "短すぎます"] };
    expect(getFirstError(errors, "title")).toBe("必須です");
  });

  it("returns undefined when field does not exist", () => {
    const errors = { title: ["必須です"] };
    expect(getFirstError(errors, "price")).toBeUndefined();
  });

  it("returns undefined when errors is undefined", () => {
    expect(getFirstError(undefined, "title")).toBeUndefined();
  });
});
