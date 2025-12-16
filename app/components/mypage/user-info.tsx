export function UserInfo({ user }: any) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">プロフィール</h2>
      <p>名前：{user.name}</p>
      <p>メール：{user.email}</p>
    </div>
  );
}
