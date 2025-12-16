import { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // あなたの PrismaClient の場所に合わせて

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ 追加：Demoログイン
    CredentialsProvider({
      id: "demo",
      name: "Demo",
      credentials: {},
      async authorize() {
        const demoEmail = "demo@local-skill-share.example";
        const user = await prisma.user.upsert({
          where: { email: demoEmail },
          update: { name: "Demo User" },
          create: {
            email: demoEmail,
            name: "Demo User",
            passwordHash: "DEMO", // 後で optional にするなら不要にもできる
            image: null,
            bio: "This is a demo account for reviewers.",
          },
        });
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      // ✅ 初回ログイン時に user が来るので token に載せる
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub; // ✅ ここで “本物のID”
      }
      return session;
    },
  },
};
