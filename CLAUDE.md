# CLAUDE.md: MyHQ Tracker

Read this at the start of every session. If anything here conflicts with a request, stop and ask.

## 1. Project

MyHQ Tracker is a free molecular hydrogen intake tracker from Gateway H2 (gatewayh2.com). Live as an installable web app (PWA) at h2tracker.gatewayh2.com, deployed on Vercel (`vercel.json`). Store apps are built with Capacitor: Google Play first, Apple App Store second. Backend is Supabase.

Stack: React 19, TypeScript, Vite, Tailwind 3, framer-motion, react-router, Supabase JS, Capacitor 8 (android, app, filesystem, local-notifications, share), vite-plugin-pwa, vitest, oxlint.

Layout:
- `src/lib/`: `hq.ts` (the formula), `hq.vectors.json` (test vectors), reminders, export, platform, `supabase.ts`
- `src/screens/`: `auth`, `history`, `log`, `onboarding`, `settings`, `today`
- `src/store/`: `localStore.ts` (guest mode), `supabaseStore.ts` (signed in), `types.ts`
- `src/i18n/strings.ts`: all UI strings, English beside Chinese
- `src/app/`: shell, auth and app context, reminder sync, update bar
- `supabase/migrations/0001_init.sql` and `supabase/tests/`: schema, row-level security (RLS), formula test
- `store/android/`, `android/`: Play Store listing assets and the Capacitor project
- `docs/`: handoffs, session blocks, runbooks. `PARITY.md`: screen approval log. `design/`: internal approval pages, not app copy

Commands: `npm run dev`, `npm run test`, `npm run lint:copy`, `npm run build`. **`npm run check` runs all three checks and must pass before any pull request.**

## 2. HQ formulas (core IP: never change these values or this math)

- 1.0 HQ = 500 mL water at 1.6 mg/L = 0.80 mg H2
- Water: HQ = (mL / 500) x (mg/L / 1.6)
- Inhalation: HQ = (minutes / 30) x (mL/min / 300) x 2, with flow taken at the machine outlet
- mg H2 = HQ x 0.80
- Daily target 10.0 HQ = 8 mg/day. It is a reference value inside a range, neither a floor nor a ceiling. UI copy never calls it a minimum, a limit or a goal.
- Notation in UI copy is mg/L.
- Inhalation input is hydrogen flow in mL/min. There is no purity input.
- The synergy bonus is removed entirely. A "Both routes today" badge replaces it and has no effect on any score. Never reintroduce a multiplier.
- `hq.ts` and the database generated column (`0001_init.sql`) compute the same figure and share test vectors. Change neither without approval. Never edit a vector to make a test pass.
- Full precision is carried through every computation. Only the displayed figure is rounded, to two decimals, in `hq.ts`.

## 3. Design system (app)

Tokens live in `src/index.css` and `tailwind.config.js`. Use tokens, not raw hex, in components.
- Background `#020E0A`. Water and primary: cyan `#00E5FF`. Inhalation: purple `#B488FF`.
- Gold `#C8A84B` is used for the "Both routes today" badge (Today and History screens), the top banner in `App.tsx`, and (as `#E2C466`) the "My" in the wordmark. It no longer signals a bonus. Do not give it a new role without Michael's ruling.
- Mint `#02C39A` (wordmark and header descriptor use the brighter `#2EE6B8`). Danger `#FF7A7A`.
- Fonts: DM Sans (body), DM Mono (data labels, numbers), Playfair Display (display headlines), Noto Sans TC fallback for Chinese. Chinese pages use line-height 2.
- Minimum tap target 44px. Card radius 14px.
- The rebuild must stay at least on par with the previous UI and UX. No visual regressions. `PARITY.md` records what Michael approved screen by screen. Do not alter an approved screen's look without asking.

## 4. Language rules

Apply to all UI strings, user-facing comments and docs. `npm run lint:copy` enforces most of these; never weaken the linter to make it pass.
- No em dashes, ever. American English.
- Banned: risk-free, completely inert, zero interactions, zero toxicity, zero contraindications, no adverse effects, proven, bolus (say "rapid-spike delivery"), standard of care, neutral, synergy, goal, inhaler (say "device"), purity, certified, certification, accredited, graded, HQ Rated.
- Retired figures: 13.75, 27%, 1,000 papers. Never use them.
- Chinese is Traditional Chinese, Taiwan usage. Use 攝取量 (intake), never 劑量 (dose) or 療程 (course of treatment). No mainland vocabulary such as 設置 (settings), 保存 (save), 數據 (data), 當前 (current), 實時 (real time).
- Michael cannot read Chinese. Every Chinese string added or changed carries its English translation in a code comment on the same or adjacent line. All new Chinese copy needs native ZH-TW review before release; flag it in the PR description.
- No medical claims. Mechanism language is hedged as a hypothesis under investigation.
- A line containing `lint-allow` is skipped by the linter. Use it only for a comment that states a rule itself.

## 5. Working rules for every session

- Plan first. List every file you intend to touch and wait for approval before writing code. Reply "Yes, proceed." from Michael means go.
- Modify only the files in the approved plan. One file at a time. Show exact FROM/TO changes.
- Stop and ask before touching shared utilities, auth, `src/lib/hq.ts`, the migration, or the store layer.
- No refactoring, dependency changes, or changes to queries, date logic or data fetching unless the task names them.
- This repo is PUBLIC. Never commit secrets, a service-role or secret key, or a private `.env`. Only the Supabase publishable key may appear client-side, and only because RLS is on. `.env.production` is committed on purpose and holds only that public key.
- After any data-access change, list the affected tables (`profiles`, `devices`, `entries`) and confirm their RLS policies. Rerun `supabase/tests/rls_and_formula_test.sql`; the last line must read `ALL RLS AND FORMULA TESTS PASSED`.
- Work on a branch and open a pull request. Never push to main. Never merge; Michael merges.
- Do not state a citation, study figure, journal, author or year from memory. If copy needs one, say it is unverified and ask.
- Do not imply that any clinic or customer uses the app or a device. Zero machines are placed.
- Decisions belong to Michael. A suggestion is never a decision; record rulings only where he gave them (`docs/SESSION_BLOCK_*`).
- Michael is not a developer. Explain results in plain language and say what you did not verify.
