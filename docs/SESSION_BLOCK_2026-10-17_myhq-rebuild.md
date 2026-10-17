# SESSION BLOCK 2026-10-17 (template v2; follows block 2026-10-09, MyHQ rebuild)

**Chat:** Gateway H2 Strategy project, MyHQ rebuild chat, sessions 11 to 15, 2026-10-09 16:35 to 2026-10-17 21:25 Taiwan time.
**Scope:** MyHQ rebuild only (repo `gatewaymike/myhq`).
**Modules held:** KERNEL, MODULE_WEBSITE. **MODULE_STANDARD was not pasted in this chat**; nothing below rules in its domain.
**Labels:** local; the fold assigns R, Q and T numbers.
**Repo:** commits `0ad10d7` to `70c2acd`. Approvals log: `PARITY.md`.

---

## RULED BY MICHAEL

| Label | Time (Taiwan) | Ruling | His words or act |
|---|---|---|---|
| M25 | 10-10 09:42 | **VHLife invoices Taiwan buyers.** Answers Q-53. The app's Chinese disclosure now uses the native reviewer's full translation of R-273, invoicing clause included; **B4 (Chinese mode uses R-251) is superseded for the app** | "No, they do invoice the taiwanese buyers" |
| M26 | 10-14 20:52 | **Supabase pause: option B now.** A scheduled job keeps the free project awake until a Pro decision | "go" |
| M27 | 10-14 21:13 | **Settings install help approved (handoff 3f, S15):** placement at the top of Settings, the English wording, the Chrome Install button, the Samsung Internet line sending people to Chrome. **The PWA layer is fully approved** | "approved" |
| M28 | 10-17 10:21 | **Google Play first, then the App Store** (S18) | "1. Yes" |
| M29 | 10-17 10:21 | **Individual developer accounts on both stores; Michael's legal name as seller** (S19) | "2. Yes" |
| M30 | 10-17 10:21 | **Build a daily log-reminder notification before the Apple submission** (S21; new screen, parity gate) | "3. Ok" |
| M31 | 10-17 10:21 | **Permanent app ID `com.gatewayh2.myhq`** on both stores | "4. Ok" |

---

## SUGGESTED, NOT RULED (expires 2026-10-31)

| Label | Suggestion |
|---|---|
| S23 | **Supabase Pro from cutover day:** US$25 a month (about NT$804 at 32.17); never paused, daily backups kept 7 days. Store reviewers test at random times, so this should precede both store submissions |
| S24 | **Google Play path:** package the approved PWA as a Trusted Web Activity (needs a verification file on h2tracker.gatewayh2.com, so after DNS cutover); listing EN plus ZH (native read), screenshots, 1024 × 500 banner, Data safety, content rating; closed test with 14 to 15 testers who open the app a few times a week and try each main feature |
| S25 | **App Store path:** Capacitor wrapper of the same codebase, built on a cloud Mac service (to be named with current price when reached); TestFlight on family iPhones; review notes with a test account |
| S26 | Start before cutover: the Google Play Console account (identity checks take days) and the tester email list. Apple enrollment can wait until the Android test runs |
| S27 | Send the reviewer Questions 1 and 3 again (氫能設備 (hydrogen-energy equipment) vs 氫氣設備 (hydrogen gas equipment); the 水 / 氫水 / 飲水 (water / hydrogen water / drinking water) mix). Not cutover blockers |
| S28 | Carried, still open: S4 (custom email sender before public launch), S5 (make the repo private), S11 and S12 (AI Builder prompt hygiene), S17 (cutover order) |

---

## WORLD

| Label | Fact | Source |
|---|---|---|
| W24 | **Native ZH-TW review complete.** Round 1 (10-10): all 176 rows, 165 OK, 11 changed; 10 applied, row 19's 「今日兩種C皆有」 read as a typo for 「今日兩種方式皆有」 (both ways today). Round 2 (10-13): 9 rows, 8 OK, 1 changed (pwa.updateReady 新版本已就緒。 (A new version is ready.) to 已有新版本。 (A new version is available.)). The 4 follow-up questions came back unanswered. Every Chinese string in the app has had a native read | Reviewer's sheets |
| W25 | The app's Chinese disclosure now reads: Gateway H₂ 負責氫能設備之銷售及配置。我們經銷之設備自行訂定銷售價格，並於設備售出時取得相應之銷售利潤；VHLife 則直接向終端客戶開立發票，並負責提供相關售後及維護服務。(Gateway H₂ handles the sale and placement of hydrogen equipment. We set the selling price for the equipment we distribute and earn the corresponding profit when it sells; VHLife invoices the end customer directly and provides after-sales and maintenance service.) Reviewer marked it OK | strings.ts, round 2 |
| W26 | **Supabase emailed 2026-10-13:** project MyHQ (`mksxiftqzetkyqmkhjip`) was scheduled to pause after 7 days of low activity. Free projects pause after 1 week; Pro never pauses, US$25 a month ([Supabase pricing](https://supabase.com/pricing)). Michael restored the project on 10-14 | Michael's screenshot; Supabase pricing page |
| W27 | **Keep-awake job live and verified green** (`.github/workflows/keep-supabase-awake.yml`, run on `97c24ed`): every 3 days at 10:17 Taipei; anonymous query is refused by Postgres (code 42501, no table grants for anon, as designed), and the job counts that reply as proof the database is awake; a failed run emails the repo owner. GitHub disables scheduled workflows in a public repo after 60 days without activity ([GitHub Docs](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/disabling-and-enabling-a-workflow)) | Michael's run screenshots, 10-14 21:11 |
| W28 | Google Play closed testing: 12 testers opted in for 14 consecutive days; **no published daily-use requirement**; at production access Google asks whether testers used all features and how usage matched real use, and thin engagement can extend testing ([Google](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB)) | Checked 10-09, restated 10-17 |
| W29 | Michael has no iPhone; his family has iPhones and will test through TestFlight | Michael, 10-17 10:21 |
| W30 | USD/TWD 32.1698 at the 2026-10-13 close ([Pound Sterling Live](https://www.poundsterlinglive.com/data/currencies/usd-pairs/USDTWD-exchange-rate)). Apple US$99 a year ≈ NT$3,185; Google US$25 once ≈ NT$804; Supabase Pro US$25 a month ≈ NT$804 | Source linked |
| W31 | Tests: 23 pass; copy lint clean through `70c2acd` | Local runs |

---

## SEEDS CHANGED

| Label | Change |
|---|---|
| D15 | **T-72 status:** every screen approved, all Chinese native-reviewed, PWA layer approved, database kept awake. **The only remaining step before the new MyHQ replaces the old app is the DNS cutover** per `docs/CUTOVER_RUNBOOK_2026-10-07.md` (Vercel domain, Supabase URLs, one Hostinger ALIAS row, 12-step phone test). Live app at h2tracker.gatewayh2.com still untouched |
| D16 | **Store apps track opened** (follows operations-chat M1): order, account type and app ID ruled (M28 to M31); next actions are Michael's Play Console account and tester list |
| D17 | **Files:** repo `.github/workflows/keep-supabase-awake.yml`, `PARITY.md` through `70c2acd`, this block. Outputs: `MyHQ_ZH-TW_review_sheet_round2_2026-10-10.xlsx` |
| D18 | **Cross-chat, for the website chat (not decided here):** (a) the live gatewayh2.com Chinese footer (R-251) lacks the invoicing clause now that M25 confirms VHLife invoices Taiwan buyers; the app and site now differ in Chinese; (b) the footer uses 氫氣設備 (hydrogen gas equipment) while the app uses the reviewer's 氫能設備 (hydrogen-energy equipment); pick one; (c) carried from block 10-09: 中立 (neutral) as a negation, "Gateway H2" vs "Gateway H₂", robots.txt check |
| D19 | **For the fold:** close Q-53 (VHLife invoices Taiwan buyers) and mark B4 superseded for the app; R-251 stays the website's current text until the website chat changes it |
