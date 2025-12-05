export function Reservation({ user }: any) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold">予約一覧</h3>
      <ul className="space-y-2">
        {user.reservations.map((r: any) => (
          <li key={r.id} className="p-3 bg-gray-100 rounded">
            <div>日付：{new Date(r.date).toLocaleString()}</div>
            <div>ステータス：{r.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
