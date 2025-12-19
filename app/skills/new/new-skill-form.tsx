"use client";

import { useActionState } from "react";
import { createSkillAction, type FormState } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getFirstError } from "@/lib/validators/_utils";
import { skillCategories } from "@/lib/validators/skill";

const initialState: FormState = { ok: false, errors: {} };

export default function NewSkillForm() {
  const [state, formAction] = useActionState(createSkillAction, initialState);

  const getError = (name: string) => getFirstError(state.errors, name);
  return (
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">スキルを登録する</h1>

      {getError("_form") && (
        <p className="text-sm text-red-500">{getError("_form")}</p>
      )}

      <form action={formAction} className="space-y-6">
        {/* タイトル */}
        <div className="space-y-1">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" placeholder="例: 英会話レッスン" />
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
            rows={5}
            placeholder="どんなスキルか、どんな人向けかを書いてください"
          />
          {getError("description") && (
            <p className="text-sm text-red-500">{getError("description")}</p>
          )}
        </div>

        {/* 料金 */}
        <div className="space-y-1">
          <Label htmlFor="price">料金（円）</Label>
          <Input id="price" name="price" type="number" min={0} />
          {getError("price") && (
            <p className="text-sm text-red-500">{getError("price")}</p>
          )}
        </div>

        {/* エリア */}
        <div className="space-y-1">
          <Label htmlFor="area">対応エリア</Label>
          <Input id="area" name="area" placeholder="例: 浦安 / オンライン" />
          {getError("area") && (
            <p className="text-sm text-red-500">{getError("area")}</p>
          )}
        </div>

        {/* カテゴリ（プルダウン） */}
        <div className="space-y-1">
          <Label>カテゴリ</Label>
          <Select name="category">
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

        {/* 画像アップロード（任意） */}
        <div className="space-y-1">
          <Label htmlFor="image">画像（任意）</Label>
          <Input id="image" name="image" type="file" accept="image/*" />
        </div>

        <Button type="submit">投稿する</Button>
      </form>
    </div>
  );
}
