import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  bio: z.string().max(500, "自己紹介は500文字以内にしてください").optional(),
});

export const skillIdSchema = z.object({
  skillId: z.coerce.string().min(1, "不正なIDです"),
});

export const reservationSchema = z.object({
  reservationId: z.string(),
  intent: z.enum(["approve", "cancel"]),
});

// 純粋関数：FormData -> Zod入力
export function toProfileInput(formData: FormData) {
  return {
    name: formData.get("name"),
    bio: formData.get("bio"),
  };
}

export function zodIssuesToMessages(issues: { message: string }[]) {
  return issues.map((i) => i.message);
}
