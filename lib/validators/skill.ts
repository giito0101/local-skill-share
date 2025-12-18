import { z } from "zod";

export const skillCategories = [
  { value: "ENGLISH", label: "英会話" },
  { value: "DOG_TRAINING", label: "犬のしつけ" },
  { value: "PC_SUPPORT", label: "PC サポート" },
  { value: "PHOTO", label: "写真撮影" },
  { value: "OTHER", label: "その他" },
] as const;

type SkillCategoryValue = (typeof skillCategories)[number]["value"];

/**
 * z.enum に渡すための「非空タプル」を作る
 * - values を string[] に潰さないのがポイント
 */
export const skillCategoryValues = skillCategories.map((c) => c.value) as [
  SkillCategoryValue,
  ...SkillCategoryValue[]
];

export const createSkillSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100),
  description: z.string().min(10, "説明は10文字以上にしてください").max(2000),
  price: z
    .string()
    .regex(/^\d+$/, "数値で入力してください")
    .transform((v) => Number(v))
    .refine((v) => v > 0, "0円より大きい値にしてください"),
  area: z.string().min(1, "エリアは必須です").max(100),

  // ✅ v4 は message の方が安定
  category: z.enum(skillCategoryValues, {
    message: "カテゴリを選択してください",
  }),
});

export const updateSkillSchema = createSkillSchema.extend({
  id: z.coerce.number().int().positive("不正なIDです"),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
