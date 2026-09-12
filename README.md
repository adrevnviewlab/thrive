# STACKR

Inventory console for smoke shops (Thrive replacement). React SPA that talks to [stackr-api](https://github.com/axstart/stackr-api) and Supabase Auth.

## Modes

| Mode | When | Data |
|------|------|------|
| Demo | No `VITE_API_URL`, or Enter demo | In-browser mock catalog |
| Live | `VITE_API_URL` + Supabase sign-in | stackr-api + Postgres |

Production builds never honour `VITE_API_SANDBOX`. Demo is hidden in production when an API URL is set (override with `VITE_ALLOW_DEMO=true`).

## Local development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Live against a local API:

```env
VITE_API_URL=http://localhost:8787
VITE_API_SANDBOX=true
```

Then run `pnpm dev:sandbox` in stackr-api.

## Production deploy checklist

1. **Supabase** — project with migrations applied; Email auth on; owner row in `app_users`.
2. **Render** — stackr-api web service + cron jobs; env: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or JWT secret), `INTERNAL_JOB_SECRET`, `CORS_ORIGINS`, `APP_URL`, `CLOVER_MODE=mock`.
3. **Vercel** — this SPA with:
   - `VITE_API_URL=https://<render-host>`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - leave `VITE_API_SANDBOX` unset

### Current production endpoints

| Piece | URL |
|-------|-----|
| SPA | https://thrize.vercel.app |
| API | https://stackr-api-3470.onrender.com |
| API health | https://stackr-api-3470.onrender.com/health |
| Supabase | https://vbjisnyoabbnkgcdxeqb.supabase.co |

Owner bootstrap account (Auth): `owner@stackr.app` — set/reset the password in the Supabase dashboard if Auth was restricted during bootstrap.

```bash
pnpm typecheck
pnpm build
vercel --prod
```

## Scripts

- `pnpm dev` — Vite
- `pnpm typecheck` — TypeScript
- `pnpm build` — typecheck + production bundle
- `pnpm preview` — serve `dist`
