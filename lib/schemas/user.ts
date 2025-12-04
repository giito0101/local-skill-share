import { z } from "zod";

export const CreateUser = z.object({
  name: z.string().min(1, "名前は必須です"),
  // フォームからは文字列で届くので数値に変換して検証
  age: z.coerce.number().int().min(18, "18歳以上のみ"),
});

export type CreateUser = z.infer<typeof CreateUser>;
