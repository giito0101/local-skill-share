import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPageClient } from "@/app/login/login-page-client";

// next-auth/react を mock
const signInMock = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: any[]) => signInMock(...args),
}));

// validation と logic を mock（ここで「送信制御」だけに絞る）
const safeParseMock = vi.fn();
vi.mock("@/app/login/validation", () => ({
  loginSchema: {
    safeParse: (input: any) => safeParseMock(input),
  },
}));

const resolveLoginOutcomeMock = vi.fn();
vi.mock("@/app/login/logic", () => ({
  resolveLoginOutcome: (...args: any[]) => resolveLoginOutcomeMock(...args),
}));

describe("LoginPageClient (component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // location.href 書き換え対策
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("「テスト用 入力」ボタンで ID/PW がフォームに反映される", async () => {
    const user = userEvent.setup();
    render(<LoginPageClient callbackUrl="/" />);

    const fillButtons = screen.getAllByRole("button", { name: "入力" });
    // 上がID、下がPW（現状のDOM構造に依存）
    await user.click(fillButtons[0]);
    await user.click(fillButtons[1]);

    // input は label が htmlFor で紐づいてないので placeholder で取る
    expect(screen.getByPlaceholderText("例: test1")).toHaveValue("test1");
    expect(screen.getByPlaceholderText("例: test1-2025")).toHaveValue(
      "test1-2025"
    );
  });

  it("バリデーションNGなら signIn を呼ばず、エラーメッセージが表示される（DOM変化）", async () => {
    const user = userEvent.setup();
    safeParseMock.mockReturnValue({
      success: false,
      error: { issues: [{ message: "入力が不正です" }] },
    });

    render(<LoginPageClient callbackUrl="/" />);

    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(signInMock).not.toHaveBeenCalled();
    expect(screen.getByText("入力が不正です")).toBeInTheDocument();
  });

  it("バリデーションOKなら signIn が呼ばれる（送信制御）", async () => {
    const user = userEvent.setup();
    safeParseMock.mockReturnValue({
      success: true,
      data: { loginId: "test1", password: "test1-2025" },
    });

    signInMock.mockResolvedValue({ ok: true });

    resolveLoginOutcomeMock.mockReturnValue({
      kind: "success",
      url: "/",
    });

    render(<LoginPageClient callbackUrl="/" />);

    // 入力
    await user.type(screen.getByPlaceholderText("例: test1"), "test1");
    await user.type(
      screen.getByPlaceholderText("例: test1-2025"),
      "test1-2025"
    );

    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(signInMock).toHaveBeenCalledWith("credentials", {
      loginId: "test1",
      password: "test1-2025",
      callbackUrl: "/",
      redirect: false,
    });
  });

  it("signIn後に outcome が error の場合、エラー表示され遷移しない（DOM変化）", async () => {
    const user = userEvent.setup();
    safeParseMock.mockReturnValue({
      success: true,
      data: { loginId: "test1", password: "test1-2025" },
    });
    signInMock.mockResolvedValue({ ok: false });

    resolveLoginOutcomeMock.mockReturnValue({
      kind: "error",
      message: "IDかパスワードが違います",
    });

    render(<LoginPageClient callbackUrl="/" />);

    await user.type(screen.getByPlaceholderText("例: test1"), "test1");
    await user.type(
      screen.getByPlaceholderText("例: test1-2025"),
      "test1-2025"
    );
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(screen.getByText("IDかパスワードが違います")).toBeInTheDocument();
    expect(window.location.href).toBe("");
  });

  it("success の場合、window.location.href が更新される（送信制御）", async () => {
    const user = userEvent.setup();
    safeParseMock.mockReturnValue({
      success: true,
      data: { loginId: "test1", password: "test1-2025" },
    });
    signInMock.mockResolvedValue({ ok: true });

    resolveLoginOutcomeMock.mockReturnValue({
      kind: "success",
      url: "/mypage",
    });

    render(<LoginPageClient callbackUrl="/" />);

    await user.type(screen.getByPlaceholderText("例: test1"), "test1");
    await user.type(
      screen.getByPlaceholderText("例: test1-2025"),
      "test1-2025"
    );
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(window.location.href).toBe("/mypage");
  });
});
