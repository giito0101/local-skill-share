import { z } from "zod";

export const skillCategories = [
  { value: "ENGLISH", label: "英会話" },
  { value: "DOG_TRAINING", label: "犬のしつけ" },
  { value: "PC_SUPPORT", label: "PC サポート" },
  { value: "PHOTO", label: "写真撮影" },
  { value: "OTHER", label: "その他" },
] as const;

export const createSkillSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100),
  description: z.string().min(10, "説明は10文字以上にしてください").max(2000),
  price: z
    .string()
    .regex(/^\d+$/, "数値で入力してください")
    .transform((v) => Number(v))
    .refine((v) => v > 0, "0円より大きい値にしてください"),
  area: z.string().min(1, "エリアは必須です").max(100),
  category: z.enum(
    skillCategories.map((c) => c.value) as [string, ...string[]],
    { error: "カテゴリを選択してください" }
  ),
  // 画像は「必須にしない」例
  // 後で formData から処理するのでここでは扱わない or フラグにする
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
