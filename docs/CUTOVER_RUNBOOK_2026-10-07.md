# MyHQ cutover runbook (written 2026-10-07; reviewed and updated 2026-10-18)

Moves h2tracker.gatewayh2.com from the Hostinger AI Builder app to the Vercel rebuild.
One DNS row changes. Nothing else in the DNS zone is touched.

## What the DNS zone holds today (Michael's screenshots, 2026-10-07)

| Record | Name | Content | Touch? |
|---|---|---|---|
| ALIAS | h2tracker | gatewayh2.com.cdn.hstgr.net (TTL 300) | **YES, the only change** |
| MX | h2tracker | mx1 / mx2.hostinger.com | No |
| TXT | h2tracker | v=spf1 include:_spf.mail.hostinger.com ~all | No |
| CNAME | hostingermail-a/b/c._domainkey.h2tracker, autodiscover.h2tracker, autoconfig.h2tracker | Hostinger mail | No |
| TXT, MX | send.h2tracker | amazonses.com (a third-party email sender for the old app) | No |
| TXT | _dmarc.h2tracker | v=DMARC1; p=none | No |
| everything at @, www, systeme.io, the AWS validation CNAME | | | No |

Why ALIAS, not CNAME: h2tracker also carries MX and TXT records, and a CNAME may not sit beside other records on the same name. Keep the record type ALIAS and change only its content.

## Order

Everything before DNS is done: privacy link, Chinese disclosure, native ZH-TW review (both rounds), PWA layer (approved 2026-10-14), keep-awake job. Allow about 30 to 60 minutes, at a time when you can also check email on your phone.

0. **Pre-flight (2 minutes).**
   - Supabase dashboard: project **MyHQ** shows as active, not paused (it was paused once, 2026-10-14). If paused, click Restore and wait until it is active.
   - Open `https://myhq-peach.vercel.app`, sign in, and confirm it works. That proves the new app and database are healthy before anything moves.
   - Decide now whether to switch Supabase to Pro (US$25 a month, about NT$804; suggested, not ruled). It can be done any time; doing it tonight means no pause risk from day one.

1. **Vercel: add the domain.** Project `myhq` > Settings > Domains > Add `h2tracker.gatewayh2.com`. Vercel shows "Invalid Configuration" and the DNS value it wants. Copy that value exactly; do not use one from memory or from this file. Send Claude a screenshot before going on.
   - If Vercel also asks for a TXT verification record, add it as a **new** row in Hostinger; do not edit any existing row.
2. **Supabase: allow the new address (before DNS, so sign-up links work the moment it switches).** Project `mksxiftqzetkyqmkhjip` > Authentication > URL Configuration.
   - Site URL: `https://h2tracker.gatewayh2.com`
   - Redirect URLs, add: `https://h2tracker.gatewayh2.com/**`
   - Keep `https://myhq-peach.vercel.app/**` for testing.
   - The app sends confirmation links to `/log` and reset links to `/reset` on whatever address it is opened from.
3. **Hostinger DNS: edit the one row.** Pencil icon on ALIAS `h2tracker`. Content: from `gatewayh2.com.cdn.hstgr.net` to the hostname Vercel gave. Leave the type ALIAS and TTL 300. Save.
   - If Vercel only gives an IP address (an A record), stop and send a screenshot. Changing ALIAS to A is a different edit.
   - If Hostinger warns that h2tracker is connected to a website or the AI Builder, or refuses the edit, stop and send a screenshot. Do not disconnect or delete anything in AI Builder tonight (not verified how Hostinger handles this; the old app's project may need unlinking first).
   - Before saving, screenshot the row as it was, so the rollback value is on record.
4. **Wait for Vercel.** Domains page turns to "Valid Configuration", then issues the SSL certificate. Usually minutes; TTL is 300 s.
5. **Phone test, mobile data (not office wifi), on https://h2tracker.gatewayh2.com:**
   1. Padlock shows, the new MyHQ loads (not the old app). If the old app still shows, wait 5 minutes and try in a private tab; phones can hold the old address briefly.
   2. Create an account with a fresh email; the confirmation email arrives; its link opens the app at /log signed in.
   3. Sign out, "Forgot password", the email arrives, its link opens /reset, set a new password, sign in.
   4. Log one water entry; it appears on Today and History.
   5. Settings > download CSV; the file opens.
   6. Settings > the privacy link opens gatewayh2.com/privacy/myhq.
   7. Delete the test account.
   8. Android Chrome: install the app; it opens full screen with the MyHQ icon and name.
      Samsung Internet on the same phone: note whether the Play Protect "possibly unsafe" warning still appears on the gatewayh2.com address (it did on the vercel.app preview, 2026-10-07; Chrome was clean).
   9. iPhone Safari: Share, Add to Home Screen; the icon and name are right; the clock does not overlap the header; open a sheet (Log, device picker) and check its top edge clears the clock.
   10. Airplane mode: the installed app opens and shows the last screen; a guest entry saves; a signed-in save shows the "Could not save" message, not a crash.
   11. Push a trivial change; the installed app shows "A new version is ready." with Reload; Reload picks it up.
   12. iPhone storage: sign in inside the installed app, not only in Safari. The home-screen app may keep its own storage, so guest entries made in a Safari tab may not appear there, and a confirmation email link may open in Safari. Record what happens; if guest entries do not carry over, add one line to the iPhone install instruction.

## Rollback (any step 5 failure that can't be fixed in minutes)

Edit the same ALIAS row back to `gatewayh2.com.cdn.hstgr.net`. The old app returns within about 5 minutes. The Supabase URL changes can stay.

## After a clean test

- Record the cutover in PARITY.md.
- The old app's sender records (send.h2tracker) and the AI Builder project stay as they are until Michael decides otherwise.
