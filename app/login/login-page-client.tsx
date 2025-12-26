"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { loginSchema } from "./validation";
import { resolveLoginOutcome } from "./logic";

export function LoginPageClient({ callbackUrl }: { callbackUrl: string }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const EXAMPLE_ID = "test1";
  const EXAMPLE_PW = "test1-2025"; // ✅ 方針に合わせる

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const parsed = loginSchema.safeParse({ loginId, password });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "入力が不正です");
      return;
    }

    const res = await signIn("credentials", {
      ...parsed.data,
      callbackUrl,
      redirect: false,
    });

    const outcome = resolveLoginOutcome(res, callbackUrl);
    if (outcome.kind === "error") {
      setErr(outcome.message);
      return;
    }
    window.location.href = outcome.url;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-gray-900">ログイン</h1>
          <p className="mt-1 text-sm text-gray-600">
            IDとパスワードを入力してください
          </p>
        </div>

        {/* テスト用案内 */}
        <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-900">テスト用</p>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-gray-600">ID:</span>{" "}
              <code className="ml-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs">
                {EXAMPLE_ID}
              </code>
            </div>
            <button
              type="button"
              className="shrink-0 rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
              onClick={() => setLoginId(EXAMPLE_ID)}
            >
              入力
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-gray-600">PW:</span>{" "}
              <code className="ml-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs">
                {EXAMPLE_PW}
              </code>
            </div>
            <button
              type="button"
              className="shrink-0 rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
              onClick={() => setPassword(EXAMPLE_PW)}
            >
              入力
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label
            htmlFor="loginId"
            className="text-sm font-medium text-gray-900"
          >
            ID
          </label>
          <input
            id="loginId"
            name="loginId"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="例: test1"
            autoComplete="username"
          />

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-900"
            >
              パスワード
            </label>
            <input
              id="password"
              name="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="例: test1-2025"
              autoComplete="current-password"
            />
          </div>

          {err && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
            type="submit"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
