import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// ✅ requireSession をモック（認証チェックが呼ばれるかを見る）
vi.mock("@/lib/require-session", () => ({
  requireSession: vi.fn(),
}));

// ✅ NewSkillForm をモック（page の責務は「セッション要求して form を返す」だけ）
vi.mock("@/app/skills/new/new-skill-form", () => ({
  default: () => <div data-testid="new-skill-form" />,
}));

import NewSkillPage from "@/app/skills/new/page";
import { requireSession } from "@/lib/require-session";

describe("NewSkillPage (app/skills/new/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls requireSession with callbackUrl and renders NewSkillForm", async () => {
    const el = await NewSkillPage(); // Server Component: async function を実行して要素を得る
    render(el);

    expect(requireSession).toHaveBeenCalledTimes(1);
    expect(requireSession).toHaveBeenCalledWith({ callbackUrl: "/skills/new" });

    expect(screen.getByTestId("new-skill-form")).toBeInTheDocument();
  });
});
