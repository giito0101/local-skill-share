// app/reservations/my/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { MyReservationsView } from "./view";
import { ReservationStatus } from "@/app/generated/prisma/enums";

type SearchParams = {
  tab?: string; // "future" | "past"
  page?: string;
};

const PAGE_SIZE = 10;

export default async function MyReservationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // ✅ searchParams を一度 await してから使う
  const sp = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  const tab: "future" | "past" = sp.tab === "past" ? "past" : "future";
  const page = Math.max(Number(sp.page) || 1, 1);

  const now = new Date();

  let where;

  if (tab === "future") {
    // 未来タブ → これから＆未キャンセル系だけ
    where = {
      // 自分が owner のスキルに対する予約
      skill: { ownerId: userId },
      date: { gte: now },
      status: {
        in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
    };
  } else {
    // 過去タブ → 全ての過去 + 未来のキャンセル
    where = {
      ownerId: userId,
      OR: [
        // 1) 過去はステータス問わず全部
        { date: { lt: now } },
        // 2) 未来だけどキャンセル済み
        {
          AND: [{ date: { gte: now } }, { status: ReservationStatus.CANCELED }],
        },
      ],
    };
  }

  const [reservations, totalCount] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: { date: tab === "future" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        skill: {
          select: { id: true, title: true },
        },
        // 🔽 提供側画面なら「誰が予約したか」も欲しくなるかも
        owner: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.reservation.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  return (
    <MyReservationsView
      tab={tab}
      page={page}
      totalPages={totalPages}
      reservations={reservations}
    />
  );
}
