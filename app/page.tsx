import { prisma } from "@/lib/prisma";
import { SkillSearchSchema } from "@/lib/validations";
import { SkillSearchForm } from "@/app/components/skills/skill-search-form";
import { SkillList } from "@/app/components/skills/skill-list";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { SignInButton, SignOutButton } from "./components/auth-button";

// 新着をどのくらいの頻度で更新したいか
export const revalidate = 60; // 60秒ごとにISR

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const PAGE_SIZE = 12;

export default async function HomePage({ searchParams }: PageProps) {
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
  const where: any = {};

  if (parsed.q) {
    where.OR = [
      { title: { contains: parsed.q } },
      { description: { contains: parsed.q } },
    ];
  }

  if (parsed.category) {
    where.category = parsed.category;
  }

  if (parsed.area) {
    where.area = parsed.area;
  }

  const [skills, totalCount] = await Promise.all([
    prisma.skill.findMany({
      where,
      orderBy: { createdAt: "desc" }, // 新着順
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        reviews: true, // 平均スコアを出すなら取っておく
      },
    }),
    prisma.skill.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const session = await getServerSession(authOptions); // 未ログインなら null

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

      {/* ページネーション（必要なら） */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {/* ここはあとで shadcn/ui の Pagination に差し替えてOK */}
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages} ページ
          </span>
        </div>
      )}
      <div>
        <Link
          href="/reservations/my"
          className="underline !text-blue-600 hover:!text-blue-800"
        >
          予約一覧
        </Link>
      </div>

      <div>
        <div>{session ? <SignOutButton /> : <SignInButton />}</div>
        <div>
          {session ? (
            <p>Signed in as {session.user?.name ?? session.user?.email}</p>
          ) : (
            <p>Not signed in</p>
          )}
        </div>
      </div>
    </div>
  );
}
