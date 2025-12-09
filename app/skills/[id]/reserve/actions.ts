"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const reserveSchema = z.object({
  skillId: z.string(),
  date: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "日時が不正です"),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export async function reserveAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // 念のためここでもチェック
    redirect("/login");
  }

  const raw = {
    skillId: formData.get("skillId"),
    date: formData.get("date"),
    message: formData.get("message"),
  };

  const result = reserveSchema.safeParse(raw);
  if (!result.success) {
    // 本気でバリデーションメッセージ出したいなら useActionState と組み合わせる
    throw new Error("入力内容に誤りがあります");
  }

  const { skillId, date, message } = result.data;

  const skill = await prisma.skill.findUnique({
    where: { id: Number(skillId) },
  });

  if (!skill) {
    throw new Error("Skill not found");
  }

  await prisma.reservation.create({
    data: {
      skillId: Number(skillId),
      ownerId: session.user.id,
      date: new Date(date),
      message: message || null,
    },
  });

  // 完了したら詳細ページに戻す
  redirect(`/skills/${skillId}`);
}
