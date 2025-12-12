import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);
// App Router では GET/POST をエクスポート
export { handler as GET, handler as POST };
