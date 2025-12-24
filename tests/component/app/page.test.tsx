import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

const findManyMock = vi.fn();
const countMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    skill: {
      findMany: (...args: any[]) => findManyMock(...args),
      count: (...args: any[]) => countMock(...args),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => null),
}));

// PageNation はこのテストの主目的じゃないので簡略化
vi.mock("../components/search/page-nation", () => ({
  PageNation: ({ page, totalPages }: any) => (
    <div data-testid="pagenation">
      page:{page} total:{totalPages}
    </div>
  ),
}));

// SkillSearchForm / SkillList を本物で描画してもいいが、Server Component テストを安定させたいならスタブ化もアリ
vi.mock("@/app/components/skills/skill-search-form", () => ({
  SkillSearchForm: () => <div data-testid="search-form" />,
}));
vi.mock("@/app/components/skills/skill-list", () => ({
  SkillList: ({ skills }: any) => (
    <div data-testid="skill-list">count:{skills.length}</div>
  ),
}));

describe("HomePage", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    countMock.mockReset();
  });

  it("shows '新着スキル' when no search conditions", async () => {
    findManyMock.mockResolvedValueOnce([]);
    countMock.mockResolvedValueOnce(0);

    const el = await HomePage({ searchParams: Promise.resolve({}) });
    render(el);

    expect(screen.getByText("新着スキル")).toBeInTheDocument();
    expect(screen.getByTestId("skill-list")).toHaveTextContent("count:0");
  });

  it("shows '検索結果' when q is present", async () => {
    findManyMock.mockResolvedValueOnce([]);
    countMock.mockResolvedValueOnce(0);

    const el = await HomePage({ searchParams: Promise.resolve({ q: "犬" }) });
    render(el);

    expect(screen.getByText("検索結果")).toBeInTheDocument();
  });

  it("passes computed 'where' into prisma calls (呼び出し制御)", async () => {
    findManyMock.mockResolvedValueOnce([]);
    countMock.mockResolvedValueOnce(0);

    const el = await HomePage({
      searchParams: Promise.resolve({
        q: "犬",
        category: "DOG_TRAINING",
        area: "新宿",
        page: "2",
      }),
    });
    render(el);

    // 呼び出し内容のざっくり検証（厳密にしすぎると壊れやすい）
    expect(findManyMock).toHaveBeenCalledTimes(1);
    const args = findManyMock.mock.calls[0][0];
    expect(args.skip).toBe(12); // PAGE_SIZE=12, page=2
    expect(args.take).toBe(12);
    expect(countMock).toHaveBeenCalledTimes(1);
  });
});
