// app/login/logic.ts など（置き場所は好みでOK）
export type SignInLikeResult =
  | { ok?: boolean; url?: string | null }
  | null
  | undefined;

export type LoginOutcome =
  | { kind: "error"; message: string }
  | { kind: "redirect"; url: string };

export function resolveLoginOutcome(
  res: SignInLikeResult,
  callbackUrl: string
): LoginOutcome {
  if (!res?.ok) {
    return { kind: "error", message: "IDかパスワードが違います" };
  }
  return { kind: "redirect", url: res.url ?? callbackUrl };
}
