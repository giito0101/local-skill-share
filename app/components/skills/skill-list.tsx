import Link from "next/link";
import { type Skill, type Review } from "@/app/generated/prisma/client";

type SkillWithRelations = Skill & {
  reviews: Review[];
};

type Props = {
  skills: SkillWithRelations[];
};

export function SkillList({ skills }: Props) {
  if (skills.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        該当するスキルがありませんでした。
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => {
        const avgRating =
          skill.reviews.length > 0
            ? skill.reviews.reduce((sum, r) => sum + r.rating, 0) /
              skill.reviews.length
            : null;

        return (
          <Link
            key={skill.id}
            href={`/skills/${skill.id}`}
            className="block rounded-lg border p-4 hover:shadow-sm transition"
          >
            <h3 className="font-semibold line-clamp-2">{skill.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {skill.description}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{skill.category}</span>
              <span>{skill.area}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-medium">
              <span>¥{skill.price.toLocaleString()}</span>
              {avgRating && (
                <span>
                  ★ {avgRating.toFixed(1)}（{skill.reviews.length}件）
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
