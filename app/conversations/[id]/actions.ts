"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // v4 用
import { prisma } from "@/lib/prisma";

export async function sendMessageAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;
  const conversationId = formData.get("conversationId");
  const body = (formData.get("body") ?? "").toString().trim();

  if (typeof conversationId !== "string" || !conversationId) {
    throw new Error("conversationId が不正です");
  }
  if (!body) {
    return; // 空は無視
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conv || (conv.requesterId !== userId && conv.providerId !== userId)) {
    throw new Error("会話へのアクセス権がありません");
  }

  await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      body,
    },
  });

  redirect(`/conversations/${conversationId}`);
}
