"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ProfileFormState } from "../actions";
import { updateProfileAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium border"
    >
      {pending ? "更新中..." : "プロフィールを更新"}
    </button>
  );
}

const initialState: ProfileFormState = { ok: false };

type Props = {
  defaultName: string;
  defaultBio: string | null;
  defaultImageUrl: string | null;
};

export function ProfileForm({
  defaultName,
  defaultBio,
  defaultImageUrl,
}: Props) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">名前</label>
        <input
          name="name"
          defaultValue={defaultName}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">自己紹介</label>
        <textarea
          name="bio"
          defaultValue={defaultBio ?? ""}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          アイコン画像 URL
        </label>
        <input
          name="imageUrl"
          defaultValue={defaultImageUrl ?? ""}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          ※ まずは URL 入力版で OK（後でアップロード機能に差し替え）
        </p>
      </div>

      {state.errors && (
        <ul className="text-sm text-red-600 space-y-1">
          {state.errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
      {state.ok && <p className="text-sm text-green-600">更新しました。</p>}

      <SubmitButton />
    </form>
  );
}
