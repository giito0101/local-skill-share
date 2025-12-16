import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  updateReservationStatusAction,
  startConversationAction,
} from "../my/actions";
import { ActionButtons } from "@/app/reservations/components/ActionButtons";
import { requireSession } from "@/lib/require-session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationDetailPage({ params }: PageProps) {
  // ✅ Promise になっている params を await する
  const { id } = await params;

  const session = await requireSession({ callbackUrl: `/reservations/${id}` });

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      skill: {
        select: {
          title: true,
          description: true,
          ownerId: true, // 👈 ここを追加
        },
      },
    },
  });

  // ✅ 「この予約がぶら下がっているスキルの持ち主」が自分かどうかで判定
  if (!reservation || reservation.skill.ownerId !== session.user.id) {
    notFound();
  }

  const isFuture = reservation.date >= new Date();

  return (
    <div className="max-w-xl mx-auto py-8 space-y-4">
      <h1 className="text-2xl font-semibold">予約詳細</h1>

      <div className="space-y-2">
        <div>
          <span className="font-semibold">日時: </span>
          {new Date(reservation.date).toLocaleString("ja-JP")}
        </div>
        <div>
          <span className="font-semibold">スキル: </span>
          {reservation.skill.title}
        </div>
        <div>
          <span className="font-semibold">メッセージ: </span>
          {reservation.message || "（なし）"}
        </div>
        <div>
          <span className="font-semibold">ステータス: </span>
          {reservation.status}
        </div>
      </div>

      <div className="flex gap-2">
        {/* 一覧に戻る */}
        <Button variant="outline" size="sm" asChild>
          <a href="/reservations/my">一覧に戻る</a>
        </Button>

        {/* チャットボタン */}
        <form action={startConversationAction} className="inline">
          <input type="hidden" name="reservationId" value={reservation.id} />
          <Button type="submit" variant="outline" size="sm">
            チャット
          </Button>
        </form>

        {/* 未来 & PENDING のときだけ承認/キャンセル表示 */}
        {isFuture && reservation.status === "PENDING" && (
          <form action={updateReservationStatusAction} className="inline">
            <input type="hidden" name="reservationId" value={reservation.id} />
            <ActionButtons />
          </form>
        )}
      </div>
    </div>
  );
}
