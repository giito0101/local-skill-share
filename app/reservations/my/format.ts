export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELED";

/** ステータス表示ラベル */
export function statusLabel(status: ReservationStatus): string {
  switch (status) {
    case "PENDING":
      return "未確定";
    case "CONFIRMED":
      return "確定";
    case "CANCELED":
      return "キャンセル";
    default: {
      // TS上は到達しない想定だけど、ランタイム保険
      return "不明";
    }
  }
}

/**
 * 予約日時表示（Asia/Tokyo固定で安定）
 * 例: "2025/12/19 09:00"
 */
export function formatReservationDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;

  // ✅ invalid 判定（これが無いと落ちる or 変な値になる）
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";

  // ✅ Asia/Tokyo 固定で YYYY/MM/DD HH:mm
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}/${get("month")}/${get("day")} ${get("hour")}:${get(
    "minute"
  )}`;
}
