import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillList } from "@/app/components/skills/skill-list";

// next/link を素朴な <a> に落とす
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("SkillList", () => {
  it("shows empty message when no skills (DOM変化)", () => {
    render(<SkillList skills={[]} />);
    expect(
      screen.getByText("該当するスキルがありませんでした。")
    ).toBeInTheDocument();
  });

  it("renders cards with correct href and price", () => {
    render(
      <SkillList
        skills={[
          {
            id: "s1",
            title: "スキル1（ENGLISH）",
            description: "スキル1の説明です。エリア:新宿",
            category: "ENGLISH",
            area: "新宿",
            price: 1000,
            ownerId: "test1",
            createdAt: new Date(),
            updatedAt: new Date(),
            // reviews
            reviews: [
              {
                id: "rev1",
                skillId: "s1",
                ownerId: "test2",
                rating: 1,
                comment: "",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          } as any,
        ]}
      />
    );

    const link = screen.getByRole("link", {
      name: /スキル1の説明です。エリア:新宿/,
    });
    expect(link).toHaveAttribute("href", "/skills/s1");
    expect(screen.getByText("¥1,000")).toBeInTheDocument();
    expect(screen.getByText("★ 1.0（1件）")).toBeInTheDocument();
  });

  it("does not show rating when there are no reviews", () => {
    render(
      <SkillList
        skills={[
          {
            id: "s2",
            title: "写真",
            description: "撮影",
            category: "PHOTO",
            area: "世田谷",
            price: 1000,
            ownerId: "u1",
            createdAt: new Date(),
            updatedAt: new Date(),
            reviews: [],
          } as any,
        ]}
      />
    );

    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });
});
