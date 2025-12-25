"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

export function ReservedToast() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // StrictMode / 再レンダー対策：1回だけ実行
  const firedRef = useRef(false);

  const reserved = sp.get("reserved"); // 値だけ取り出す（依存を安定させる）

  useEffect(() => {
    if (reserved !== "1") return;
    if (firedRef.current) return;

    firedRef.current = true;
    toast.success("予約リクエストを送信しました。ありがとうございました。");

    // クエリを消す（戻る/更新で再表示しない）
    router.replace(pathname);
  }, [reserved, router, pathname]);

  return null;
}
