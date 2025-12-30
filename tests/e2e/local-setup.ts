import dotenv from "dotenv";
import path from "node:path";

// ✅ まず読む（最上部で）
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { execSync } from "node:child_process";

export default async function localSetup() {
  console.log("APP_ENV:", process.env.APP_ENV); // ←ここで確認

  if (process.env.APP_ENV !== "local") return;

  execSync("npm run local:setup", { stdio: "inherit" });
}
