import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { LoginPageClient } from "./login-page-client";

type PageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  // すでにログイン済みならホームへ
  if (session) redirect("/");

  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl ?? "/";

  return <LoginPageClient callbackUrl={callbackUrl} />;
}
