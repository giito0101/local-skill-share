"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";

export async function sendMessageAction(formData: FormData) {
  const conversationId = formData.get("conversationId");
  const body = (formData.get("body") ?? "").toString().trim();

  const session = await requireSession({
    callbackUrl: `/conversations/${conversationId}`,
  });
  const userId = session.user.id;

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
