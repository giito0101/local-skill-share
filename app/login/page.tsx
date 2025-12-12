"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  // すでにログイン済みならリダイレクト
  if (session) {
    router.replace(callbackUrl);
    return null;
  }

  return (
    <div className="max-w-md mx-auto py-10 space-y-4">
      <h1 className="text-xl font-bold">ログイン</h1>
      <p className="text-sm text-gray-600">
        スキル投稿や予約にはログインが必要です。
      </p>

      <button
        className="border px-4 py-2 rounded"
        onClick={() => signIn("github", { callbackUrl })}
      >
        GitHubでログイン
      </button>
    </div>
  );
}
