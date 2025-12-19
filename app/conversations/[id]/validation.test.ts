import { describe, it, expect } from "vitest";
import { validateSendMessage } from "./validation";

function fd(obj: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.set(k, v);
  return f;
}

describe("validateSendMessage", () => {
  it("valid: trims body and passes", () => {
    const res = validateSendMessage(
      fd({ conversationId: "c1", body: "  hi  " })
    );
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.conversationId).toBe("c1");
      expect(res.data.body).toBe("hi");
    }
  });

  it("invalid: empty body", () => {
    const res = validateSendMessage(fd({ conversationId: "c1", body: "   " }));
    expect(res.success).toBe(false);
  });

  it("invalid: missing conversationId", () => {
    const f = new FormData();
    f.set("body", "hi");
    const res = validateSendMessage(f);
    expect(res.success).toBe(false);
  });

  it("invalid: too long body", () => {
    const long = "a".repeat(1001);
    const res = validateSendMessage(fd({ conversationId: "c1", body: long }));
    expect(res.success).toBe(false);
  });
});
