import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { conversationId, senderId, body } = await req.json();

  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      body,
    },
  });

  return NextResponse.json(msg);
}
