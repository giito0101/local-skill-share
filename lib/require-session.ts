import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // 実際のパスに合わせて

type RequireSessionOptions = {
  callbackUrl?: string; // ログイン後に戻したいURL
};

export async function requireSession(options: RequireSessionOptions = {}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    const dest = options.callbackUrl ?? "/";
    redirect(`/login?callbackUrl=${encodeURIComponent(dest)}`);
  }

  return session;
}
