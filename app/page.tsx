import { prisma } from "@/lib/prisma";
import { CreateSkillForm } from "./create-skill-form";
import { deleteSkillAction } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { SignInButton, SignOutButton } from "./components/AuthButtons";
import Link from "next/link";

export default async function Home() {
  // 直にDB検索（RSCなので可能）
  const skills = await prisma.skill.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const session = await getServerSession(authOptions); // 未ログインなら null

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Skills</h1>
      <CreateSkillForm />
      <ul className="space-y-2">
        {skills.map((s: any) => (
          <li key={s.id} className="rounded border p-3">
            <form action={deleteSkillAction}>
              <input type="hidden" name="id" value={s.id} />
              <button className="text-sm text-red-600 underline mt-2">
                削除
              </button>
            </form>
            <div className="font-medium">
              {s.title} — ¥{s.price}
            </div>
            <div className="text-sm text-gray-600">{s.area}</div>
            <p className="mt-1">{s.description}</p>
          </li>
        ))}
      </ul>

      <h1>Auth.js (v4) minimal</h1>
      {session ? <SignOutButton /> : <SignInButton />}
      {session ? (
        <p>Signed in as {session.user?.name ?? session.user?.email}</p>
      ) : (
        <p>Not signed in</p>
      )}

      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Home</h1>
      <p>
        <Link href="/users">/users へ</Link>
      </p>
    </main>
  );
}
