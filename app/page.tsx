import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { SignInButton, SignOutButton } from "./components/AuthButtons";

export default async function Home() {
  const session = await getServerSession(authOptions); // 未ログインなら null
  return (
    <main>
      <h1>Auth.js (v4) minimal</h1>
      {session ? <SignOutButton /> : <SignInButton />}
      {session ? (
        <p>Signed in as {session.user?.name ?? session.user?.email}</p>
      ) : (
        <p>Not signed in</p>
      )}
    </main>
  );
}
