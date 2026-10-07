# SESSION BLOCK 2026-10-07: MyHQ rebuild, sessions 5 to 7 (Settings, first-run cards, link preview image, privacy page)


**Chat:** Gateway H2 Strategy project, MyHQ rebuild chat, sessions 5 to 7, 2026-10-04 21:00 to 2026-10-07 10:04 Taiwan time.
**Scope:** MyHQ rebuild only.
**Modules held:** KERNEL, MODULE_WEBSITE, MODULE_STANDARD.
**Labels:** local; the fold assigns R, Q and T numbers.

## RULED BY MICHAEL

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

## SUGGESTED, NOT RULED (expires 2026-10-21)

| Label | Suggestion |
|---|---|
| S11 | Every AI Builder prompt names its target project (app or website) in its first line, so it can't be pasted into the wrong one again |
| S12 | AI Builder prompts never ask the builder to quote existing code before it starts. They name the anchors and tell it to STOP if one is missing |
| S13 | Cutover order: privacy link, R-251 Chinese line, native ZH-TW corrections, DNS and Supabase redirect URLs, phone test |
| S14 | Carried from block 04e, still open: S4 (custom email sender before public launch), S5 (make the repo private) |

## WORLD

| Label | Fact | Source |
|---|---|---|
| W9 | **Hostinger Horizons is now called "Hostinger AI Builder".** Michael can't create or edit files there by hand. The builder can't read files before it starts | Michael, 10-07; the builder's replies |
| W10 | **Incident:** the privacy prompt was pasted into the MyHQ app project. The builder's summary reported six app files removed (listed in Part 1). Michael says the app is restored; Claude has not verified this | Michael and the builder's reply, 10-07 09:56 to 10:03 |
| W11 | The website code in AI Builder lives under `apps/web/src/pages/` (BlogPage.jsx's folder) | the builder's plan, 10-07 |
| W12 | Supabase region confirmed as ap-northeast-2 (Seoul). This closes the "region not verified" note in block 04e, W2 | Michael, 10-07 |
| W13 | Unit tests: 23 pass (HQ formula vectors, property tests, CSV and JSON export) | local run |
| W14 | This chat closed at 10:06 because it was getting full. The work moves to a new chat via `HANDOFF_myhq-rebuild_2026-10-07.md` (project `claude/`, repo `docs/`) | Michael, 10:04 |

## SEEDS CHANGED

| Label | Change |
|---|---|
| D6 | **T-72 status:** every screen is approved. What's left is the cutover blockers in Part 1. The live app is still untouched (apart from the W10 incident, reported restored) |
| D7 | **Files:** `MyHQPrivacyPage.jsx`, `PROMPT_ai-builder_myhq-privacy-page_2026-10-07.txt`, `MyHQ_ZH-TW_review_sheet_2026-10-05.xlsx` and `myhq-og-image-1200x627.png` in outputs. In the repo: `PARITY.md` updated through B1 to B4; the handoff at `docs/HANDOFF_myhq-rebuild_2026-10-07.md`; this block at `docs/SESSION_BLOCK_2026-10-07_myhq-rebuild.md` |
| D8 | **The preferences line "backend is Supabase, not PocketBase" is true of the rebuild only.** The live app stays on PocketBase until cutover (unchanged from block 04e, W4). Editing the preferences is Michael's call |
