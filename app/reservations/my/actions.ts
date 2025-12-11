"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function cancelReservationAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") {
    throw new Error("予約IDが不正です。");
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation || reservation.ownerId !== userId) {
    throw new Error("予約が見つからないか、操作権限がありません。");
  }

  const now = new Date();
  if (reservation.date < now) {
    throw new Error("過去の予約はキャンセルできません。");
  }

  await prisma.reservation.update({
    where: { id },
    data: {
      status: "CANCELED",
    },
  });

  // 一覧を再フェッチ
  revalidatePath("/reservations/my");

  // 今いるページに戻したい場合は redirect 先をうまく調整してもOK
  redirect("/reservations/my?tab=future");
}

// 既存の cancelReservationAction の下とかに追加
export async function startConversationAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }
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
