import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConversationView } from "./view";
import { requireSession } from "@/lib/require-session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params; // Next 16 / React 19 仕様

  const session = await requireSession({ callbackUrl: `/conversations/${id}` });

  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      reservation: {
        include: {
          skill: {
            select: { ownerId: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
  });

  // 会話がない or 参加者じゃない
  if (
    !conversation ||
    (conversation.requesterId !== userId && conversation.providerId !== userId)
  ) {
    notFound();
  }

  // ここで reservation の null を弾く
  if (!conversation.reservation || !conversation.reservation.skill) {
    notFound();
  }

  // 依頼側 = 予約をした人
  const requesterId = conversation.reservation.ownerId;
  // 提供側 = スキルの owner
  const providerId = conversation.reservation.skill.ownerId;

  // 念のため：どちらにも該当しなければ 404 にしても OK
  if (userId !== requesterId && userId !== providerId) {
    notFound();
  }

  const isRequester = userId === requesterId;
  const backHref = isRequester ? "/mypage" : "/reservations/my";

  return (
    <ConversationView
      conversationId={conversation.id}
      currentUserId={userId}
      messages={conversation.messages}
      backHref={backHref}
    />
  );
}
