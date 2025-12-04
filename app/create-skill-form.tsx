import { createSkillAction } from "./actions";

export function CreateSkillForm() {
  return (
    <form action={createSkillAction} className="flex flex-col gap-2 max-w-lg">
      <input
        name="title"
        placeholder="タイトル（例：英会話 初級）"
        className="border p-2 rounded"
      />
      <textarea
        name="description"
        placeholder="説明（60分レッスンなど）"
        className="border p-2 rounded"
      />
      <input
        name="price"
        type="number"
        placeholder="料金（円）"
        className="border p-2 rounded"
      />
      <input
        name="area"
        placeholder="エリア（例：世田谷区）"
        className="border p-2 rounded"
      />
      <button className="border p-2 rounded bg-black text-white w-fit">
        追加
      </button>
    </form>
  );
}
