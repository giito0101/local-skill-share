import { resolveLoginOutcome } from "@/app/login/logic";
import { describe, it, expect } from "vitest";

describe("resolveLoginOutcome", () => {
  it("returns error when res is nullish", () => {
    expect(resolveLoginOutcome(undefined, "/")).toEqual({
      kind: "error",
      message: "IDかパスワードが違います",
    });
  });

  it("returns error when ok is false", () => {
    expect(resolveLoginOutcome({ ok: false, url: "/x" }, "/")).toEqual({
      kind: "error",
      message: "IDかパスワードが違います",
    });
  });

  it("redirects to res.url when ok is true and url exists", () => {
    expect(resolveLoginOutcome({ ok: true, url: "/home" }, "/")).toEqual({
      kind: "redirect",
      url: "/home",
    });
  });

  it("redirects to callbackUrl when ok is true and url missing", () => {
    expect(resolveLoginOutcome({ ok: true }, "/cb")).toEqual({
      kind: "redirect",
      url: "/cb",
    });
  });
});
