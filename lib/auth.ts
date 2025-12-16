import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ 通常ログイン（フォーム用）

    CredentialsProvider({
      id: "credentials",
      name: "IDPassword",
      credentials: {
        loginId: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const loginId = credentials?.loginId?.trim();
        const password = credentials?.password ?? "";

        const user = await prisma.user.findFirst({ where: { id: loginId } });

        if (!user?.passwordHash) {
          console.log("[auth] no passwordHash");
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);

        if (!ok) return null;

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
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) (session.user as any).id = token.sub;
      return session;
    },
  },
};
