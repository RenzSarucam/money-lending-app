# 💰 Money Lending

A loan tracking app for informal lenders running **Arawan** (daily-collection) and **Paluwagan** (monthly interest-only, balloon principal) loans. Built with React, Vite, and Supabase — installable as a PWA on phone or desktop.

## Features

**Admin**
- Dashboard with per-loan-type filtering, search, and progress tracking
- Add / edit borrowers without losing payment history
- Collect tab for recording daily/monthly payments, with automatic due-amount calculation
- Reports — total lent out, interest earned, monthly collection trend, currently-late borrowers
- CSV export for borrowers and payments
- Monitor Users — table of registered accounts, with inline edit / delete
- Collapsible sidebar, mobile-friendly drawer navigation

**Borrower (User)**
- View their own loan balance, progress, and payment history
- Edit their own profile (name, photo)

**Account**
- Email/password auth via Supabase, with forgot/reset password flow
- New accounts auto-link to an existing borrower record by matching email

## Tech Stack

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [React Router](https://reactrouter.com)
- [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for installability

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project, then copy your Project URL and anon key into a `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run [`supabase_schema.sql`](supabase_schema.sql) in the Supabase SQL Editor (Dashboard → SQL Editor → New query) to create the tables, triggers, and RLS policies.
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Sign up your first account in the app, then in Supabase's Table Editor open the `profiles` table and change that row's `role` from `user` to `admin`. That account can now use the Admin dashboard.

## Scripts

| Command           | Description                    |
| ------------------ | ------------------------------- |
| `npm run dev`       | Start the local dev server      |
| `npm run build`     | Production build to `dist/`     |
| `npm run preview`   | Preview the production build    |
| `npm run lint`      | Run Oxlint                      |

## Deployment

Deployed on [Vercel](https://vercel.com). [`vercel.json`](vercel.json) rewrites all routes to `index.html` for client-side routing. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in the Vercel project settings, then redeploy.

After deploying, add your production URL to Supabase under **Authentication → URL Configuration → Redirect URLs** (needed for signup/reset-password email links to work).

## Project Structure

```
src/
  components/   Shared UI pieces (modals, sidebar, avatar, toast)
  context/      Auth session/profile provider
  lib/          Supabase client
  pages/        Route-level screens (Login, Signup, AdminApp, UserApp, ...)
  styles/       Responsive/layout CSS
  utils/        Loan math, CSV export, image resizing
supabase_schema.sql   Full database schema, run once in the Supabase SQL Editor
```
