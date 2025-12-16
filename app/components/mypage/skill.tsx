export function Skill({ user }: any) {
  // user.skills が存在しない場合に備えて安全策も入れておく
  if (!user.skills || user.skills.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold">投稿したスキル</h3>
        <p className="text-sm text-gray-600 mt-2">
          まだスキルは投稿されていません。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold">投稿したスキル</h3>
      <ul className="space-y-2">
        {user.skills.map((skill: any) => (
          <li key={skill.id} className="p-3 bg-gray-100 rounded">
            <a href={`/skills/${skill.id}`} className="font-medium">
              {skill.title}
            </a>
            <span className="text-sm text-gray-600 ml-2">{skill.price}円</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
