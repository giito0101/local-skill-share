"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginPageClient } from "./LoginPageClient";
import type { ReactNode } from "react";

type PageProps = {
  searchParams: {
    callbackUrl?: string;
  };
};

export default function LoginPage({ searchParams }: PageProps) {
  const callbackUrl = searchParams.callbackUrl ?? "/";

  return <LoginPageClient callbackUrl={callbackUrl} />;
}
