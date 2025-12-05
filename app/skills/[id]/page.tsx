import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSkillById } from "@/lib/db/skill";

export const revalidate = 60; // 60秒ごとに再生成

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SkillDetailPage({ params }: Props) {
  const { id } = await params;
  const skill = await getSkillById(Number(id));

  if (!skill) {
    return <div>スキルが見つかりません。</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>{skill.title}</CardTitle>
        <CardDescription>{skill.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{skill.description}</p>
        <div className="mt-4 text-sm text-gray-500">料金: ¥{skill.price}</div>
      </CardContent>
    </Card>
  );
}
