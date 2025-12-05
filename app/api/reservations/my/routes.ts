import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ここから options を再利用
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  // session.user.id は callback で埋めているので any キャストで取り出す
  const ownerId = (session?.user as any)?.id;

  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { ownerId }, // ここは schema に合わせて string/number を調整
    include: { skill: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(reservations);
}
