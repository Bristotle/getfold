import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma 7 moved connection URLs out of schema.prisma and into this file,
// and it no longer auto-loads .env — hence the explicit `dotenv/config`
// import above.
//
// `datasource.url` here is only ever used by the Prisma CLI (migrate,
// db push, studio), so it points at DIRECT_URL: Supabase's pooled
// connection ("Transaction mode", port 6543) cannot run migrations.
// Nothing in src/ constructs a PrismaClient — all runtime data access
// goes through Supabase with RLS — so no driver adapter is needed.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
  },
})
