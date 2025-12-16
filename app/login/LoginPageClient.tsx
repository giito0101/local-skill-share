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
    <div className="max-w-sm mx-auto py-16 space-y-4">
      <button
        className="w-full border rounded px-4 py-2"
        onClick={() => signIn("github", { callbackUrl: "/" })}
      >
        GitHubでログイン
      </button>

      <button
        className="w-full border rounded px-4 py-2"
        onClick={() => signIn("demo", { callbackUrl: "/" })}
      >
        デモで入る（ゲスト）
      </button>
    </div>
  );
}
