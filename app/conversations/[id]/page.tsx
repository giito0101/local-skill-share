import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // v4 用
import { prisma } from "@/lib/prisma";
import { ConversationView } from "./view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params; // ← Next 16 / React 19 仕様

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }
  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (
    !conversation ||
    (conversation.userAId !== userId && conversation.userBId !== userId)
  ) {
    notFound();
  }

  return (
    <ConversationView
      conversationId={conversation.id}
      currentUserId={userId}
      messages={conversation.messages}
    />
  );
}
