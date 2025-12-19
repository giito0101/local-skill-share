import { z } from "zod";

export const loginSchema = z.object({
  loginId: z.string().trim().min(1, "IDを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// 便利：最初のエラーメッセージだけ返す（純粋関数）
export function getFirstLoginError(input: unknown): string | undefined {
  const r = loginSchema.safeParse(input);
  if (r.success) return;
  const issues = r.error.issues;
  return issues[0]?.message;
}
