"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {
  initialValues?: {
    q?: string;
    category?: string;
    area?: string;
  };
};

export function SkillSearchForm({ initialValues }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialValues?.q ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [area, setArea] = useState(initialValues?.area ?? "");

  useEffect(() => {
    // URL直打ちで変わったときなどの同期用（必須ではない）
    setQ(initialValues?.q ?? "");
    setCategory(initialValues?.category ?? "");
    setArea(initialValues?.area ?? "");
  }, [initialValues?.q, initialValues?.category, initialValues?.area]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (area) params.set("area", area);

    // 検索時は1ページ目に戻す
    params.set("page", "1");

    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setQ("");
    setCategory("");
    setArea("");
    router.push("/"); // クエリなし → 完全な「新着」状態
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 md:flex-row md:items-end"
    >
      <div className="flex-1 space-y-1">
        <label className="block text-sm font-medium">キーワード</label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="英会話、犬のしつけ など"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">カテゴリ</label>
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">すべて</option>
          <option value="language">語学</option>
          <option value="pet">ペット</option>
          <option value="it">ITサポート</option>
          {/* 必要に応じて増やす */}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">エリア</label>
        <input
          className="rounded-md border px-3 py-2 text-sm"
          placeholder="例: 新宿、世田谷 など"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          検索
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border px-4 py-2 text-sm text-muted-foreground"
        >
          クリア
        </button>
      </div>
    </form>
  );
}
