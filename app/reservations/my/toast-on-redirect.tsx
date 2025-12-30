"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ToastOnRedirect() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ★二重発火対策（後述）
  const firedRef = useRef(false);

  useEffect(() => {
    const t = sp.get("toast");
    if (!t) return;

    if (firedRef.current) return;
    firedRef.current = true;

    if (t === "approved") toast.success("予約を承認しました");
    if (t === "canceled") toast.success("予約をキャンセルしました");

    // クエリを消す（戻る/更新で再表示しない）
    const next = new URLSearchParams(sp.toString());
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [sp, router, pathname]);

  return null;
}
