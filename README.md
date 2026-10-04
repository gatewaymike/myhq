# MyHQ (rebuild)

Hydrogen intake tracker for Gateway H₂. React + Vite + TypeScript + Tailwind, Supabase backend.
The live Horizons app at h2tracker.gatewayh2.com stays untouched until cutover is approved (R-362).

## Commands

    npm install
    cp .env.example .env.local
    npm run dev        # local dev server
    npm run check      # formula tests, copy lint, production build

## Database

1. `supabase/migrations/0001_init.sql`: paste into the Supabase SQL editor and run once.
2. `supabase/tests/rls_and_formula_test.sql`: paste and run after the migration, and again after any
   data-access change. It rolls itself back. The last result must read
   `ALL RLS AND FORMULA TESTS PASSED`.

Local Postgres check (no Supabase needed): load `supabase/tests/local_supabase_mock.sql`, then the
migration, then the test file.

## The formula

`src/lib/hq.ts` mirrors the database's generated `hq` column. The test vectors live in
`src/lib/hq.vectors.json` and run in both places. Never edit a vector to make a test pass.

## Copy

All strings live in `src/i18n/strings.ts`, English beside Chinese. Chinese is a draft until a native
ZH-TW review. `npm run lint:copy` blocks em dashes, banned terms and retired figures.
