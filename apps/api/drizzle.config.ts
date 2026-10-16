import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/common/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://reactiv:reactiv@localhost:5432/reactiv',
  },
});
