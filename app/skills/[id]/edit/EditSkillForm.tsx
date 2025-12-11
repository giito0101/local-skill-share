"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSkillAction, type UpdateSkillState } from "./actions";

const initialState: UpdateSkillState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium border"
    >
      {pending ? "更新中..." : "保存する"}
    </button>
  );
}

type Props = {
  id: number;
  defaultTitle: string;
  defaultDescription: string;
};

export function EditSkillForm({ id, defaultTitle, defaultDescription }: Props) {
  const [state, formAction] = useActionState(updateSkillAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />

      <div>
        <label className="block text-sm font-medium mb-1">タイトル</label>
        <input
          name="title"
          defaultValue={defaultTitle}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">説明</label>
        <textarea
          name="description"
          defaultValue={defaultDescription}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.ok && <p className="text-xs text-green-600">更新しました。</p>}

      <SubmitButton />
    </form>
  );
}
