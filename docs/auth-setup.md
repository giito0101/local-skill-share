# Auth.js（NextAuth v4）クイックスタート（GitHub ログイン）

## 0. 前提

- Next.js 14/15（App Router）
- Node 18+

```bash
# まだなら
npx create-next-app@latest .
```

## 1) パッケージ導入（安定版）

```bash
npm i next-auth          # ← v4（latest タグ）
npm i -D typescript@latest # 省略可。satisfiesを使わないので必須ではない
```

## 2) GitHub OAuth アプリ作成

GitHub → Settings → Developer settings → **OAuth Apps** → _New OAuth App_

- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
  発行された **Client ID / Client Secret** を控える。

## 3) 環境変数（.env.local）

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=（openssl rand -base64 32 の結果）
GITHUB_ID=xxxxxxxxxxxxxxxxxxxx
GITHUB_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 生成例：`openssl rand -base64 32`

## 4) ルートハンドラ（v4 の定番）

App Router でも v4 はこの形が安定です。

```
app/api/auth/[...nextauth]/route.ts
```

```ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // IDをセッションで使いたい“場合だけ”入れる（不要なら削除OK）
      if (token?.sub && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
// App Router では GET/POST をエクスポート
export { handler as GET, handler as POST };
```

## 5) セッションを読む（サーバーコンポーネント）

Server Component から **サーバー側で**セッション取得できます。

```tsx
// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions); // 未ログインなら null
  return (
    <main>
      <h1>Auth.js (v4) minimal</h1>
      {session ? (
        <p>Signed in as {session.user?.name ?? session.user?.email}</p>
      ) : (
        <p>Not signed in</p>
      )}
    </main>
  );
}
```

## 6) サインイン/アウト（クライアント最小UI）

クライアント側は `next-auth/react` を使います。
`SessionProvider` をルートに置くと `useSession()` が使えます（まずはボタンだけでもOK）。

```
app/providers.tsx
```

```tsx
"use client";
import { SessionProvider } from "next-auth/react";
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

```
app/layout.tsx
```

```tsx
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```
app/components/AuthButtons.tsx
```

```tsx
"use client";
import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return <button onClick={() => signIn("github")}>Sign in with GitHub</button>;
}
export function SignOutButton() {
  return <button onClick={() => signOut()}>Sign out</button>;
}
```

トップに配置：

```tsx
// app/page.tsx（追記）
import { SignInButton, SignOutButton } from "./components/AuthButtons";
// ...
{session ? <SignOutButton /> : <SignInButton />}
```

## 7) ルート保護（任意・最小）

**サーバー側ガード**がシンプルです（未ログインならリダイレクト）。

```tsx
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  return <div>Private area</div>;
}
```

> 中規模以上で一括保護したいなら v4 の `withAuth` ミドルウェアや `getToken()` を使う方法もありますが、まずは上の**ページ単位ガード**が確実。

## 8) 動作確認

```bash
npm run dev
# http://localhost:3000 → Sign in with GitHub → 成功後セッション表示
```