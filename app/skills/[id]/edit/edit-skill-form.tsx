"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSkillAction, type UpdateSkillState } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFirstError } from "@/lib/validators/skill/_utils";
import { skillCategories } from "@/lib/validators/skill/skill";

const initialState: UpdateSkillState = { ok: false, errors: {} as any };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "更新中..." : "保存する"}
    </Button>
  );
}

type Props = {
  id: number;
  defaultTitle: string;
  defaultDescription: string;
  defaultPrice: number; // DBがIntなら number
  defaultArea: string;
  defaultCategory: (typeof skillCategories)[number]["value"];
};

export function EditSkillForm({
  id,
  defaultTitle,
  defaultDescription,
  defaultPrice,
  defaultArea,
  defaultCategory,
}: Props) {
  const [state, formAction] = useActionState(updateSkillAction, initialState);

  // NewSkillForm と同じ形ならこう
  // const getError = (name: string) => (state as any).errors?.[name]?.[0];
  const getError = (name: string) => getFirstError(state.errors, name);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={id} />

      {/* タイトル */}
      <div className="space-y-1">
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" defaultValue={defaultTitle} />
        {getError("title") && (
          <p className="text-sm text-red-500">{getError("title")}</p>
        )}
      </div>

      {/* 説明 */}
      <div className="space-y-1">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultDescription}
          rows={5}
        />
        {getError("description") && (
          <p className="text-sm text-red-500">{getError("description")}</p>
        )}
      </div>

      {/* 料金 */}
      <div className="space-y-1">
        <Label htmlFor="price">料金（円）</Label>
        {/* schema が string を想定なら defaultValue は String に */}
        <Input
          id="price"
          name="price"
          type="number"
          min={0}
          defaultValue={defaultPrice}
        />
        {getError("price") && (
          <p className="text-sm text-red-500">{getError("price")}</p>
        )}
      </div>

      {/* エリア */}
      <div className="space-y-1">
        <Label htmlFor="area">対応エリア</Label>
        <Input id="area" name="area" defaultValue={defaultArea} />
        {getError("area") && (
          <p className="text-sm text-red-500">{getError("area")}</p>
        )}
      </div>

      {/* カテゴリ */}
      <div className="space-y-1">
        <Label>カテゴリ</Label>

        {/* ✅重要：Select は defaultValue を渡す */}
        <Select name="category" defaultValue={defaultCategory}>
          <SelectTrigger>
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            {skillCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {getError("category") && (
          <p className="text-sm text-red-500">{getError("category")}</p>
        )}
      </div>

      {(state as any).error && (
        <p className="text-sm text-red-500">{(state as any).error}</p>
      )}
      {state.ok && <p className="text-sm text-green-600">更新しました。</p>}

      <SubmitButton />
    </form>
  );
}
