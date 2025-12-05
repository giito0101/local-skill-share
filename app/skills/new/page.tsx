"use client";

import { useActionState } from "react";
import { createSkillAction, type FormState } from "./actions";

const initialState: FormState = { ok: false };

export default function NewSkillPage() {
  const [state, formAction] = useActionState(createSkillAction, initialState);

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">スキルを登録する</h1>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block mb-1">タイトル</label>
          <input name="title" className="border p-2 w-full" required />
        </div>

        <div>
          <label className="block mb-1">説明</label>
          <textarea name="description" className="border p-2 w-full" required />
        </div>

        <div>
          <label className="block mb-1">カテゴリ</label>
          <input name="category" className="border p-2 w-full" required />
        </div>

        <div>
          <label className="block mb-1">料金</label>
          <input
            type="number"
            name="price"
            className="border p-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1">対応エリア</label>
          <input name="area" className="border p-2 w-full" required />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          登録する
        </button>
      </form>
    </div>
  );
}
