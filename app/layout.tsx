import type { ReactNode } from "react";
import { Providers } from "./providers";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <AppHeader />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
