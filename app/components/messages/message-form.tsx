"use client";

import { useState } from "react";
type MessageFormProps = {
  conversationId: string;
  senderId: string;
};

export function MessageForm({ conversationId, senderId }: MessageFormProps) {
  const [body, setBody] = useState("");

  async function send() {
    await fetch("/api/messages", {
      method: "POST",
      body: JSON.stringify({ conversationId, senderId, body }),
    });

    setBody("");
    // ★ リアルタイムじゃない場合は reload で十分
    location.reload();
  }

  return (
    <div className="flex gap-2">
      <input
        className="border p-2 flex-1"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button onClick={send} className="bg-blue-500 text-white px-4 py-2">
        送信
      </button>
    </div>
  );
}
