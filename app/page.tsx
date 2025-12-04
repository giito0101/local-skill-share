import { prisma } from "@/lib/prisma";
import { CreateSkillForm } from "./create-skill-form";
import { deleteSkillAction } from "./actions";

export default async function Home() {
  // 直にDB検索（RSCなので可能）
  const skills = await prisma.skill.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

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
    </main>
  );
}
