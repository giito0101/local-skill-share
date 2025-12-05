type MessageListProps = {
  conversationId: string;
};

export async function MessageList({ conversationId }: MessageListProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/messages/${conversationId}`, {
    cache: "no-store",
  });

  const messages = await res.json();

  return (
    <div className="space-y-2">
      {messages.map((m: any) => (
        <div key={m.id} className="p-2 border rounded">
          {m.body}
        </div>
      ))}
    </div>
  );
}
