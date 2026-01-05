"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { buildSearchUrl } from "./build-search-url";

type Props = {
  initialValues?: { q?: string; category?: string; area?: string };
};

type FormState = { q: string; category: string; area: string };

const EMPTY: FormState = { q: "", category: "", area: "" };

export function SkillSearchForm({ initialValues }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() => ({
    q: initialValues?.q ?? "",
    category: initialValues?.category ?? "",
    area: initialValues?.area ?? "",
  }));

  useEffect(() => {
    setForm({
      q: initialValues?.q ?? "",
      category: initialValues?.category ?? "",
      area: initialValues?.area ?? "",
    });
  }, [initialValues?.q, initialValues?.category, initialValues?.area]);

  const { q, category, area } = form;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildSearchUrl({ q, category, area }));
  };

  const handleReset = () => {
    setForm(EMPTY);
    router.push("/");
  };

  const CATEGORY_LABEL: Record<string, string> = {
    ENGLISH: "語学",
    DOG_TRAINING: "犬のしつけ",
    PC_SUPPORT: "PCサポート",
    PHOTO: "写真",
    OTHER: "その他",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 md:flex-row md:items-end"
    >
      <div className="flex-1 space-y-1">
        <label htmlFor="skill-q" className="block text-sm font-medium">
          キーワード
        </label>
        <input
          id="skill-q"
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="英会話、犬のしつけ など"
          value={q}
          onChange={(e) => setForm((p) => ({ ...p, q: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="skill-category" className="block text-sm font-medium">
          カテゴリ
        </label>
        <select
          id="skill-category"
          className="rounded-md border px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
        >
          <option value="">すべて</option>
          <option value="ENGLISH">{CATEGORY_LABEL.ENGLISH}</option>
          <option value="DOG_TRAINING">{CATEGORY_LABEL.DOG_TRAINING}</option>
          <option value="PC_SUPPORT">{CATEGORY_LABEL.PC_SUPPORT}</option>
          <option value="PHOTO">{CATEGORY_LABEL.PHOTO}</option>
          <option value="OTHER">{CATEGORY_LABEL.OTHER}</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="skill-area" className="block text-sm font-medium">
          エリア
        </label>
        <input
          id="skill-area"
          className="rounded-md border px-3 py-2 text-sm"
          placeholder="例: 新宿、世田谷 など"
          value={area}
          onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
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
