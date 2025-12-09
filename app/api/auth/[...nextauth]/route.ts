import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // IDをセッションで使いたい“場合だけ”入れる（不要なら削除OK）
      if (token?.sub && session.user) {
        // (session.user as any).id = token.sub;
        // Chat確認用
        // (session.user as any).id = "cmisvrfo100006yi66oc475zc";
        // MyPage確認用
        (session.user as any).id = "cmiyeeeg00000u2i6aey38xno";
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
// App Router では GET/POST をエクスポート
export { handler as GET, handler as POST };
