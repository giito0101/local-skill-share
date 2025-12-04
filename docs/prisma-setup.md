# 0) 新規プロジェクト（Next.js + TS）

```bash
# 任意のフォルダで
npx create-next-app@latest . --ts
```

---

# 1) Prisma を入れる（SQLite）

```bash
npm install -D prisma@latest
npm install @prisma/client@latest
# SQLiteドライバアダプタ
npm install @prisma/adapter-better-sqlite3 better-sqlite3
npx prisma init --datasource-provider sqlite
```

---

生成物：

* `prisma/schema.prisma`（スキーマ定義）
* `.env` に `DATABASE_URL="file:./prisma/dev.db"`（SQLiteのDBファイル）

# 2) 最小スキーマを書く

`prisma/schema.prisma` を編集して、**Skill**だけ作る（まずはUserなしでOK）。

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Skill {
  id          String   @id @default(cuid())
  title       String
  description String
  price       Int
  area        String
  createdAt   DateTime @default(now())
}
```

マイグレーション実行（DBファイル作成＆テーブル生成）：

```bash
npx prisma migrate dev --name init
npx prisma generate
```

> 成功すると `node_modules/@prisma/client` が生成され、型安全にDBが触れるようになる。

---

# 3) Prisma Client を使えるようにする（使い回し）

「開発中のHMRで二重生成されない」お作法のやつ。

`lib/prisma.ts`

```ts
// lib/prisma.ts
import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
    log: ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

```

---

# 4) “読む”を体験：RSCで一覧を出す

`app/page.tsx` を置き換え（**サーバーコンポーネント**でDB直読）。

```tsx
// app/page.tsx
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // 直にDB検索（RSCなので可能）
  const skills = await prisma.skill.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Skills</h1>
      <CreateSkillForm />
      <ul className="space-y-2">
        {skills.map((s: any) => (
          <li key={s.id} className="rounded border p-3">
            <div className="font-medium">
              {s.title} — ¥{s.price}
            </div>
            <div className="text-sm text-gray-600">{s.area}</div>
            <p className="mt-1">{s.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

// Client分割は後で。まずは見えることを優先
import { CreateSkillForm } from "./create-skill-form";

```

---

# 5) “書く”を体験：Server ActionでINSERT

Next.js の**Server Action**でフォーム→DB登録→即一覧反映。

`app/actions.ts`

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSkillAction(formData: FormData) {
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const price = Number(formData.get("price") || 0);
  const area = String(formData.get("area") || "");

  if (!title || !description || !area || price <= 0) {
    throw new Error("Invalid input");
  }

  await prisma.skill.create({
    data: { title, description, price, area },
  });

  // トップページのキャッシュを最新化（ISR/キャッシュ戦略に関わらず安全）
  revalidatePath("/");
}
```

`app/create-skill-form.tsx`

```tsx
import { createSkillAction } from "./actions";

export function CreateSkillForm() {
  return (
    <form action={createSkillAction} className="flex flex-col gap-2 max-w-lg">
      <input name="title" placeholder="タイトル（例：英会話 初級）" className="border p-2 rounded" />
      <textarea name="description" placeholder="説明（60分レッスンなど）" className="border p-2 rounded" />
      <input name="price" type="number" placeholder="料金（円）" className="border p-2 rounded" />
      <input name="area" placeholder="エリア（例：世田谷区）" className="border p-2 rounded" />
      <button className="border p-2 rounded bg-black text-white w-fit">追加</button>
    </form>
  );
}
```

起動して触る：

```bash
npm run dev
# http://localhost:3000 でフォーム入力→一覧に反映されるのを確認
```

> ここまでで「**RSCで読む**」「**Server Actionで書く**」「**revalidatePathで最新化**」の3点が手に入る。

---

# 6) データを覗く（Prisma Studio）

GUIでDB中身を確認できる。SQLiteでもそのまま使える。

```bash
npx prisma studio
# ブラウザで http://localhost:5555
```

---

# 7) 1件削除（オマケ：最小の削除アクション）

**P2002などの並行制御**は別でやるとして、雰囲気だけ。

`app/actions.ts` に追記：

```ts
export async function deleteSkillAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  await prisma.skill.delete({ where: { id } });
  revalidatePath('/');
}
```

`app/page.tsx` のリストで削除ボタン：

```tsx
<form action={deleteSkillAction}>
  <input type="hidden" name="id" value={s.id} />
  <button className="text-sm text-red-600 underline mt-2">
    削除
  </button>
</form>
```

---

# 8) よくある詰まり＆リセット

* **スキーマを変えたのに型が古い**
  → `npx prisma generate`（`migrate dev`にも含まれるが明示的に叩くと楽）
* **DBを初期化したい**
  → `npx prisma migrate reset`（全消し→再migrate→シードも自動実行可）
* **シードを入れたい**

  * `prisma/seed.ts` を作って `package.json` に

    ```json
    { "prisma": { "seed": "node --loader ts-node/esm prisma/seed.ts" } }
    ```

    のように設定 → `npx prisma db seed`
* **HMRで“Prisma Client 使い回し”の警告**
  → さっきの `lib/prisma.ts` の“グローバル使い回し”パターンで解決

---

  # 9) .gitignore

```gitignore
# Prisma SQLite DB
/prisma/dev.db
/prisma/*.db-journal
/prisma/*.db-wal
/prisma/*.db-shm
/app/generated/prisma
```