# HANDOFF: MyHQ rebuild, from cutover blockers to launch (2026-10-07)

Paste this into a new chat in the **Gateway H2 Strategy** project, together with KERNEL.md, MODULE_WEBSITE.md and MODULE_STANDARD.md. In the first line of your first reply, say the scope you're working in. **Scope: the MyHQ rebuild only.** The gatewayh2.com website belongs to the website chat. The one exception is the AI Builder prompt for the privacy page, which this chat wrote and Michael is running now.

Part 1 is how to take over. Part 2 is the session block for Michael to fold into the master record.

---

## PART 1: TAKEOVER

### Where things live

| Thing | Where |
|---|---|
| Code | GitHub `gatewaymike/myhq`, branch `main`. Attach it with `add_repo` (owner `gatewaymike`, repo `myhq`, access `push`) and clone it. The Claude GitHub app is installed. Tag pushes are refused by the git proxy, so approvals are recorded in `PARITY.md` |
| New app (live preview) | `https://myhq-peach.vercel.app`. Vercel redeploys on every push to `main` |
| Old app (live, **do not touch until cutover**) | `h2tracker.gatewayh2.com`, built in Hostinger AI Builder, backend PocketBase |
| Database | Supabase project `mksxiftqzetkyqmkhjip`, region ap-northeast-2 (Michael confirmed it). The project URL and publishable key are in `.env.production`. They're public by design. **The service_role or secret key never goes in any file or message** |
| Approvals log | `PARITY.md` in the repo |
| Earlier records | `docs/SESSION_BLOCK_2026-10-04e_myhq-rebuild.md`, `docs/HANDOFF_website-chat_privacy-and-zh-disclosure_2026-10-06.md` (also in the project under `claude/`) |

### How Michael works with this build (hard rules)

1. **Parity gate.** One screen at a time. Nothing moves on until Michael gives his verdict. Breaking this once got "slow down".
2. **Hostinger Horizons is now called "Hostinger AI Builder".** Michael **cannot create or edit files there by hand**. Every change goes through a prompt with these parts:
   - the STRICT RULES boilerplate;
   - a stop-and-wait gate before any code is written;
   - "Yes, proceed." to release it.

   The builder **cannot read files before it starts**, so a prompt must never ask it to quote existing lines. Tell it which anchors to find, and to STOP if they are missing.
3. **Two separate AI Builder projects:** the MyHQ app (h2tracker) and the website (gatewayh2.com). Every AI Builder prompt names which project it goes into, in its first line.
4. Copy rules:
   - no em dashes, American English;
   - banned terms per the kernel; `scripts/lint-copy.mjs` also blocks "inhaler", "goal", "synergy", "purity" and mainland Chinese vocabulary;
   - every piece of Chinese carries its English;
   - 攝取量 (intake), never 劑量 (dose).
5. A suggestion is never a ruling. A draft is never a send. No guessed URLs or emails (kernel rule 25).

### Built and approved (all in PARITY.md)

| Item | Status |
|---|---|
| Palette | Proposal B |
| Header | Wordmark with ™ at the top of the Q |
| Screens | Log, Today, History with Trends, Settings and the first-run cards are approved. Sign-in passed Michael's end-to-end test |
| Link preview image | Approved |
| Tests | 23 unit tests pass (`npm test`). The database RLS and formula test passed in Supabase |
| Not carried over | No data comes over from the old app (Michael ruled this). The import step is dropped |

### Cutover blockers, in order

1. **The privacy page on gatewayh2.com (in progress right now).**
   - **Where it stands:** Michael is running `PROMPT_ai-builder_myhq-privacy-page_2026-10-07.txt` (in outputs; the page source is also there as `MyHQPrivacyPage.jsx`) in the **website** project. The builder's plan was approved:
     - a new file `apps/web/src/pages/MyHQPrivacyPage.jsx`;
     - two added lines in App.jsx: an import below the BlogPage import, and a `/privacy/myhq` route below the `/blog` route;
     - nothing deleted.

     Michael was told to reply "Yes, proceed."
   - **What he'll bring back:** the two App.jsx lines, the builder's list of changed files, and whether `https://gatewayh2.com/privacy/myhq` loads with the header and footer.
   - **What to check:**
     - the file list is exactly those two files;
     - nothing else changed;
     - the page shows the effective date October 10, 2026;
     - the contact address is michael@gatewayh2.com;
     - the Supabase region is named.
   - **Then:** in `src/screens/auth/AuthScreens.tsx`, change `export const PRIVACY_URL: string | null = null;` to `'https://gatewayh2.com/privacy/myhq'`. That switches on the links on sign-in, create account and Settings (Settings uses the shared `Legal` component), and swaps `auth.agreeNoPrivacy` for `auth.agree`. Run lint, the tests and the build, push, and check it on the Vercel URL.
2. **The R-251 Chinese disclosure.** `legal.disclosure` zh is `null` in `src/i18n/strings.ts`, so Chinese mode shows the English R-273 line.
   - **Needed from Michael:** the ruled zh-TW footer text, pasted as text, and whether FT2 v2 passed its native read. The live Chinese footer may still say "commission"; if it does, that text is not usable.
   - **Ruling B4:** Chinese mode uses the R-251 wording; English keeps R-273 verbatim.
3. **The native ZH-TW review.** The sheet is `MyHQ_ZH-TW_review_sheet_2026-10-05.xlsx` (176 strings). Apply the corrections when it comes back, then re-run the lint.
4. **DNS cutover.** Write click-level steps for:
   - pointing `h2tracker.gatewayh2.com` at Vercel: Hostinger DNS records, adding the domain in Vercel, and waiting for the SSL certificate;
   - in Supabase Auth, adding the new Site URL and redirect URL;
   - after the switch, a short phone test: sign up, confirmation email, password reset, log an entry, download CSV.

   Only after Michael approves cutover. Don't guess Hostinger menu names; ask him for a screenshot of the DNS screen.
5. **Before public launch (suggested, not ruled):**
   - make the repo private (S5 in block 04e);
   - set up a custom email sender instead of Supabase's built-in one (S4);
   - add a gatewayh2.com footer link once a site-wide policy exists (B3 says no footer link until then).

### The incident to know about (2026-10-07, about 09:50 Taiwan)

Michael first pasted the privacy page prompt into the **MyHQ app** AI Builder project by mistake. The builder found no BlogPage anchor, but its build summary reported six files removed:

- HQSquareIcon.jsx
- NotesDisplay.jsx
- SplashScreen.jsx
- WeeklyCard.jsx
- WeeklyMacroSummary.jsx
- useEUCalculations.js

Michael said "my mistake" and later confirmed the app is restored ("yes"). Claude has not verified this. If anything on h2tracker.gatewayh2.com looks broken (the splash screen, the weekly view), the restore is the first suspect.

---

## PART 2: SESSION BLOCK 2026-10-07 (template v2; follows block 2026-10-04e)

**Chat:** Gateway H2 Strategy project, MyHQ rebuild chat, sessions 5 to 7, 2026-10-04 21:00 to 2026-10-07 10:04 Taiwan time.
**Scope:** MyHQ rebuild only.
**Modules held:** KERNEL, MODULE_WEBSITE, MODULE_STANDARD.
**Labels:** local; the fold assigns R, Q and T numbers.

### RULED BY MICHAEL

| Label | Time (Taiwan) | Ruling | His words or act |
|---|---|---|---|
| M12 | 10-04 21:25 | **Settings approved.** Contents: account, My equipment (edit, remove, add), language, download CSV and JSON, delete my account or erase this device, About HQ, legal. Michael tested the downloads and deletion with a throwaway account | "both cleared. Setting page good!" |
| M13 | 10-05 09:03 | **First-run cards approved.** Three cards, skippable, shown once, can be replayed from Settings | "The cards are great." |
| M14 | 10-05 09:03 | **No data carries over from the old app.** The import step is dropped | "I dont need any data from the old app to carry over." |
| M15 | 10-05 10:07 | **Link preview image approved** (`public/og-image.png`, 1200 × 627) | "Approved" |
| M16 | 10-07 09:21 | **Privacy page rulings B1 to B4** | "Ok to all B1-B4" |
| | | B1: the policy lives at `https://gatewayh2.com/privacy/myhq` and covers the app only | |
| | | B2: English only at cutover. Chinese comes after a native read; Chinese mode links the English page | |
| | | B3: no gatewayh2.com footer link until a site-wide policy exists | |
| | | B4: Chinese mode uses the R-251 disclosure wording; English keeps R-273 verbatim | |
| M17 | 10-07 09:21 | **Privacy page facts:** operator "Gateway H₂, based in Taiwan"; contact michael@gatewayh2.com; Supabase region ap-northeast-2; effective date October 10, 2026 | Michael's message giving the facts |
| M18 | 10-07 ~10:04 | **The AI Builder plan for the privacy page approved** (website project; one new file and two App.jsx lines; nothing deleted). Claude advised "Yes, proceed."; not yet confirmed as sent | the plan was relayed and released |

### SUGGESTED, NOT RULED (expires 2026-10-21)

| Label | Suggestion |
|---|---|
| S11 | Every AI Builder prompt names its target project (app or website) in its first line, so it can't be pasted into the wrong one again |
| S12 | AI Builder prompts never ask the builder to quote existing code before it starts. They name the anchors and tell it to STOP if one is missing |
| S13 | Cutover order: privacy link, R-251 Chinese line, native ZH-TW corrections, DNS and Supabase redirect URLs, phone test |
| S14 | Carried from block 04e, still open: S4 (custom email sender before public launch), S5 (make the repo private) |

### WORLD

| Label | Fact | Source |
|---|---|---|
| W9 | **Hostinger Horizons is now called "Hostinger AI Builder".** Michael can't create or edit files there by hand. The builder can't read files before it starts | Michael, 10-07; the builder's replies |
| W10 | **Incident:** the privacy prompt was pasted into the MyHQ app project. The builder's summary reported six app files removed (listed in Part 1). Michael says the app is restored; Claude has not verified this | Michael and the builder's reply, 10-07 09:56 to 10:03 |
| W11 | The website code in AI Builder lives under `apps/web/src/pages/` (BlogPage.jsx's folder) | the builder's plan, 10-07 |
| W12 | Supabase region confirmed as ap-northeast-2 (Seoul). This closes the "region not verified" note in block 04e, W2 | Michael, 10-07 |
| W13 | Unit tests: 23 pass (HQ formula vectors, property tests, CSV and JSON export) | local run |

### SEEDS CHANGED

| Label | Change |
|---|---|
| D6 | **T-72 status:** every screen is approved. What's left is the cutover blockers in Part 1. The live app is still untouched (apart from the W10 incident, reported restored) |
| D7 | **Files:** `MyHQPrivacyPage.jsx`, `PROMPT_ai-builder_myhq-privacy-page_2026-10-07.txt`, `MyHQ_ZH-TW_review_sheet_2026-10-05.xlsx` and `myhq-og-image-1200x627.png` in outputs. In the repo: `PARITY.md` updated through B1 to B4; this handoff at `docs/HANDOFF_myhq-rebuild_2026-10-07.md` |
| D8 | **The preferences line "backend is Supabase, not PocketBase" is true of the rebuild only.** The live app stays on PocketBase until cutover (unchanged from block 04e, W4). Editing the preferences is Michael's call |
