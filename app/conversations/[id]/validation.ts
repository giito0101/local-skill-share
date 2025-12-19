import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, "conversationId がありません。"),
  body: z
    .string()
    .trim()
    .min(1, "メッセージを入力してください。")
    .max(1000, "メッセージは1000文字以内にしてください。"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// FormData -> object（純粋）
export function parseSendMessageFormData(formData: FormData): {
  conversationId: unknown;
  body: unknown;
} {
  return {
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  };
}

// unknown -> string を保証（純粋）
export function normalizeToString(v: unknown): string {
  if (typeof v === "string") return v;
  return "";
}

// parse + validate（純粋）
export function validateSendMessage(formData: FormData) {
  const raw = parseSendMessageFormData(formData);
  const input = {
    conversationId: normalizeToString(raw.conversationId),
    body: normalizeToString(raw.body),
  };
  return sendMessageSchema.safeParse(input);
}
