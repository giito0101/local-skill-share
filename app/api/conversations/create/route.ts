import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userAId, userBId } = await req.json();

  let convo = await prisma.conversation.findFirst({
    where: {
      OR: [
        { userAId, userBId },
        { userAId: userBId, userBId: userAId },
      ],
    },
  });

  if (!convo) {
    convo = await prisma.conversation.create({
      data: { userAId, userBId },
    });
  }

  return NextResponse.json(convo);
}
