# Staging Environment — Penfix OS

A shared, production-like environment where staff can stress-test changes
**before** they hit the live site. Built on the infrastructure you already
have (Vercel + Supabase) — no new servers.

## Why not just localhost?

`localhost` only runs on one machine, isn't shareable with staff, and doesn't
behave like the deployed site (build output, env vars, serverless/edge behavior
all differ). Use localhost for your own dev loop; use **staging** for team testing.

---

## The three environments

| Environment | Git branch | URL | Supabase project |
| --- | --- | --- | --- |
| Local dev | any | `localhost:3000` | staging DB (or local) |
| **Staging** | `staging` | Vercel preview URL | **staging DB** (safe to break) |
| Live | `main` | production domain | production DB |

### Workflow

```
feature branch  ->  staging  (staff stress-test on preview URL)  ->  main  (live)
```

1. Do work on a feature branch (or directly on `staging` for small changes).
2. Merge/push to `staging`. Vercel auto-deploys a preview URL.
3. Staff test against that URL (it points at the **staging** database).
4. Once approved, open a PR `staging -> main` (or merge) to release to live.

The `staging` branch already exists locally and on GitHub.

---

## Part 1 — Vercel: scope env vars per environment

Vercel lets you set the **same variable name** to **different values** per
environment (Production / Preview / Development). This is what keeps staging
pointed at a safe database.

**Vercel Dashboard → Project → Settings → Environment Variables**

Set these three (see `.env.example`), each with an environment-scoped value:

| Variable | Production | Preview (= staging) |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | prod project URL | **staging** project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key | **staging** anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | prod service_role | **staging** service_role |

When adding/editing each variable, tick only the relevant environment box so the
values don't leak across. The **Preview** scope applies to every branch that
isn't `main` — including `staging`.

> ⚠️ **The whole point:** if Preview used the *production* keys, staff testing
> would write junk data into real job orders, client rewards, and expenses.
> Keeping Preview on the staging DB makes stress-testing safe.

After changing env vars, redeploy the `staging` branch for them to take effect.

---

## Part 2 — Spin up the staging Supabase database

Create a second **free** Supabase project (e.g. `penfix-os-staging`), then load
the schema in this exact order via **Supabase Dashboard → SQL Editor**:

| # | File | Purpose |
| --- | --- | --- |
| 1 | `supabase/schema.sql` | Tables, RLS policies |
| 2 | `supabase/migrations/001_add_dispatch_mode.sql` | Adds `dispatch_mode` |
| 3 | `supabase/migrations/002_expenses_update.sql` | Expenses columns |
| 4 | `supabase/seed.sql` | Users + base data |
| 5 | `supabase/seed_subcategories.sql` | 221 subcategories from CRM |

Notes:
- `schema.sql` does **not** yet include the migration columns, so the migrations
  must be run after it. They use `if not exists` / `ON CONFLICT`, so re-running
  is safe (idempotent).
- Seeds use `ON CONFLICT ... DO NOTHING/UPDATE`, so they can be re-run to refresh.
- Keeping prod and staging schemas in sync = run each new
  `supabase/migrations/NNN_*.sql` file against **both** projects when you add one.

### One caveat: Auth redirect URLs

The app builds password-reset and tracking links from `window.location.origin`,
so they adapt to whatever domain serves them (no hardcoded prod URL — good).
But Supabase Auth only honors redirect URLs on its allowlist. In the **staging**
Supabase project:

**Authentication → URL Configuration → Redirect URLs** → add your staging
Vercel URL (e.g. `https://penfix-os-git-staging-*.vercel.app/**`).

Otherwise password-reset on staging will bounce.

---

## Quick checklist

- [x] `staging` branch created and pushed
- [ ] Second Supabase project created (`penfix-os-staging`)
- [ ] Schema + migrations + seeds loaded (order above)
- [ ] Staging redirect URL allowlisted in staging Supabase Auth
- [ ] Vercel Preview env vars set to staging keys (3 vars)
- [ ] Redeploy `staging`, confirm staff can reach the preview URL
