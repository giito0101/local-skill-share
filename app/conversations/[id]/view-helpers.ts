export function isMine(senderId: string, currentUserId: string) {
  return senderId === currentUserId;
}

export function displaySenderLabel(
  senderName: string | null | undefined,
  mine: boolean
) {
  if (mine) return "あなた";
  return senderName?.trim() ? senderName : "（名無し）";
}

export function rowAlignClass(mine: boolean) {
  return mine ? "justify-end" : "justify-start";
}

export function bubbleClass(mine: boolean) {
  return mine ? "bg-primary text-primary-foreground" : "bg-background";
}
