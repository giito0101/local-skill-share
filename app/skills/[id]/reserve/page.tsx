import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ここから options を再利用
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReservationForm } from "./ReservationForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReservePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

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
