import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MessageForm } from "@/app/components/messages/message-form";
import { redirect } from "next/navigation";
import { MessageList } from "@/app/components/conversations/message-list";

type ChatPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function Chat({ params }: ChatPageProps) {
  const session = await getServerSession(authOptions);

  // 未ログインならどこかに飛ばす（トップでも /api/auth/signin でもお好みで）
  if (!session?.user?.id) {
    redirect("/"); // ここは好きな場所に
  }

  const { conversationId } = await params;

  const senderId = session.user.id; // これが Message の senderId になる

  return (
    <>
      {/* 先にメッセージ一覧 */}
      <MessageList conversationId={conversationId} />

      {/* 下に入力フォーム */}
      <MessageForm conversationId={conversationId} senderId={senderId} />
    </>
  );
}
