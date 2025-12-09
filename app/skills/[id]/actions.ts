"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const reviewSchema = z.object({
  rating: z
    .string()
    .regex(/^[1-5]$/, "1〜5で入力してください")
    .transform((v) => Number(v)),
  comment: z.string().max(2000).optional().or(z.literal("")),
});

export type ReviewFormState = {
  ok: boolean;
  error?: string;
};

export async function createReviewAction(
  skillId: number,
  prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  // 認証（auth or getServerSession、どちらでもOK）
  // const session = await auth();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { ok: false, error: "ログインが必要です" };
  }

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
