import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ここから options を再利用
import { prisma } from "@/lib/prisma";

export default async function MyReservationsPage() {
  const session = await getServerSession(authOptions);
  if (!(session && (session.user as any)?.id)) {
    return <p>ログインしてください。</p>;
  }

  const reservations = await prisma.reservation.findMany({
    where: { ownerId: (session.user as any)?.id },
    include: { skill: true },
    orderBy: { date: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">予約一覧</h1>

      {reservations.length === 0 && (
        <p className="text-gray-500">まだ予約はありません。</p>
      )}

      {reservations.map((r) => (
        <div
          key={r.id}
          className="border rounded p-4 shadow-sm space-y-1 bg-white"
        >
          <p className="font-semibold">{r.skill.title}</p>
          <p className="text-sm text-gray-600">
            {new Date(r.date).toLocaleString("ja-JP")}
          </p>
          {r.message && <p className="text-sm text-gray-800">📩 {r.message}</p>}
        </div>
      ))}
    </div>
  );
}
