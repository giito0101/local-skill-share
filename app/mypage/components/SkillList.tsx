"use client";

import { useActionState } from "react";
import { deleteSkillAction, type DeleteSkillState } from "../actions";
import { useFormStatus } from "react-dom";

type Skill = {
  id: number;
  title: string;
  description: string | null;
};

const initialState: DeleteSkillState = { ok: false };

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-sm text-red-600">
      {pending ? "削除中..." : "削除"}
    </button>
  );
}

type Props = {
  skills: Skill[];
};

export function SkillList({ skills }: Props) {
  const [state, formAction] = useActionState(deleteSkillAction, initialState);

  if (skills.length === 0) {
    return (
      <p className="text-sm text-gray-500">登録スキルはまだありません。</p>
    );
  }

  return (
    <div className="space-y-2">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <ul className="space-y-3">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className="flex items-start justify-between rounded-lg border px-4 py-3"
          >
            <div>
              <h3 className="font-medium text-sm">{skill.title}</h3>
              {skill.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {skill.description}
                </p>
              )}
              <a
                href={`/skills/${skill.id}/edit`}
                className="mt-2 inline-flex text-xs text-blue-600"
              >
                編集する
              </a>
            </div>

            <form action={formAction}>
              <input type="hidden" name="skillId" value={skill.id} />
              <DeleteButton />
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
