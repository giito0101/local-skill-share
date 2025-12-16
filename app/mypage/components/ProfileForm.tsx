"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ProfileFormState } from "../actions";
import { updateProfileAction } from "../actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    <form action={formAction} className="space-y-4">
      {/* 現在のアイコン表示（ここはそのままでもOK） */}
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden">
          {defaultImageUrl ? (
            <img
              src={defaultImageUrl}
              alt="アイコン"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No Image
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          現在のアイコンです。新しい画像をアップロードすると変更されます。
        </p>
      </div>

      {/* 名前 */}
      <div className="space-y-1">
        <Label htmlFor="name">名前</Label>
        <Input id="name" name="name" defaultValue={defaultName} />
      </div>

      {/* 自己紹介 */}
      <div className="space-y-1">
        <Label htmlFor="bio">自己紹介</Label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={defaultBio ?? ""}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {/* ★ 画像アップロード（任意）: Skill登録と同じスタイル */}
      <div className="space-y-1">
        <Label htmlFor="image">画像（任意）</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
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
