"use client";

import { useRef, useEffect } from "react";
import { sendMessageAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // もしあるなら

type MessageWithSender = {
  id: string;
  body: string;
  createdAt: string | Date;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
  };
};

export function ConversationView({
  conversationId,
  currentUserId,
  messages,
}: {
  conversationId: string;
  currentUserId: string;
  messages: MessageWithSender[];
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col gap-4 h-[80vh]">
      <h1 className="text-xl font-semibold">チャット</h1>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto space-y-3 border rounded-lg p-3 bg-muted/40">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            まだメッセージはありません。最初のメッセージを送ってみましょう。
          </p>
        )}

        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;
          const name = m.sender.name ?? "（名無し）";

          return (
            <div
              key={m.id}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <Card
                className={cn(
                  "max-w-[70%] px-3 py-2 text-sm",
                  isMine
                    ? "bg-primary text-primary-foreground"
                    : "bg-background"
                )}
              >
                <div className="text-xs mb-1 opacity-80">
                  {isMine ? "あなた" : name}
                </div>
                <div>{m.body}</div>
              </Card>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* 送信フォーム */}
      <form
        ref={formRef}
        action={async (formData) => {
          await sendMessageAction(formData);
          formRef.current?.reset();
        }}
        className="flex gap-2"
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <Input
          name="body"
          placeholder="メッセージを入力..."
          autoComplete="off"
        />
        <Button type="submit">送信</Button>
      </form>
    </div>
  );
}
