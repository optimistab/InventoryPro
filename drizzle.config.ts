import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}else {
  console.log('DATABASE_URL in drizzle.config.ts --', process.env.DATABASE_URL);
}

export default defineConfig({
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL?.includes('render.com')
      ? `${process.env.DATABASE_URL}?sslmode=require`
      : process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
  },
});
