# BUET Exchange (Demo)

A small Vite + React + TypeScript single-page app for sharing/selling study resources (demo/hackathon project).

This repository contains a lightweight frontend with a mock local-store and Supabase integration for demo data.

## Features

- Post free or sell resources (PDFs, images, notes, books, lab equipment).
- Admin panel to review pending posts, approve or reject.
- Access flow for resources: free posts open directly, sell posts go through a payment flow (demo) before access.
- Simple local demo store in `src/store/posts.ts` for offline development.

## Key files

- `src/App.tsx` — routes registration
- `src/pages/Dashboard.tsx` — public dashboard showing posts
- `src/pages/Share.tsx` — create free posts
- `src/pages/Sell.tsx` — create sell posts
- `src/pages/AccessContent.tsx` — open seller-provided link or file (admin tools included)
- `src/pages/MakePayment.tsx` — new page for sell-post payment flow (demo)
- `src/pages/MockPayment.tsx` — mock payment UI (demo)
- `src/pages/Admin.tsx` — admin panel to review pending posts
- `src/components/PostCard.tsx` — post cards; `Access` button behavior differs for admin vs user
- `src/store/posts.ts` — lightweight local store + helpers
- `src/lib/supabase.ts` — supabase client configuration


## Local setup

Requirements: Node 18+, npm

1. Install deps

```bash
npm install
```

2. Development server

```bash
npm run dev
# open http://localhost:5173 (or the URL shown by Vite)
```

3. Build for production

```bash
npm run build
npm run preview
```

## Environment variables (Supabase)

If you use Supabase for data, set these in your environment or `.env` file used by the app:

- `VITE_SUPABASE_URL` — https://xkouysmvvciieyolmicu.supabase.co
- `VITE_SUPABASE_ANON_KEY` — sb_publishable_TfESN4gdybfmqMrE0bDQuw_cVKgzxO2
Note: the app also uses a small localStorage-backed dataset in `src/store/posts.ts` for demo mode.

## Database note (Supabase schema)

If you use the Supabase posts table, it expects a boolean `rejected` column when rejecting posts. If you see an error about a missing `rejected` column, add it using the SQL editor:

```sql
ALTER TABLE public.posts ADD COLUMN rejected boolean DEFAULT false;
```

## Developer usage / testing

- Admin flow:
	- Sign in as a user object with `isAdmin: true` in localStorage (or use Supabase user marked as admin).
	- Visit `/admin` to review pending posts.
	- Click a pending sell post's `Access` to open `AccessContent` where you can `Approve` or `Reject`.
	- `Approve` will mark the post approved and navigate to the dashboard; `Reject` marks it rejected and keeps it out of the dashboard.

- User flow (sell post):
	- As a regular user (no `isAdmin` flag), click `Access` on a sell post in the dashboard.
	- You will be taken to `/make-payment/:id` where you can `Proceed to Payment` (demo) or `Back to Dashboard`.
	- `Proceed to Payment` navigates to `/access/:id?paid=1` and shows the seller-provided link.
	- `Back to Dashboard` returns you to the dashboard without paying.

- User flow (free post):
	- Clicking `Access` for a free post opens `/access/:id` directly and displays the resource link.

## Troubleshooting

- Blank page when clicking `Access` on a sell post: fixed by ensuring sell posts route to `/make-payment/:id` for non-admin users and `AccessContent` guards against missing posts.
- Missing `rejected` column error when rejecting: run the SQL above to add the column.
- If the dev server URL differs from `http://localhost:5173`, check the terminal output from `npm run dev`.

## Contributing / PRs

- Create a branch for your work, commit, push, and open a PR with a clear description.

Example:

```bash
git checkout -b fix/access-payment-flow
git add .
git commit -m "Make payment flow for sell posts; admin fixes"
git push origin fix/access-payment-flow
```

credit-
Lead coder-Jarin Subah
UI designer-Sadia Jahan Ritaz
Researcher-Nawshin Jamin Tuktuki
