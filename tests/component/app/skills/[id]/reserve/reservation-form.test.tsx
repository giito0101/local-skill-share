import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";

import { ReservationForm } from "@/app/skills/[id]/reserve/reservation-form";

// SubmitButton は別テストに分ける（ここではフォーム構造だけ見たい）
vi.mock("@/app/skills/[id]/reserve/SubmitButton", () => ({
  SubmitButton: () => <button type="submit">予約する</button>,
}));

// Server Action を直接呼ぶことはしないけど、import 解決のためにモックしておくと安全
vi.mock("@/app/skills/[id]/reserve/actions", () => ({
  reserveAction: vi.fn(),
}));

describe("ReservationForm", () => {
  it("renders fields with correct attributes", () => {
    render(<ReservationForm skillId="s1" />);

    // hidden skillId
    const hidden = screen.getByDisplayValue("s1") as HTMLInputElement;
    expect(hidden).toBeInTheDocument();
    expect(hidden.type).toBe("hidden");
    expect(hidden.name).toBe("skillId");

    // date required datetime-local
    const date = screen.getByLabelText("希望日時") as HTMLInputElement;
    expect(date).toBeInTheDocument();
    expect(date.type).toBe("datetime-local");
    expect(date.name).toBe("date");
    expect(date.required).toBe(true);

    // message textarea
    const message = screen.getByLabelText(
      "メッセージ（任意）"
    ) as HTMLTextAreaElement;
    expect(message).toBeInTheDocument();
    expect(message.name).toBe("message");
    expect(message.rows).toBe(4);

    // submit button exists
    expect(
      screen.getByRole("button", { name: "予約リクエストを送る" })
    ).toBeInTheDocument();
  });
});
