// app/conversations/start/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type PageProps = {
  searchParams: Promise<{
    reservationId?: string;
  }>;
};

export default async function ConversationStartPage({
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/"); // or サインインページ
  }

  const { reservationId } = await searchParams;

  if (!reservationId) {
    redirect("/mypage"); // 変なアクセスはマイページへ戻す
  }

  // 1. 予約が自分に関係あるか確認（セキュリティ）
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      skill: { select: { ownerId: true } },
    },
  });

  if (!reservation) {
    redirect("/mypage");
  }

  const userId = session.user.id;
  const isSkillOwner = reservation.skill.ownerId === userId;
  const isRequester = reservation.ownerId === userId;

  if (!isSkillOwner && !isRequester) {
    // 自分に関係ない予約はNG
    redirect("/mypage");
  }

  // 2. 相手のユーザーIDを決める
  const otherUserId = isSkillOwner
    ? reservation.ownerId
    : reservation.skill.ownerId;

  // 3. 既存の会話があればそれを使う / なければ作る
  //   ※ Conversation モデルは例。実際のスキーマ名に合わせてね。
  let conversation = await prisma.conversation.findFirst({
    where: {
      reservationId: reservation.id, // 予約ごとに1つの会話、というイメージ
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        reservationId: reservation.id,
        requesterId: reservation.ownerId, // ★ 予約した人
        providerId: reservation.skill.ownerId, // ★ 教える側
      },
    });
  }

  // 4. 実際の会話ページへ飛ばす
  redirect(`/conversations/${conversation.id}`);
}
