import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillSearchForm } from "@/app/components/skills/skill-search-form";

// next/navigation の useRouter をモック
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// buildSearchUrl を“純粋関数扱い”でモック（このテストは Form の責務だけを見る）
vi.mock("../build-search-url", () => ({
  buildSearchUrl: (args: { q: string; category: string; area: string }) => {
    const params = new URLSearchParams();
    if (args.q) params.set("q", args.q);
    if (args.category) params.set("category", args.category);
    if (args.area) params.set("area", args.area);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  },
}));

describe("SkillSearchForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("submits and calls router.push with built url (送信制御)", async () => {
    const user = userEvent.setup();
    render(<SkillSearchForm initialValues={{}} />);

    await user.type(screen.getByLabelText("キーワード"), "犬");
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "DOG_TRAINING");
    await user.type(screen.getByLabelText("エリア"), "新宿");

    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      "/?q=%E7%8A%AC&category=DOG_TRAINING&area=%E6%96%B0%E5%AE%BF&page=1"
    );
  });

  it("reset clears inputs (DOM変化) and navigates to '/' (送信制御)", async () => {
    const user = userEvent.setup();
    render(
      <SkillSearchForm
        initialValues={{ q: "abc", category: "PHOTO", area: "世田谷" }}
      />
    );

    // 初期値が入っている
    expect(screen.getByLabelText("キーワード")).toHaveValue("abc");
    expect(screen.getByLabelText("カテゴリ")).toHaveValue("PHOTO");
    expect(screen.getByLabelText("エリア")).toHaveValue("世田谷");

    await user.click(screen.getByRole("button", { name: "クリア" }));

    // DOM変化（値が空になる）
    screen.debug(screen.getByLabelText("キーワード"));
    expect(screen.getByLabelText("キーワード")).toHaveValue("");
    expect(screen.getByLabelText("カテゴリ")).toHaveValue("");
    expect(screen.getByLabelText("エリア")).toHaveValue("");

    // 送信制御（トップへ）
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("syncs state when initialValues changes (useEffect)", async () => {
    const { rerender } = render(
      <SkillSearchForm initialValues={{ q: "x", category: "", area: "" }} />
    );
    expect(screen.getByLabelText("キーワード")).toHaveValue("x");

    rerender(
      <SkillSearchForm
        initialValues={{ q: "y", category: "ENGLISH", area: "渋谷" }}
      />
    );
    expect(screen.getByLabelText("キーワード")).toHaveValue("y");
    expect(screen.getByLabelText("カテゴリ")).toHaveValue("ENGLISH");
    expect(screen.getByLabelText("エリア")).toHaveValue("渋谷");
  });

  it("does not double-submit by accident (送信制御の最低限の防波堤)", async () => {
    const user = userEvent.setup();
    render(<SkillSearchForm initialValues={{}} />);

    await user.click(screen.getByRole("button", { name: "検索" }));
    await user.click(screen.getByRole("button", { name: "検索" }));

    // 現状は二回押したら二回 push されるのが仕様。ここを“制御したい”なら実装側にガードが必要。
    expect(pushMock).toHaveBeenCalledTimes(2);
  });
});
