import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getMyPageUser } from "@/lib/db/mypage";
import { redirect } from "next/navigation";
import { UserInfo } from "../components/mypage/user-info";
import { Skill } from "../components/mypage/skill";
import { Reservation } from "../components/mypage/reservation";

export default async function MyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await getMyPageUser(session.user.id);

  if (!user) {
    // ありえないけど保険
    return <p>ユーザー情報が見つかりません。</p>;
  }

  return (
    <>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}

      <UserInfo user={user} />
      <Skill user={user} />
      <Reservation user={user} />
    </>
  );
}
