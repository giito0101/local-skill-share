"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { validateSendMessage } from "./validation";

export async function sendMessageAction(formData: FormData) {
  // ① 入力バリデーション（FormData -> Zod）
  const parsed = validateSendMessage(formData);
  if (!parsed.success) {
    // Zod の最初のエラーメッセージを投げる
    const message = parsed.error.issues[0]?.message ?? "入力が不正です";
    throw new Error(message);
  }

  const { conversationId, body } = parsed.data;

  // ② 認証（callbackUrl は conversationId が確実に string になってから）
  const session = await requireSession({
    callbackUrl: `/conversations/${conversationId}`,
  });
  const userId = session.user.id;

  // ③ 権限チェック（会話参加者のみ）
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { requesterId: true, providerId: true },
  });

  if (!conv || (conv.requesterId !== userId && conv.providerId !== userId)) {
    throw new Error("会話へのアクセス権がありません");
  }

  // ④ 保存
  await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      body, // ← Zod で trim 済み & 空文字は弾かれてる
    },
  });

  // ⑤ リダイレクト
  redirect(`/conversations/${conversationId}`);
}
