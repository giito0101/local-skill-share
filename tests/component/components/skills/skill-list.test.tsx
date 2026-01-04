import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillList } from "@/app/components/skills/skill-list";
import type { SkillWithRelations } from "@/app/components/skills/skill-list";
import type { ComponentProps, ReactNode } from "react";
import { type Skill, type Review } from "@/app/generated/prisma/client";

type MockNextLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  children?: ReactNode;
};
// next/link を素朴な <a> に落とす
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: MockNextLinkProps) => (
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
    const makeReview = (overrides: Partial<Review> = {}): Review => ({
      id: "rev1",
      skillId: "s1",
      ownerId: "test2",
      rating: 1,
      comment: "",
      createdAt: new Date(),
      ...overrides,
    });

    const makeSkill = (overrides: Partial<Skill> = {}): Skill => ({
      id: "s1",
      title: "スキル1（ENGLISH）",
      description: "スキル1の説明です。エリア:新宿",
      category: "ENGLISH" as Skill["category"], // ← category が enum の場合の安全な合わせ方
      area: "新宿",
      price: 1000,
      ownerId: "test1",
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: null,
      ...overrides,
    });

    const skill: SkillWithRelations = {
      ...makeSkill(),
      reviews: [makeReview()],
    };

    render(<SkillList skills={[skill]} />);

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
            imageUrl: null,
            reviews: [],
          } as SkillWithRelations,
        ]}
      />
    );

    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });
});
