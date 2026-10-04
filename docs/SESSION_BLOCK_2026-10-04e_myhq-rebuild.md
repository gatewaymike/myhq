# SESSION BLOCK 2026-10-04e: MyHQ rebuild, sessions 1 to 4 (setup, Log, sign-in, Today, History)

**Chat:** Gateway H2 Strategy project, MyHQ rebuild chat (opened from HANDOFF_myhq-rebuild_2026-10-04.md at 18:25 Taiwan)
**Scope declared:** MyHQ rebuild, from scratch, off Hostinger Horizons. Rules only on MyHQ.
**Modules held:** KERNEL.md, MODULE_WEBSITE.md and MODULE_STANDARD.md (all exported 2026-10-04). EVIDENCE, US, TAIWAN and VHLIFE not held.
**Template:** v2. Labels below (M, S, W, D) are local; the fold assigns R, Q and T numbers.

---

## RULED BY MICHAEL

| Label | Time (Taiwan) | Ruling | Words or act |
|---|---|---|---|
| M1 | 18:46 | **The MyHQ palette is proposal B** (tokens in D1). Closes the preview approval R-366 required | "let's go with color palette proposal B" |
| M2 | 18:46 to 19:18 | **Stack accepted by conduct, not by explicit ruling:** code on GitHub (`gatewaymike/myhq`), hosting on Vercel (project `myhq`, team GatewayH2, Hobby), backend on the new Supabase project. Michael created the repository, installed the Claude GitHub app and deployed on Vercel | acts, 18:46 to 19:18 |
| M3 | 19:00 | **The example inhalation device is named "Example device", never "inhaler"** ("inhaler sounds like someone with asthma would use") | "maybe change the word 'inhaler' to 'device'" |
| M4 | 19:23 | **The parity gate stands as the working rule:** no next screen is built before Michael's verdict on the current one | "slow down, i still haven't given you my verdict on the 'new entry' page" |
| M5 | 19:28 | Route toggles carry the water drop and wind icons, as in the live app | "Could you add the water drop and wind icons" |
| M6 | 19:32 | **Log screen: keep the original's simple UX and its large "NEW ENTRY" title** | "i like the simplicity of the UX on the original and the larger 'new entry' title. play around with that." |
| M7 | 19:36 | **Log screen approved at the parity gate** | "looks great. lock it in." |
| M8 | 19:37 | **Header wordmark: the ™ sits at the top of the Q; the wordmark and "H₂ intake tracker" are brightened** (values chosen by Claude under R-366, D1) | "the 'TM' should be at the top of the Q ... brighten the logo and 'H2 intake tracker' a bit" |
| M9 | 20:25 | **Sign-in passed Michael's end-to-end test**, and the database RLS and formula test passed in Supabase | "all passed" |
| M10 | 20:34 | **Today screen approved.** The 7-day average shows only its label, "Last 7 days, today included", with no arithmetic line. Flagged: the ring scale (full circle 15.0 HQ, stepping up in fives) was shown and approved with the screen, not named in words | "looks good. showing the math for the 7 day average isn't necessary though." |
| M11 | 21:00 | **History with Trends approved.** Flagged: the screen omits the live app's streak counter (goal gamification, not on the v1 list); Michael approved the screen without addressing the streak in words | "looks great!" |

## SUGGESTED, NOT RULED (expires 2026-10-18)

| Label | Suggestion |
|---|---|
| S1 | The Supabase project address and publishable key live in `.env.production` in the repository (public by design; they ship in the app bundle), so Vercel needs no settings. The secret key never enters any file |
| S2 | Database input ceilings, to block typos: at most 5,000 mL per water entry, 20 mg/L, 1,440 minutes, 10,000 mL/min of hydrogen flow. The app mirrors them |
| S3 | Schema fields beyond the handoff draft: `entries.source` (app, guest or import) and `profiles.onboarded_at` |
| S4 | Accounts: password of at least 8 characters; email confirmation on; Supabase's built-in email sender until a custom sender (for example Resend) is set up before public launch; branded bilingual emails later |
| S5 | Make the repository private (it is public; nothing secret is in it) |
| S6 | **The privacy policy is written and hosted by the website chat on gatewayh2.com;** the app links it on sign-in, create account and Settings once it is live. Until then the create-account text omits "privacy policy". It blocks cutover, not building |
| S7 | The app's copy lint blocks "inhaler" everywhere, extending M3 beyond the one example |
| S8 | Remaining order: Settings (equipment management, download my data as CSV and JSON, delete my account), first-run cards, import from the old app, then the cutover checklist (privacy link, native ZH-TW review of every string, og image 1200 × 627, DNS at Hostinger) |
| S9 | The Chinese disclosure line stays in English until the ruled R-251 text is supplied to this chat |
| S10 | Header title glow stays off under item 20; the large titles are bright cyan without glow (Michael has not asked for the glow back) |

## WORLD (facts observed or reported this session)

| Label | Fact | Source |
|---|---|---|
| W1 | Repository `gatewaymike/myhq` (public), 16 commits on `main` by 21:00; the Claude GitHub app is installed; pushes work; tag pushes are refused by the session's git proxy, so approvals are recorded in `PARITY.md` | git |
| W2 | **New Supabase project `mksxiftqzetkyqmkhjip`.** Michael ran `0001_init.sql` and the two-account test (`ALL RLS AND FORMULA TESTS PASSED`), set the Site URL and redirect URL to `myhq-peach.vercel.app`, and confirmed email confirmation is on. Region not verified by Claude | Michael, 19:50 and 20:25 |
| W3 | Vercel production address `https://myhq-peach.vercel.app`; every push to `main` redeploys. The project's Environments settings page showed no Environment Variables entry where Claude expected it (worked around by S1) | Michael's screenshots, 19:18 and 19:49 |
| W4 | **The rebuild's backend is Supabase; the live app's backend remains PocketBase until cutover** (block 2026-10-04d, W1). The preferences line "backend is Supabase, not PocketBase" is true of the rebuild only | this session; prior block |
| W5 | Verification: the 10 handoff test vectors plus 11 property tests pass in TypeScript; the same vectors pass in the database's generated `hq` column; the RLS test passes on a local Postgres and in Supabase, and fails as it should with RLS switched off | local runs; Michael's Supabase run |
| W6 | **The live app has no privacy policy link** | Michael, 21:02 |
| W7 | **Correction:** Claude built sign-in before Michael's verdict on the Log screen (19:23), breaking the parity gate; it was paused and the gate restated (M4) | this session |
| W8 | Live preview pages: "MyHQ Palette Proposal" and "MyHQ Rebuild Preview" (example data on the device only) | Artifacts |

## SEEDS CHANGED

| Label | Change |
|---|---|
| D1 | **MyHQ palette (M1, supersedes the locked MyHQ app palette line in the preferences, which is Michael's to edit):** background #020E0A, card #08231B, card 2 #0C2E24, border #1B4537, ring track #0E2A22, headline text #E8F3EF, body #C9DDD7, labels #8EADA4, water and primary #00E5FF, inhalation #B488FF, gold #C8A84B (the "Both routes today" badge), mint #02C39A, error #FF7A7A. Wordmark only (M8): "My" #E2C466, "HQ" and ™ #2EE6B8. Every text color clears 4.5:1 on cards. Fonts unchanged (Playfair Display italic 600, DM Mono, DM Sans) |
| D2 | **T-72 unblocked and in progress.** Approved at the parity gate: palette, header, Log, Today, History with Trends; sign-in passed. Record: `PARITY.md` in the repository |
| D3 | Built and live on `myhq-peach.vercel.app` (not yet on h2tracker.gatewayh2.com; the live app is untouched): Log (timer that survives a locked phone, equipment picker, one-tap repeat, the math, double-save guard, yesterday and pick-a-time); guest mode with hand-over into an account at sign-in; create account, sign in, password reset; Today (ring with the 10.0 tick, Both routes today badge, 7-day average, lifetime); History (filters, edit with time, two-tap delete); Trends (14 or 30 days, stacked daily HQ, reference line at 10.0); minimal Settings (account, language, disclaimer, R-273 disclosure) |
| D4 | Open items carried: privacy policy page (S6, website chat); the old app's JSON export from the Horizons Data tab and Michael's decision on the duplicate 2026-06-21 inhalation entry, before import; the ruled Chinese disclosure text (S9); native ZH-TW review of every string before cutover; og image; DNS cutover |
| D5 | Files: repository `gatewaymike/myhq` (`supabase/migrations/0001_init.sql`, `supabase/tests/rls_and_formula_test.sql`, `src/lib/hq.ts` with `hq.vectors.json`, `src/i18n/strings.ts`, `PARITY.md`); `myhq_0001_init.sql` and `myhq_rls_and_formula_test.sql` in outputs; this block |
