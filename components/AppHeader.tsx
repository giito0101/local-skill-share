"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function AppHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-3">
        <Link href="/" className="font-bold">
          Local Skill Share
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/skills/new">スキル投稿</Link>
          <Link href="/reservations/my">予約一覧</Link>
          <Link href="/mypage">マイページ</Link>

          {status === "loading" ? null : session ? (
            <>
              <span className="text-gray-500" data-testid="login-user">
                {session.user?.name ?? "ログイン中"}
              </span>
              <Link href="/logout">ログアウト</Link>
            </>
          ) : (
            <Link href="/login">ログイン</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
