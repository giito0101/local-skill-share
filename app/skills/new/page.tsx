import { requireSession } from "@/lib/require-session";
import NewSkillForm from "./new-skill-form";

export default async function NewSkillPage() {
  await requireSession({ callbackUrl: "/skills/new" });

  return <NewSkillForm />;
}
