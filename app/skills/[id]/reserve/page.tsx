import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReservationForm } from "./ReservationForm";
import { requireSession } from "@/lib/require-session";
type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReservePage({ params }: Props) {
  const { id } = await params;

  await requireSession({ callbackUrl: `/skills/${id}/reserve` });

  const skill = await prisma.skill.findUnique({
    where: { id: Number(id) },
  });

  if (!skill) redirect("/skills");

  return (
    <div className="max-w-xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold">予約: {skill.title}</h1>
      <ReservationForm skillId={String(skill.id)} />
    </div>
  );
}
