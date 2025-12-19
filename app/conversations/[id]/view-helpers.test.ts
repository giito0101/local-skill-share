import { describe, it, expect } from "vitest";
import { isMine, displaySenderLabel } from "./view-helpers";

describe("view helpers", () => {
  it("isMine", () => {
    expect(isMine("u1", "u1")).toBe(true);
    expect(isMine("u2", "u1")).toBe(false);
  });

  it("displaySenderLabel", () => {
    expect(displaySenderLabel("Taro", false)).toBe("Taro");
    expect(displaySenderLabel(null, false)).toBe("（名無し）");
    expect(displaySenderLabel("   ", false)).toBe("（名無し）");
    expect(displaySenderLabel("Taro", true)).toBe("あなた");
  });
});
