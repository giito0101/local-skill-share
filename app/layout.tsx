import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Local Skill Share",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <AppHeader />
          <Toaster richColors position="top-right" />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
