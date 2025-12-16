"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    // signOut に callbackUrl を渡してトップへ戻す
    signOut({ callbackUrl: "/" });
  }, []);

  return <p className="text-center mt-10">ログアウト中...</p>;
}
