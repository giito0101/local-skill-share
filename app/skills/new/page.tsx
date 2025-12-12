import { requireSession } from "@/lib/require-session";
import NewSkillForm from "./NewSkillForm";

export default async function NewSkillPage() {
  await requireSession({ callbackUrl: "/skills/new" });

  return <NewSkillForm />;
}
