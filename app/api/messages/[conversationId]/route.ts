import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const messages = await prisma.message.findMany({
    where: { conversationId: params.conversationId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}
