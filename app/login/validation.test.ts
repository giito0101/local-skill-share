import { describe, it, expect } from "vitest";
import { loginSchema, getFirstLoginError } from "./validation";

describe("loginSchema", () => {
  it("fails when loginId is empty", () => {
    expect(getFirstLoginError({ loginId: "", password: "x" })).toBe(
      "IDを入力してください"
    );
  });

  it("fails when password is empty", () => {
    expect(getFirstLoginError({ loginId: "test1", password: "" })).toBe(
      "パスワードを入力してください"
    );
  });

  it("trims loginId and succeeds", () => {
    const r = loginSchema.safeParse({ loginId: "  test1  ", password: "pw" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.loginId).toBe("test1");
  });
});
