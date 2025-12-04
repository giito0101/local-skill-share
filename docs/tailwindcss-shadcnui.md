# クイックチュートリアル（新規 or 既存の Next.js 14/15）

## 1) 依存を入れる

```bash
# プロジェクト直下で
npm i -D tailwindcss @tailwindcss/postcss postcss
```

Tailwind v4 は PostCSS プラグインを `@tailwindcss/postcss` で読み込みます。([tailwindcss.com][1])

---

## 2) グローバル CSS に Tailwind を読み込む

`app/globals.css`（または `src/app/globals.css`）の**先頭**に追記：

```css
@import "tailwindcss";
```

v4 はこれだけでユーティリティが使えます。必要になったときだけ設定ファイルを追加する流れです。([tailwindcss.com][1])

---

## 3) app/layout.tsx で globals.css を読み込む

app/layout.tsx の先頭あたりに これがあるか確認

```ts
import "./globals.css";
```

もしなければ追加してください。

---

## 4) shadcn/ui を初期化

CLI を走らせて、トークンや `cn` ユーティリティ、CSS 変数などを自動設定します。

```bash
npx shadcn@latest init
# 既存プロジェクトでもOK。対話で Next.js を検出できない場合は手動セットアップガイドが提示されます
```

（公式の `init` コマンド。React/Next のバージョン次第で peer deps の質問が出たら指示どおりに進めばOK）([ui.shadcn.com][2])

### メモ（Tailwind v4 と shadcn/ui）

shadcn/ui は Tailwind v4 用のアップグレード手順を提供しています。基本は「v4 ガイドに従い、CSS 変数などを更新」だけで使えます。([ui.shadcn.com][3])

---

## 5) コンポーネントを追加

例：Button と Card を入れる。

```bash
npx shadcn@latest add button card
```

これで `components/ui/button.tsx` などが生成され、即 `className="..."` で使えます。([ui.shadcn.com][4])

---

## 6) 動作テスト（最小ページ）

```tsx
// app/page.tsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">shadcn/ui + Tailwind v4</h1>
      <Button>Click me</Button>
    </main>
  );
}
```

```bash
npm run dev
```

ブラウザで表示されればOK。