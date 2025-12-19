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
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";

  const dtf = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const y = get("year");
  const m = get("month");
  const d = get("day");
  const hh = get("hour");
  const mm = get("minute");

  return `${y}/${m}/${d} ${hh}:${mm}`;
}
