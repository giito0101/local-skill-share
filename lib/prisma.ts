import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const { Pool } = pkg;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Postgres 用のコネクションプール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Prisma 7 では adapter 必須（PostgreSQL → PrismaPg）
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // log: ["query", "error", "warn"], // 必要ならログを出す
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
