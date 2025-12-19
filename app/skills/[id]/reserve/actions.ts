"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/require-session";
import { parseReserve, toReservationData } from "@/lib/validators/reserve";

export async function reserveAction(formData: FormData) {
  const raw = {
    skillId: formData.get("skillId"),
    date: formData.get("date"),
    message: formData.get("message"),
  };

  const session = await requireSession({
    callbackUrl: `/skills/${raw.skillId}/reserve`,
  });

  const result = parseReserve(raw);
  if (!result.success) {
    // 本気でバリデーションメッセージ出したいなら useActionState と組み合わせる
    throw new Error("入力内容に誤りがあります");
  }

  const { skillId, date, message } = toReservationData(result.data);

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
