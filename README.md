# DZ Orders

Phase 0 foundation scaffold for the DZ Orders SaaS application.

## Local setup

1. Copy `.env.example` to `.env`.
2. Run `docker compose up -d`.
3. Run `npm install`.
4. Run `npm run prisma:migrate`.
5. Run `npm run dev`.

## Notes

- Uses Next.js App Router, Tailwind CSS, Prisma, and NextAuth.
- Database seed script is in `prisma/seed.ts`.
