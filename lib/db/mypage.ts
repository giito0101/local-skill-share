import { prisma } from "@/lib/prisma";

// マイページ用のユーザーデータ取得
export async function getMyPageUser(userId: string) {
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: true, // 投稿スキル一覧
      reservations: true, // 依頼側の予約
      // bookings: true,   // ※User モデルに bookings リレーションを作ったら有効化
    },
  });

  return user;
}
