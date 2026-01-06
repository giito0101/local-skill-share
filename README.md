# LOCAL-SKILL-SHARE

## Overview

スキル提供者とスキル要求者をマッチングするのが目的のプロジェクト。
地元やオンライン問わず、様々な人が気軽にスキルをシェアする。

## Tech Stack

- Framework: Next.js (推奨バージョン 16 以上)
- Auth: NextAuth.js (next-auth)
- DB: Prisma + Postgres（Neon）
- Styling: Tailwind CSS
- Validation: Zod
- Testing: Vitest / Testing Library / Playwright
- Language: TypeScript

## Getting Started

### 依存ライブラリのインストール

```sh
npm i
```

### 環境変数の設定例

.env / .env.local

- .env.local: ローカル開発用（gitignore 前提）
- .env: 開発環境共通

.env と.env.local の設定

```
APP_ENV=local
BLOB_PREFIX="local"
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?schema=public
BLOB_READ_WRITE_TOKEN=vercel_blob_********
NEXTAUTH_SECRET=xxx
BASE_URL=http://localhost:3000
```

注意：BLOB_READ_WRITE_TOKEN と DATABASE_URL は絶対にコミットしないでください

NEXTAUTH_SECRET の作成

```sh
openssl rand -base64 32
```

BLOB_READ_WRITE_TOKEN と DATABASE_URL は Vercel から取得します

[vercel](https://vercel.com/)

### ローカル環境セットアップ

local:setup: DB を初期化して seed を投入します（既存データは消えます）

```sh
npm run local:setup
```

### 実行

```sh
npm run dev
```

## Scripts

### DB テーブルデータ csv 出力

分析・検証用に DB の内容を csv で出力します（local 向け）

#### 前提条件

psql と python コマンドのインストールが必要

```sh
sh ./pg_dump/pg_dump.bash
```

出力先

```sh
ls ./pg_dump/export_csv/
```

### csv を xlsx に統合

```sh
sh ./pg_dump/pg_output_csv.bash
```

## Testing

### ユニットテスト or コンポーネントテスト

```sh
npm test
```

### E2E テスト

```sh
npx playwright test --workers=1
```

## Project Status

npm run dev 起動 OK

npm test OK

npx playwright test OK

GitHub Actions（CI）OK（main / PR）

## Notes

個人の学習用に作成。
設計・実装・テスト・CI まで一通りを一人で行うことを目的としています。
