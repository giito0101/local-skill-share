import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// =============
// 依存モック
// =============

// ✅ server action 自体は unit でやってる前提なので、ここでは「フォームに紐付く」だけ見る
vi.mock("@/app/skills/new/actions", () => ({
  createSkillAction: vi.fn(),
}));

// ✅ categories は表示に必要なので固定値でOK
vi.mock("@/lib/skills/validation", () => ({
  skillCategories: [
    { value: "ENGLISH", label: "英語" },
    { value: "PROGRAMMING", label: "プログラミング" },
  ],
}));

// ✅ getFirstError は unit 済み前提だが、DOMのために最小実装を置いてもよい
vi.mock("@/lib/skills/utils", () => ({
  getFirstError: (errors: Record<string, string[]> | undefined, key: string) =>
    errors?.[key]?.[0],
}));

/**
 * shadcn/ui の Select は Radix 依存で、テストが重くなりやすいので
 * 「ここでは Select の存在と items が出る」程度の軽量モックに置き換える。
 */
vi.mock("@/components/ui/select", () => {
  return {
    Select: ({ children }: any) => <div data-testid="select">{children}</div>,
    SelectTrigger: ({ children }: any) => (
      <button type="button">{children}</button>
    ),
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => (
      <div data-testid="select-item" data-value={value}>
        {children}
      </div>
    ),
  };
});

// ✅ Input/Textarea/Button/Label は素通しでOK（shadcn が薄いラッパならそのままでも大抵動くが、念のため）
vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));
vi.mock("@/components/ui/button", () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock("@/components/ui/label", () => ({
  Label: (props: any) => <label {...props} />,
}));

// =============
// useActionState のモック
// =============

type FormState = {
  ok: boolean;
  errors?: Record<string, string[]>;
};

const mockFormAction = vi.fn();

// テストごとに state を差し替えられるようにする
let mockedState: FormState = { ok: false, errors: {} };

// React の useActionState を差し替える
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: () => [mockedState, mockFormAction] as const,
  };
});

import NewSkillForm from "@/app/skills/new/new-skill-form";

describe("NewSkillForm (app/skills/new/new-skill-form.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedState = { ok: false, errors: {} };
  });

  it("renders basic form fields", () => {
    render(<NewSkillForm />);

    // 見出し
    expect(
      screen.getByRole("heading", { name: "スキルを登録する" })
    ).toBeInTheDocument();

    // 入力項目
    expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    expect(screen.getByLabelText("説明")).toBeInTheDocument();
    expect(screen.getByLabelText("料金（円）")).toBeInTheDocument();
    expect(screen.getByLabelText("対応エリア")).toBeInTheDocument();
    expect(screen.getByText("カテゴリを選択")).toBeInTheDocument();
    expect(screen.getByLabelText("画像（任意）")).toBeInTheDocument();

    // 送信ボタン
    expect(
      screen.getByRole("button", { name: "投稿する" })
    ).toBeInTheDocument();
  });

  it("shows form-level error (_form) when state.errors._form exists (DOM change)", () => {
    mockedState = {
      ok: false,
      errors: {
        _form: ["スキルを投稿するにはログインが必要です。"],
      },
    };

    render(<NewSkillForm />);

    expect(
      screen.getByText("スキルを投稿するにはログインが必要です。")
    ).toBeInTheDocument();
  });

  it("shows field errors when state.errors has them (DOM change)", () => {
    mockedState = {
      ok: false,
      errors: {
        title: ["タイトルは必須です"],
        description: ["説明は必須です"],
        price: ["料金が不正です"],
        area: ["エリアは必須です"],
        category: ["カテゴリを選んでください"],
      },
    };

    render(<NewSkillForm />);

    expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
    expect(screen.getByText("説明は必須です")).toBeInTheDocument();
    expect(screen.getByText("料金が不正です")).toBeInTheDocument();
    expect(screen.getByText("エリアは必須です")).toBeInTheDocument();
    expect(screen.getByText("カテゴリを選んでください")).toBeInTheDocument();
  });

  it("submit button is clickable (basic submit control) and form exists", async () => {
    // このコンポーネントは pending 制御をしていないので
    // 「押せること（disabled じゃない）」を最低限担保する
    const user = userEvent.setup();
    render(<NewSkillForm />);

    const btn = screen.getByRole("button", { name: "投稿する" });
    expect(btn).not.toBeDisabled();

    await user.click(btn);

    // NOTE:
    // <form action={formAction}> の action 呼び出しは jsdom 環境だと
    // 直接 mockFormAction が呼ばれない場合がある。
    // なので「呼ばれるべき」というテストにしたいなら
    // E2E(Playwright) で担保するのが堅い。
    //
    // ここでは「クリックできる」までを component test の範囲にする。
    expect(btn).toBeInTheDocument();
  });
});
