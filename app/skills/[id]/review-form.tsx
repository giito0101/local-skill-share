// app/skills/[id]/ReviewForm.tsx
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createReviewAction, type ReviewFormState } from "./actions";

type Props = {
  skillId: number; // ← Int に合わせる
};

const initialState: ReviewFormState = { ok: false };

export function ReviewForm({ skillId }: Props) {
  // skillId を事前バインドした Server Action を渡す
  const [state, formAction] = useActionState(
    createReviewAction.bind(null, skillId),
    initialState
  );

  return (
    <form action={formAction} className="space-y-4 mt-6">
      <h3 className="font-semibold">レビューを書く</h3>

      <div className="space-y-1">
        <Label>評価</Label>
        {/* Select は単純な name 属性を持てないので hidden + onValueChange */}
        <Select name="rating">
          <SelectTrigger>
            <SelectValue placeholder="★を選択" />
          </SelectTrigger>
          <SelectContent>
            {[5, 4, 3, 2, 1].map((v) => (
              <SelectItem key={v} value={String(v)}>
                {"★".repeat(v)}（{v}）
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="comment">コメント（任意）</Label>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="感想やよかった点・改善してほしい点など"
        />
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <Button type="submit">レビューを投稿する</Button>
    </form>
  );
}
