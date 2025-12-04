# ✅ 1. プロジェクト作成

```bash
# 新規作成（質問が出たら、TypeScript=Yes / App Router=Yes でOK）
npx create-next-app@latest .

# Zod を追加
npm i zod
```

> 以降は **my-zod-actions** ディレクトリの中で実行してください。

---

# ✅ 2. フォルダ作成 & ファイル配置（コピペでOK）

```bash
# フォルダ作成
mkdir -p lib/schemas app/users

# Zodスキーマ
cat > lib/schemas/user.ts <<'TS'
import { z } from "zod";

export const CreateUser = z.object({
  name: z.string().min(1, "名前は必須です"),
  // フォームからは文字列で届くので数値に変換して検証
  age: z.coerce.number().int().min(18, "18歳以上のみ"),
});

export type CreateUser = z.infer<typeof CreateUser>;
TS

# Server Action
cat > app/users/actions.ts <<'TS'
"use server";

import { revalidatePath } from "next/cache";
import { CreateUser } from "@/lib/schemas/user";

export type CreateUserState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createUserAction(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const raw = Object.fromEntries(formData);
  const result = CreateUser.safeParse(raw);

  if (!result.success) {
    const flat = result.error.flatten();
    return { ok: false, errors: flat.fieldErrors };
  }

  // ここでDB保存など（例）:
  // await db.user.create({ data: result.data });

  revalidatePath("/users");
  return { ok: true, message: "ユーザーを作成しました" };
}
TS

# フォームページ（Client Component）
cat > app/users/page.tsx <<'TSX'
"use client";

import { useActionState } from "react";
import { createUserAction, type CreateUserState } from "./actions";

const initialState: CreateUserState = { ok: false };

export default function UsersPage() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <main style={{ padding: 24, maxWidth: 480 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>ユーザー作成</h1>

      {state.ok && state.message && (
        <p role="status" style={{ color: "green" }}>{state.message}</p>
      )}

      <form action={formAction} style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 14 }}>名前</label>
          <input name="name" style={{ border: "1px solid #ccc", padding: 6, width: "100%" }} />
          {state.errors?.name?.[0] && (
            <p style={{ color: "crimson", fontSize: 12 }}>{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14 }}>年齢</label>
          <input
            name="age"
            inputMode="numeric"
            style={{ border: "1px solid #ccc", padding: 6, width: "100%" }}
          />
          {state.errors?.age?.[0] && (
            <p style={{ color: "crimson", fontSize: 12 }}>{state.errors.age[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          style={{ border: "1px solid #ccc", padding: "6px 12px", borderRadius: 6 }}
        >
          {pending ? "送信中..." : "作成"}
        </button>
      </form>
    </main>
  );
}
TSX

# トップページから /users に案内リンク（任意）
cat > app/page.tsx <<'TSX'
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Home</h1>
      <p><Link href="/users">/users へ</Link></p>
    </main>
  );
}
TSX
```

> `@/*` パスエイリアスは `create-next-app` 標準の `tsconfig.json` で有効です。そのまま動きます。

---

# ✅ 3. 起動

```bash
npm run dev
```

ブラウザで **[http://localhost:3000/users](http://localhost:3000/users)** を開く →

* 空のまま送信すると：**Zod のエラーメッセージ**がフィールド下に表示
* 例）`名前=Giito`, `年齢=20` で送信：**成功メッセージ**「ユーザーを作成しました」

---

# ✅ 4. 仕組みの要点（超短まとめ）

* `page.tsx`（client）：`useActionState` で **Server Action の返り値（エラー/成功）**を受け取って描画
* `actions.ts`（server）：`"use server"` + `Object.fromEntries(formData)` → **Zodで検証** → `flatten()` を UI へ返す
* `user.ts`（lib）：**Zodスキーマ**を UI/Server で共用（`coerce.number()` で文字列→数値）