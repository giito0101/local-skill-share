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
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin"); // v4 なのでこれでOK
  }

  const userId = session.user.id;

  // tab: future | past
  const tab = searchParams.tab === "past" ? "past" : "future";
  const page = Math.max(Number(searchParams.page) || 1, 1);

  const now = new Date();

  const baseWhere = {
    ownerId: userId,
    status: {
      in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
    },
  };

  const where =
    tab === "future"
      ? { ...baseWhere, date: { gte: now } }
      : { ...baseWhere, date: { lt: now } };

  const [reservations, totalCount] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: { date: tab === "future" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        skill: {
          select: { id: true, title: true }, // スキル側は title だけ
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
