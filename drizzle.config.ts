import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.NUXT_DATABASE_URL ||
      process.env.DATABASE_URL ||
      'postgres://cubestats:cubestats@localhost:5432/cubestats',
  },
})
