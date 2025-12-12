"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  callbackUrl: string;
};

export function LoginPageClient({ callbackUrl }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // すでにログイン済みなら飛ばす
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading") {
    return <p className="text-center mt-10">セッション確認中...</p>;
  }

  if (status === "authenticated") {
    // useEffect の redirect が走るまでの一瞬
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
