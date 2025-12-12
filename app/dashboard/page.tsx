import { requireSession } from "@/lib/require-session";

export default async function Dashboard() {
  const session = await requireSession({
    callbackUrl: `/dashboard`,
  });
  return <div>Private area</div>;
}
