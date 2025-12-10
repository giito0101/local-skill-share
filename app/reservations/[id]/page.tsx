import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { cancelReservationAction } from "../my/actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationDetailPage({ params }: PageProps) {
  // ✅ Promise になっている params を await する
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      skill: { select: { title: true, description: true } },
    },
  });

  if (!reservation || reservation.ownerId !== session.user.id) {
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
        <Button variant="outline" asChild>
          <a href="/reservations/my">一覧に戻る</a>
        </Button>

        {isFuture && reservation.status !== "CANCELED" && (
          <form action={cancelReservationAction}>
            <input type="hidden" name="id" value={reservation.id} />
            <Button type="submit" variant="destructive">
              この予約をキャンセル
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
