import dotenv from "dotenv";
import type { PrismaConfig } from "prisma";
import { env } from "prisma/config";

dotenv.config({ path: ".env.local" });

export default {
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
  experimental: {
    externalTables: true,
  },
  tables: {
    external: ["auth.users"],
  }
} satisfies PrismaConfig;