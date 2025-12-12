import { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // IDをセッションで使いたい“場合だけ”入れる（不要なら削除OK）
      if (token?.sub && session.user) {
        // (session.user as any).id = token.sub;
        // Chat確認用
        // (session.user as any).id = "cmisvrfo100006yi66oc475zc";
        // MyPage確認用
        (session.user as any).id = "cmj1hxrwr0001ifi6nfj8919d";
      }
      return session;
    },
  },
};
