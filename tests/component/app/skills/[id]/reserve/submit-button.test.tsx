import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";

import { SubmitButton } from "@/app/skills/[id]/reserve/submit-button";

// react-dom の useFormStatus をモック
vi.mock("react-dom", async () => {
  const actual = await vi.importActual<any>("react-dom");
  return {
    ...actual,
    useFormStatus: vi.fn(),
  };
});

import { useFormStatus } from "react-dom";

describe("SubmitButton", () => {
  it("is enabled and shows normal label when not pending", () => {
    (useFormStatus as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pending: false,
    });

    render(<SubmitButton />);
    const btn = screen.getByRole("button", { name: "予約リクエストを送る" });
    expect(btn).toBeEnabled();
  });

  it("is disabled and shows loading label when pending", () => {
    (useFormStatus as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pending: true,
    });

    render(<SubmitButton />);
    const btn = screen.getByRole("button", { name: "送信中..." });
    expect(btn).toBeDisabled();
  });
});
