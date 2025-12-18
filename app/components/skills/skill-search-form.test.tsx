import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillSearchForm } from "./skill-search-form";

// next/navigation をモック
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("SkillSearchForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("検索でrouter.pushに正しいURLを渡す", async () => {
    const user = userEvent.setup();
    render(
      <SkillSearchForm initialValues={{ q: "", category: "", area: "" }} />
    );

    await user.type(
      screen.getByPlaceholderText("英会話、犬のしつけ など"),
      "  犬  "
    );
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "DOG_TRAINING");
    await user.type(
      screen.getByPlaceholderText("例: 新宿、世田谷 など"),
      "新宿"
    );

    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/?q=%E7%8A%AC&category=DOG_TRAINING&area=%E6%96%B0%E5%AE%BF&page=1"
    );
  });

  it("クリアでrouter.push('/')し、入力も空になる", async () => {
    const user = userEvent.setup();
    render(
      <SkillSearchForm
        initialValues={{ q: "a", category: "PHOTO", area: "x" }}
      />
    );

    await user.click(screen.getByRole("button", { name: "クリア" }));

    expect(pushMock).toHaveBeenCalledWith("/");

    // 入力が空に戻っているか（最低限）
    expect(screen.getByPlaceholderText("英会話、犬のしつけ など")).toHaveValue(
      ""
    );
    expect(screen.getByLabelText("カテゴリ")).toHaveValue("");
    expect(screen.getByPlaceholderText("例: 新宿、世田谷 など")).toHaveValue(
      ""
    );
  });
});
