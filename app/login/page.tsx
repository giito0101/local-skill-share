import { LoginPageClient } from "./LoginPageClient";

type PageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl ?? "/";

  return <LoginPageClient callbackUrl={callbackUrl} />;
}
