# HANDOFF: two items the MyHQ rebuild needs from the website chat

Prepared 2026-10-06 in the MyHQ rebuild chat (Gateway H2 Strategy project). Paste into the website chat, which holds KERNEL.md and MODULE_WEBSITE.md. Scope for that chat: **gatewayh2.com only.** Do not change the MyHQ app; send results back to Michael, who carries them to the rebuild chat.

Background: MyHQ has been rebuilt off Hostinger Horizons (R-362). The new app runs at `https://myhq-peach.vercel.app` and will replace `h2tracker.gatewayh2.com` at cutover. Every screen is approved (repo `gatewaymike/myhq`, `PARITY.md`). Cutover waits on the two items below plus a native ZH-TW review.

---

## Item 1: a privacy policy page on gatewayh2.com

**Deliverable:** a live page on the bare host (R-072), for example `https://gatewayh2.com/privacy` (the website chat picks the path), and the exact URL sent back. The app links it from sign-in, create account and Settings. Until it exists the app omits every mention of a privacy policy.

**What the app actually does (facts for the policy; state only these):**

| Topic | Fact |
|---|---|
| Account data | Email address and password. Passwords are handled by Supabase Auth; the app never sees or stores them in readable form |
| Profile | Language choice (English or Traditional Chinese); optional display name (not yet shown in the app) |
| Equipment | Device name, route (water or inhalation), hydrogen flow at the machine outlet (mL/min) or water concentration (mg/L), optional mode label |
| Entries | Route, date and time, the person's time zone, minutes and hydrogen flow, or volume drunk and concentration; the HQ figure computed from them; an optional free-text note |
| Where it is stored | Supabase (database and sign-in), project `mksxiftqzetkyqmkhjip`. **Region not verified by Claude: Michael confirms it in the Supabase dashboard (Project Settings) before the policy names it** |
| Hosting | Vercel serves the app files |
| Fonts | Loaded from Google Fonts, so a visitor's browser contacts Google's servers |
| Email | Account confirmation and password-reset emails, sent by Supabase's built-in sender (a custom sender may replace it before launch) |
| Guest mode | Without an account, entries and equipment stay only in that browser's local storage on the device. Creating an account or signing in moves them into the account |
| Device storage | The browser keeps the sign-in session, language, a few app preferences, a running timer and guest data in local storage. **No analytics, no advertising, no tracking cookies** |
| Access rules | Row-level security: each account can read and change only its own rows (tested with two accounts, passed in Supabase 2026-10-04) |
| Export | Settings → Your data: download every entry and device as CSV or JSON |
| Deletion | Settings → Delete my account: permanently deletes the account, equipment and every entry on the server. Guests can erase their device data from Settings |
| Sharing | Data is not sold and not shared for marketing. Supabase and Vercel process it as service providers |
| Health framing | MyHQ records intake figures only. It is not a medical device and gives no medical advice; it records no symptoms or outcomes |

**Still needed from Michael (do not guess, kernel rule 25):** the contact address for privacy requests; the operating entity and country as they should appear; the region (above); whether a Chinese version publishes now (it needs a native ZH-TW review first) or later.

**Rules that apply:** no em dashes; American English; banned list per kernel rule 14; the R-273 disclosure verbatim if the page names VHLife; no implied placements (R-007); no absolute-safety or health claims.

---

## Item 2: the ruled Chinese disclosure line (R-251)

**Deliverable:** the exact Chinese footer disclosure text as ruled under R-251 (FT2 edit 1), with its English translation in parentheses, and whether FT2 v2 passed its native read. MODULE_WEBSITE records FT2 v2 as "not confirmed run" and gated on a native read; the rebuild chat does not hold the text.

**How the app uses it:** shown in Chinese mode wherever the English R-273 disclosure appears (sign-in, create account, Settings). Until it arrives, Chinese mode shows the English line.

**Note for the website chat:** R-251 drops the invoicing clause; the English app line keeps R-273 verbatim. If the two should match in the app, say so; that is Michael's call, not either chat's.

---

## Return to Michael

1. The privacy policy URL, once live.
2. The R-251 Chinese text with its English, and its review status.
