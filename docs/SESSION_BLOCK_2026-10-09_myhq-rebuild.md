# SESSION BLOCK 2026-10-09 (template v2; follows block 2026-10-07, MyHQ rebuild)

**Chat:** Gateway H2 Strategy project, MyHQ rebuild chat, sessions 8 to 10, 2026-10-07 10:13 to 2026-10-09 16:35 Taiwan time.
**Scope:** MyHQ rebuild only, plus the operations chat's PWA handoff (`HANDOFF_myhq-pwa_2026-10-07.md`).
**Modules held:** KERNEL, MODULE_WEBSITE. **MODULE_STANDARD was not pasted in this chat**; nothing below rules in its domain.
**Labels:** local; the fold assigns R, Q and T numbers. Operations-chat rulings M1 and M2 (store apps unparked; PWA first) were ruled there and are folded from that chat's block, not this one.
**Repo:** `gatewaymike/myhq`, commits `41befee` to `dd1f2e4`. Approvals log: `PARITY.md`.

---

## RULED BY MICHAEL

| Label | Time (Taiwan) | Ruling | His words or act |
|---|---|---|---|
| M19 | 10-07 10:17 | **Privacy page passes; app privacy links switched on.** `PRIVACY_URL` = `https://gatewayh2.com/privacy/myhq`; links on sign-in, create account and Settings. Cutover blocker 1 closed | "all pass" (five checks: loads in site layout, effective date, contact address, Supabase region, homepage and /blog unaffected) |
| M20 | 10-07 10:22 | **Chinese disclosure source supplied:** the live gatewayh2.com Chinese footer text, pasted as text. The app's Chinese mode uses it under R-251 / B4 | Michael pasted the footer |
| M21 | 10-07 13:29 | **App icon option A approved:** stacked wordmark, gold Playfair italic "My" (#E2C466) over mint DM Mono "HQ" (#2EE6B8) on #020E0A; no ™ on the icon. Option B (the Today ring) declined | "A" |
| M22 | 10-07 19:01 | **Samsung Internet behavior accepted as a known issue, not a blocker:** a Chrome-installed MyHQ still opens in Samsung Internet when Samsung is the default browser | "Still samsung. I'm not too worried about it." |
| M23 | 10-07 19:03 | **Update line approved as built, option (a):** card over content reading "A new version is ready." with Reload; nothing swaps until tapped | "1. a" |
| M24 | 10-07 19:03 | **Offline default for v2.0 (handoff 3e):** guest mode works offline; signed in, loaded data can be read and an offline save shows the existing "Could not save" message; no offline sync queue in v2.0 (v2.1 if wanted) | "2. Yes" |

---

## SUGGESTED, NOT RULED (expires 2026-10-23)

| Label | Suggestion |
|---|---|
| S15 | **Settings install help (handoff 3f), built and live, awaiting the parity verdict.** Top of Settings, hidden once installed. Chrome: "Install MyHQ" button. Samsung Internet: send to Chrome, no button, never "Install anyway". iPhone/iPad: "Tap Share, then Add to Home Screen." Android with no button (Chrome after install, Brave): "Open your browser menu (⋮) and choose Install app or Add to Home screen." Four points to rule: placement, wording, Chrome button, Samsung line |
| S16 | App's Chinese disclosure uses only the **first two sentences** of the live footer, to mirror R-273's two English sentences; the app's own "Disclosure" label replaces 商業揭露 (Commercial disclosure) |
| S17 | Cutover order: ZH-TW corrections, then DNS and Supabase URLs per `docs/CUTOVER_RUNBOOK_2026-10-07.md`, then the 12-step phone test. The PWA layer is already done |
| S18 | **Store order: Google Play first, then the App Store.** Android via Trusted Web Activity (packages the approved PWA; needs one verification file on h2tracker.gatewayh2.com, so after DNS cutover). iPhone via Capacitor, built on a cloud Mac build service (Michael is on Linux) |
| S19 | **Individual store accounts** on both stores, since Gateway H₂ is not a registered company (W20). Listings show Michael's legal name as seller; app named MyHQ, Gateway H₂ in the description |
| S20 | Start recruiting 14 to 15 Android testers now (12 needed); collect Google account emails as a waiting list; send the drafted message only once the closed-test link exists |
| S21 | Add a **daily log-reminder notification** before the App Store submission, to strengthen the case under guideline 4.2 (new screen, parity gate) |
| S22 | Carried, still open: S4 (custom email sender before public launch), S5 (make the repo private), S11 and S12 (AI Builder prompt hygiene) |

---

## WORLD

| Label | Fact | Source |
|---|---|---|
| W14 | `https://gatewayh2.com/privacy/myhq` is live with the header and footer, effective date October 10, 2026, michael@gatewayh2.com, Supabase ap-northeast-2 | Michael's five checks, 10-07 10:17 |
| W15 | **FT2 v2 ran.** The live gatewayh2.com Chinese footer reads: 商業揭露：Gateway H₂ 銷售並配置氫氣設備。我們為經銷的設備訂定售價，售出時賺取差價。我們不偏向任何設備品牌，但並非中立第三方：HQ™ 公式完整公開，對所有製造商一體適用。Hydrogen Quotient™ 與 HQ™ 為 Gateway H2™ 之商標。 (Commercial disclosure: Gateway H₂ sells and places hydrogen equipment. We set the price on the equipment we distribute and earn the margin when it sells. We do not favor any equipment brand, but we are not a neutral third party: the HQ™ formula is fully public and applies equally to every manufacturer. Hydrogen Quotient™ and HQ™ are trademarks of Gateway H2™.) No commission, no invoicing clause: matches R-251 | Michael's paste, 10-07 10:22 |
| W16 | The native ZH-TW reviewer received the strings on 10-07; return was expected that night; **not yet back in this chat** | Michael, 10-07 10:24 |
| W17 | **Hostinger DNS zone for gatewayh2.com:** `h2tracker` is an **ALIAS** to `gatewayh2.com.cdn.hstgr.net` (TTL 300) and also carries MX (mx1/mx2.hostinger.com), SPF TXT and Hostinger DKIM/autodiscover/autoconfig records; `send.h2tracker` has SPF and MX for amazonses.com; `_dmarc.h2tracker` p=none. Cutover changes only the ALIAS content | Michael's screenshots, 10-07 10:27 |
| W18 | **Installable app live on the Vercel preview:** manifest and service worker served; 11 precached files; Supabase never cached; Google Fonts cached after first load (privacy page's Google Fonts sentence stays true). Samsung's squircle crops the maskable icon cleanly | WebFetch of the live files; Michael's screenshot, 10-07 18:48 |
| W19 | **Samsung Internet install shows a Play Protect "possibly unsafe" warning** that needed "Install anyway"; Chrome on the same phone installed cleanly; Chrome and Brave do not show a one-tap install once the app is installed; the update line appeared on a real install after a real build change | Michael, 10-07 18:49 to 19:01, 10-09 13:00; [Jotform report](https://www.jotform.com/answers/39399721-google-play-protect-unsafe-app-blocked-warning-on-android-when-adding-jotform-app-to-home-screen) of the same warning |
| W20 | **Gateway H₂ is not a registered company** | Michael, 10-09 15:45 |
| W21 | **Store facts (checked 10-09):** Apple Developer Program US$99 a year; individuals enroll under their legal name; organizations need a legal entity, a D-U-N-S number, a domain email and a working website ([Apple](https://developer.apple.com/programs/enroll/)). Google Play US$25 once ([Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)); personal accounts created after 2023-11-13 need **12 testers opted in for 14 consecutive days**, and Google asks about tester engagement before granting production ([Google](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB)). Apple guideline 4.2 rejects apps "not sufficiently different from a mobile web browsing experience" ([summary](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper)) | Sources linked |
| W22 | Headless Chrome cannot be downloaded in Claude's build environment (network policy), so offline and install behavior are verified on Michael's phone, not by automated test | Build log, 10-07 |
| W23 | Tests: 23 pass; copy lint now also covers `vite.config.ts` (manifest strings) | Local runs through `dd1f2e4` |

---

## SEEDS CHANGED

| Label | Change |
|---|---|
| D9 | **T-72 status:** cutover blockers 1 (privacy link) and 2 (Chinese disclosure) closed; PWA layer built and verified on a real Android phone; remaining before cutover: the ZH-TW corrections, the S15 verdict, then DNS. Live app at h2tracker.gatewayh2.com still untouched |
| D10 | **Strings for the native reviewer (8 new since the 176-string sheet):** pwa.updateReady 新版本已就緒。(A new version is ready.); pwa.reload 重新載入 (Reload); install.title 安裝應用程式 (Install app); install.body 將 MyHQ 加入主畫面，就能像應用程式一樣開啟。(Add MyHQ to your home screen so it opens like an app.); install.button 安裝 MyHQ (Install MyHQ); install.ios 點選「分享」，再點選「加入主畫面」。(Tap Share, then Add to Home Screen.); install.samsung 若要順利安裝，請用 Chrome 開啟此頁面，再選擇「安裝應用程式」。(For the cleanest install, open this page in Chrome and choose Install app.); install.menu 開啟瀏覽器選單（⋮），選擇「安裝應用程式」或「加到主畫面」。(Open your browser menu and choose Install app or Add to Home screen.). Words in 「」 must match the real browser menus. Also flagged: auth.agree zh places 下方的 (below) before the privacy policy, which is now a link |
| D11 | **Files.** Repo: `docs/CUTOVER_RUNBOOK_2026-10-07.md` (DNS, Supabase, 12-step phone test, rollback), `design/icon/` (1024 px master PNG, outlined SVGs), `public/` icon set, `src/app/UpdateBar.tsx`, `src/lib/install.ts`, this block. Outputs: `MyHQ_icon_options_2026-10-07.png` |
| D12 | **Tester recruiting message drafted** (EN plus ZH, in chat). Not sent; needs the native read (check 「成為測試人員」 (Become a tester) against Google Play's real button) and the closed-test link |
| D13 | **Cross-chat, for the website chat (not decided here):** (a) 中立 (neutral) in the live Chinese footer appears only as a negation; worth a deliberate ruling against the "neutral" ban; (b) the footer mixes "Gateway H2™" and "Gateway H₂"; (c) gatewayh2.com refused an automated fetch as "disallowed": check `robots.txt` does not also block search engines (T-27) |
| D14 | **Cross-chat, for the operations chat:** the installable app is live on the preview; the launch promo end card ("Free. Install it from your browser.") can follow cutover. Store path and timing per S18 to S21 |
