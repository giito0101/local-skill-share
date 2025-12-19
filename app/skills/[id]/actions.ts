"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/require-session";
import { reviewSchema } from "@/lib/validators/review";

export type ReviewFormState = {
  ok: boolean;
  error?: string;
};

export async function createReviewAction(
  skillId: number,
  prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await requireSession({
    callbackUrl: `/skills/${skillId}/reserve`,
  });

  // スキル存在チェック
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) {
    return { ok: false, error: "スキルが見つかりません" };
  }

  // Zod でバリデーション
  const raw = {
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  };

  const result = reviewSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, error: "入力内容に誤りがあります" };
  }

  const { rating, comment } = result.data;

  // レビュー作成（ownerId に注意）
  await prisma.review.create({
    data: {
      skillId: skill.id,
      ownerId: session.user.id, // ← schema の ownerId に合わせる
      rating,
      comment: comment || null,
    },
  });

  // このスキルの詳細ページを再取得
  revalidatePath(`/skills/${skillId}`);

  return { ok: true };
}
