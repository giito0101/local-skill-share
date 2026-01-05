import { prisma } from "@/lib/prisma";
import { SkillSearchSchema } from "@/app/validation";
import { SkillSearchForm } from "@/app/components/skills/skill-search-form";
import { SkillList } from "@/app/components/skills/skill-list";
import { getServerSession } from "next-auth";
import { authOptions, type UserWithId } from "@/lib/auth";
import { PageNation } from "@/app/components/search/page-nation";
import { SkillCategory } from "./generated/prisma/enums";

// 新着をどのくらいの頻度で更新したいか
export const revalidate = 60; // 60秒ごとにISR

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type SkillFindManyArgs = NonNullable<
  Parameters<typeof prisma.skill.findMany>[0]
>;
type SkillWhereInput = NonNullable<SkillFindManyArgs["where"]>;

const PAGE_SIZE = 12;

export default async function HomePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  const myId =
    session?.user && "id" in session.user
      ? (session.user as UserWithId).id
      : undefined;

  // 🟡 まず await して中身を取り出す
  const sp = await searchParams;

  // searchParams を素直なオブジェクトに整形
  const raw = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
    area: typeof sp.area === "string" ? sp.area : undefined,
    page: typeof sp.page === "string" ? sp.page : undefined,
  };

  const result = SkillSearchSchema.safeParse(raw);

  const parsed = result.success ? result.data : {};

  const page = parsed.page ?? 1;

  // Prisma の where 条件を組み立て
  const and: SkillWhereInput[] = [];

  const q = parsed.q?.trim();
  if (q) {
    and.push({
      OR: [{ title: { contains: q } }, { description: { contains: q } }],
    });
  }

  // ✅ string -> SkillCategory に変換してから入れる
  const category =
    typeof parsed.category === "string" &&
    (Object.values(SkillCategory) as string[]).includes(parsed.category)
      ? (parsed.category as SkillCategory)
      : undefined;

  if (parsed.category) and.push({ category });
  if (parsed.area) and.push({ area: parsed.area });
  if (myId) and.push({ ownerId: { not: myId } });

  // where は「undefined か SkillWhereInput」
  const where: SkillWhereInput | undefined = and.length
    ? { AND: and }
    : undefined;

  const [skills, totalCount] = await Promise.all([
    prisma.skill.findMany({
      where, // ✅ ここを where にする
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { reviews: true },
    }),
    prisma.skill.count({ where }), // ✅ 同じ where を使う
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const baseParams = new URLSearchParams();

  if (parsed.q) baseParams.set("q", parsed.q);
  if (parsed.category) baseParams.set("category", parsed.category);
  if (parsed.area) baseParams.set("area", parsed.area);

  const hrefForPage = (p: number) => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(p));
    return `/?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* 検索フォーム */}
      <SkillSearchForm initialValues={parsed} />

      {/* 新着スキル / 検索結果 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          {parsed.q || parsed.category || parsed.area
            ? "検索結果"
            : "新着スキル"}
        </h2>
        <SkillList skills={skills} />
      </section>

      <PageNation
        page={page}
        totalPages={totalPages}
        hrefForPage={hrefForPage}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
