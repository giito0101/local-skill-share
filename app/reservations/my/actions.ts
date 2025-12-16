"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/require-session";

export async function updateReservationStatusAction(formData: FormData) {
  const id = formData.get("reservationId");
  const intent = formData.get("intent"); // "approve" or "cancel"

  if (typeof id !== "string") {
    throw new Error("予約IDが不正です。");
  }
  if (intent !== "approve" && intent !== "cancel") {
    throw new Error("操作が不正です。");
  }

  const session = await requireSession({ callbackUrl: `/reservations/my` });

  const userId = session.user.id;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      skill: true,
    },
  });

  if (!reservation) {
    throw new Error("予約が見つかりません。");
  }

  // ★ ここがポイント：ホスト側（スキルの持ち主）チェック
  if (reservation.skill.ownerId !== userId) {
    throw new Error("操作権限がありません。");
  }

  const now = new Date();
  // キャンセルのときだけ「過去はNG」にする例
  if (intent === "cancel" && reservation.date < now) {
    throw new Error("過去の予約はキャンセルできません。");
  }

  const status = intent === "approve" ? "CONFIRMED" : "CANCELED";

  await prisma.reservation.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/reservations/my");
  redirect("/reservations/my?tab=future");
}

// 既存の cancelReservationAction の下とかに追加
export async function startConversationAction(formData: FormData) {
  const session = await requireSession({ callbackUrl: `/reservations/my` });

  const userId = session.user.id;

  const reservationId = formData.get("reservationId");
  if (typeof reservationId !== "string") {
    throw new Error("reservationId が不正です");
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      skill: {
        select: { ownerId: true },
      },
    },
  });

  if (!reservation || !reservation.skill) {
    throw new Error("予約またはスキルが見つかりません");
  }

  // ✅ 役割は常に Reservation / Skill から決める
  const requesterId = reservation.ownerId; // 予約した人
  const providerId = reservation.skill.ownerId; // スキル提供者

  // ログイン中ユーザーがそもそも関係者じゃない場合は弾く
  if (userId !== requesterId && userId !== providerId) {
    throw new Error("この予約の参加者ではありません");
  }

  // すでにこの予約に紐づく会話があればそれを使う
  let conversation = await prisma.conversation.findUnique({
    where: { reservationId: reservation.id },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        reservationId: reservation.id,
        requesterId,
        providerId,
      },
    });
  }

  redirect(`/conversations/${conversation.id}`);
}
