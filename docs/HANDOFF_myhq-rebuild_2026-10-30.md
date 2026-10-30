# HANDOFF: MyHQ rebuild chat, 2026-10-30

Scope for the new chat: MyHQ only (repo gatewaymike/myhq). Paste KERNEL_4.md and MODULE_WEBSITE with this file. MODULE_STANDARD has never been pasted, so nothing is ruled in its domain. Declare the scope in one line at open.

## 1. State in one paragraph
Web app is 1.1.1 on Vercel (h2tracker.gatewayh2.com). Android app `com.gatewayh2.myhq` is on Google Play closed testing ("Closed testing - Alpha", email list "MyHQ", 15 testers). Closed track still serves 1.0.0 (version code 1). Internal track has 1.1.1 (code 3, Michael's phone only). Latest commit f399722. Daily log reminder (R-466) passed tests A to F on Michael's Samsung. Verdict is not yet recorded.

## 2. Security rules (still in force)
- Never ask for or accept the keystore or key-info file. Keystore and password never go to Claude.
- The Supabase service_role or secret key never goes in any file or message.
- Never GRANT ... TO anon.
- The Resend API key is pasted only into Supabase. The Play reviewer account password is typed only into Play Console.

## 3. RULED BY MICHAEL
- Icon A. Offline default (guest works offline; signed-in saves need a connection).
- VHLife invoices Taiwan buyers. Google Play first, then Apple. Capacitor for both stores. Individual accounts.
- App ID com.gatewayh2.myhq. A reminder notification ships before the Apple submission (R-466 / M30).
- 2026-10-20 (all option a): reviewer account on a plus address of his Gmail; target audience 18 and over only; Health info not declared in Data safety; Health declaration "Nutrition and Weight Management"; store title "MyHQ: Hydrogen Intake Tracker".
- 2026-10-29: auth email via Resend (option A). Reminder placement below My equipment; skip the reminder on days already logged; website shows "Daily log reminders are available in the MyHQ app." (4b); notification text "Time to log today's hydrogen intake." / 該記錄今天的氫氣攝取量了。(Time to log today's hydrogen intake.).
- 2026-10-29: test E passed; A to F all passed on 1.1.1.

## 4. SUGGESTED, NOT RULED (nothing here is a decision)
- Default reminder time 20:00. Michael answered "don't know". Kept as built.
- Light mode: suggested dark only for launch, light mode post-launch (follow system, Dark, Light; device-only setting; swatch sheet first). Cyan #00e5ff on white is about 1.5:1 and gold #C8A84B about 2.3:1, so a light palette is a brand decision. Michael has not answered.
- Supabase Pro (US$25 a month, about NT$804). Making the repo private (S5). Branded bilingual auth email templates (S4). Hiding the web "available in the MyHQ app" note until the app is public.
- Website privacy page hardening (michael@gatewayh2.com handles deletion requests; mention single-entry deletion in History) so the partial-deletion Data safety answer can become Yes. Currently "No for now".

## 5. Open items, in order
1. Day-ahead timing check. Michael set a reminder for 1:35 PM and was to leave the app alone and report when it arrived. Ask him for the result (set 2026-10-29, due 2026-10-30). If an hour or more late, bring him the exact-alarm option and its Play policy declaration implications. Verify the exact-alarm policy wording before stating it.
2. Michael's answer on the 20:00 default.
3. On both: record the R-466 parity verdict in PARITY.md, then release 1.1.x to the closed track. Download `myhq-release-aab` from the latest green GitHub Actions run (this environment cannot download it). Play Console, Closed testing, Create new release, notes in `<en-US>` tags, version code higher than 3. An update does not reset the 14-day clock.
4. Dashboard watch: 12 of 15 testers must be opted in, then 14 consecutive days. Opt-in link: https://play.google.com/apps/testing/com.gatewayh2.myhq (not the store page). Chase stragglers after 2 to 3 days. At 10:31 on 2026-10-29 the count was 0 opted in.
5. Michael to do: sign up the reviewer account mcjaeger51+playreview@gmail.com, confirm it, log 2 to 3 entries; delete the +test1 account if unneeded; opt in on his own phone.
6. Native ZH-TW review of the reminder strings (每日記錄提醒 (Daily log reminder), 提醒時間 (Reminder time), 當天已記錄就不會提醒。(No reminder if today is already logged.), 下次提醒：{when} (Next reminder: {when}), 無法設定提醒，下次開啟 MyHQ 時會再試一次。(Could not set the reminder; will try again next time MyHQ opens.), 每日記錄提醒僅在 MyHQ App 中提供。(Daily log reminders are available only in the MyHQ app.)) and the tester messages.
7. Later: Apple (individual account US$99 a year, about NT$3,185; Capacitor iOS on a cloud Mac build service; TestFlight with family iPhones; Michael has no iPhone). iPhone PWA checks from family. Airplane-mode check. Node.js 20 deprecation warning in the GitHub workflow (cosmetic). Website Chinese footer and privacy items flagged earlier (outside this scope).

## 6. Technical facts the new chat needs
- Stack: React, Vite, Tailwind, TypeScript, Supabase (RLS; anon has no table grants), Vercel, vite-plugin-pwa, Capacitor 8.5.3 with app, filesystem, share, and local-notifications 8.3.1.
- Android builds run only on GitHub Actions. This environment cannot reach Gradle, Google Maven, Supabase, or GitHub artifact storage. Release .aab is signed with the upload key (GitHub secrets); Play App Signing is on. A CI "Permission guard" step fails the build if SCHEDULE_EXACT_ALARM or USE_EXACT_ALARM is present or POST_NOTIFICATIONS is missing.
- Play Console: the internal track has its own tester checkbox that must be ticked and saved. Version codes must be unique and increasing. "Add from library" reuses an uploaded bundle.
- Auth email: Supabase's built-in sender only reaches team members (2 per hour), so it uses custom SMTP via Resend (domain mail.gatewayh2.com, Tokyo, smtp.resend.com:465, user resend, sender MyHQ <no-reply@mail.gatewayh2.com>). Free plan 3,000 per month, 100 per day.
- Reminder design: local notifications only, no server, no Firebase. Setting lives in localStorage key myhq.reminder.v1, never Supabase. Rolling 14 one-shot notifications (IDs 1001 to 1014), rebuilt on launch, resume, every save or delete, language change and setting change. Today is skipped if logged or the time has passed. Inexact alarms on purpose (isExactNotification false, allowWhileIdle true). SCHEDULE_EXACT_ALARM stripped in the manifest. Permission is asked only when the switch is turned on. Channel daily-log. Tapping opens /log.
- Key files: src/lib/reminder.ts, src/lib/reminderSync.ts (+ tests, 35 passing in total), src/app/ReminderSync.tsx, src/screens/settings/SettingsScreen.tsx (APP_VERSION 1.1.1), src/i18n/strings.ts, android/app/src/main/AndroidManifest.xml, android/app/build.gradle (versionCode 3, versionName 1.1.1), .github/workflows/android.yml, PARITY.md (event log), docs/PLAY_CONSOLE_ANSWERS_2026-10-20.md, store/android/ (listing text, icon, feature graphic, five screenshots). scripts/lint-copy.mjs checks banned language (em dashes etc.) across src and store.
- Michael's facts: no iPhone; Gateway H2 is not a registered company; Gmail mcjaeger51@gmail.com; contact email michael@gatewayh2.com; Samsung phone using Brave.

## 7. Working rules for the new chat
No em dashes. American English. Every Chinese string carries an English translation in parentheses; use 攝取量 (intake), never 劑量 (dose). Prices in USD and NT$. Each new screen needs Michael's parity verdict. Native ZH-TW review before Chinese publishes. Verify facts and prices before stating them. A suggestion is never a ruling. Do not fold into the master; produce a SESSION BLOCK instead.

## 8. Session block owed
No block has been written since 2026-10-17. Events since then: cutover, Capacitor ruling, Android build and keys, Play Console setup, closed test approval, Resend move, reminder build and device tests. Offer one in the first few messages.
