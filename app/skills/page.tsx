import { prisma } from "@/lib/prisma";

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">スキル一覧</h1>

      <ul className="space-y-4">
        {skills.map((s) => (
          <li key={s.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="text-gray-700">{s.description}</p>
            <p className="text-sm text-gray-500">カテゴリ: {s.category}</p>
            <p className="text-sm text-gray-500">料金: ¥{s.price}</p>
            <p className="text-sm text-gray-500">エリア: {s.area}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
