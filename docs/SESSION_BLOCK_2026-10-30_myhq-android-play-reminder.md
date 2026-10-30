# SESSION BLOCK (template v2): MyHQ rebuild chat, 2026-10-30

Scope: MyHQ only (repo gatewaymike/myhq). Held: KERNEL_4.md and MODULE_WEBSITE. MODULE_STANDARD never pasted, so nothing is ruled in its domain. Covers events since the 2026-10-17 block. Not folded into the master; for Michael to fold.

## RULED BY MICHAEL

2026-10-20 (all option a)
- Play reviewer account on a plus address of his Gmail (mcjaeger51+playreview@gmail.com).
- Target audience 18 and over only.
- Health info not declared in Data safety.
- Health declaration: "Nutrition and Weight Management".
- Store title: "MyHQ: Hydrogen Intake Tracker".
- Followed my lean on Play Console items: "Restrict users ... minors" box left unchecked; partial-deletion Data safety answer "No for now"; external marketing left checked; AI asset declaration "Don't label assets"; AI translation dismissed.

2026-10-29
- Supabase auth email moves to Resend (option A).
- Daily log reminder (R-466): placed below My equipment; skipped on days already logged; website shows "Daily log reminders are available in the MyHQ app." (answer 4b); notification text "Time to log today's hydrogen intake." / 該記錄今天的氫氣攝取量了。(Time to log today's hydrogen intake.).
- Reminder device tests A to F passed on 1.1.1 (Michael's report, Samsung).

Carried, still in force: icon A; offline default (guest works offline, signed-in saves need a connection); VHLife invoices Taiwan buyers; Google Play first, then Apple; Capacitor for both; individual accounts; reminder ships before the Apple submission (R-466 / M30); app ID com.gatewayh2.myhq.

## SUGGESTED, NOT RULED (expires 2026-11-13 unless ruled)
- Default reminder time 20:00. Michael answered "don't know"; kept as built.
- Light mode: dark only for launch, light mode post-launch (Follow system / Dark / Light, device-only setting, swatch sheet first). Cyan #00e5ff on white is about 1.5:1 and gold #C8A84B about 2.3:1, so a light palette is a brand decision. Unanswered.
- Supabase Pro (US$25 a month, about NT$804).
- Make the repo private (S5).
- Branded bilingual auth email templates (S4).
- Hide the web "available in the MyHQ app" note until the app is public.
- Website privacy page hardening (deletion requests via michael@gatewayh2.com; mention single-entry deletion in History) so the partial-deletion answer can become Yes.
- If the day-ahead check shows reminders arriving an hour or more late: offer the exact-alarm option (Play exact-alarm policy wording must be verified first).

## WORLD CHANGED
- Play Console app created; store listing, data safety, content ratings and assets submitted; closed test "Closed testing - Alpha" approved and live (15 testers, email list "MyHQ"). At 10:31 on 2026-10-29: 0 opted in. 14-day clock starts once 12 are opted in.
- Closed track serves 1.0.0 (code 1). Internal track has 1.1.1 (code 3), Michael's phone only. Web is 1.1.1 on Vercel.
- Supabase built-in email only reaches team members (2 per hour), so sign-up emails never arrived. Fixed with Resend SMTP (domain mail.gatewayh2.com, verified 2026-10-29 12:03). Test sign-up email arrived.
- Reminder feature built: 14 rolling local notifications, device-only setting, no Supabase, privacy page or Data safety change. CI Permission guard added (fails on exact-alarm permissions or missing POST_NOTIFICATIONS). 1.1.0 failed silently on device because sync errors were swallowed (and the first test time had already passed); 1.1.1 shows the next reminder or the error in Settings. 35 unit tests passing.
- Latest commits: f399722 (test E logged), 8504fc4 (handoff file).

## SEEDS CHANGED
- New open: day-ahead timing check of an inexact alarm (set 1:35 PM, result not yet reported).
- New open: R-466 parity verdict, held for the timing check and the default-time answer.
- New open: promote 1.1.x to the closed track (needs the signed .aab from the latest green GitHub Actions run, version code above 3).
- New open: reviewer account sign-up and 2 to 3 logged entries; opt-in on Michael's phone; native ZH-TW review of the reminder strings.
- New open: tester opt-in chase after 2 to 3 days.
- Unchanged: Apple path (US$99 a year, about NT$3,185; cloud Mac build; family iPhones via TestFlight).
- Flagged, outside this scope: website Chinese footer and privacy items.

Security reminders in force: the keystore, its password and the Supabase secret key never go to Claude or into any file; never GRANT ... TO anon; the Resend key goes only into Supabase.
