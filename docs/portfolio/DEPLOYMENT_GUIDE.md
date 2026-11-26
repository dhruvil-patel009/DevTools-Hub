# Deployment Guide — DevTools Hub

## Free-Tier Cloud Deployment (Vercel + Neon/Supabase)
1. Provision a free PostgreSQL database on Neon or Supabase and obtain `DATABASE_URL` and `DIRECT_URL`.
2. Deploy the repository to Vercel.
3. Configure environment variables from `.env.example` (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, optional `GEMINI_API_KEY`, optional `REDIS_URL`/`REDIS_TOKEN`).
4. Run `pnpm db:push && pnpm db:seed` against your production database.
5. Register your admin user via `/register`, then run `ADMIN_EMAIL=you@example.com pnpm db:bootstrap-admin`.

## Local Docker Deployment
```bash
docker compose up -d
cp .env.example .env
pnpm db:push && pnpm db:seed
pnpm build && pnpm start
```
