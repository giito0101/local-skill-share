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
