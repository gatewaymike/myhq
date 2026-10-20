# Play Console answers: MyHQ (com.gatewayh2.myhq)

Prepared 2026-10-20. These are the answers for the **Finish setting up your app** tasks on the Play Console dashboard, in the order Console lists them. Every answer below is checked against the code at commit `cfa9ad6` and the data facts given to the website chat on 2026-10-06.

**Status labels:**
- **Fact** means the answer is a fact about the app.
- **Ruled** marks Michael's five decisions of 2026-10-20 12:50 (all option a).

Store files are in `store/android/` (sent with this document).

---

## What the app actually does (the basis for every answer)

| Item | Fact |
|---|---|
| Permissions | Internet only (AndroidManifest.xml). No location, camera, contacts or advertising ID |
| Analytics, ads, crash reporting | None. Firebase is not applied (no google-services.json) |
| Account | Email and password (Supabase Auth). Optional: guest mode works with no account, and its data stays on the phone |
| Stored on the server, signed in only | Email; account ID; language; equipment (name, route, flow or concentration, mode label); entries (route, date and time, time zone, minutes and flow or volume and concentration, HQ, an optional note of up to 500 characters) |
| Name field | The database has a `display_name` column, but no screen collects it. Nothing to declare |
| In transit | HTTPS to Supabase |
| Deletion | Settings, Delete my account: deletes the account, equipment and every entry on the server (`delete_my_account`). Also works in any browser at h2tracker.gatewayh2.com |
| Service providers | Supabase (database and sign-in) and Vercel (web hosting). Google treats service providers as not "sharing" |

---

## 1. Set privacy policy

`https://gatewayh2.com/privacy/myhq` (**fact**)

## 2. App access

Choose **All or some functionality is restricted**, then **Add instructions**. Guest mode works without signing in, but cloud saving needs an account, and Google reviewers must be able to reach every feature.

**Ruled by Michael 2026-10-20 12:50:** yes, create one reviewer account for Google.
1. Sign up in the app or at h2tracker.gatewayh2.com with a plus address, for example `yourname+playreview@gmail.com`. Supabase treats it as a new account, and the confirmation email still reaches your inbox.
2. Confirm the email. Log two or three entries so the reviewer sees data.
3. Type the email and password only into Play Console. **Never send that password to me.**

Instruction text for the form:

> Name: Reviewer account
> Username: (the reviewer email)
> Password: (the reviewer password)
> Notes: The app also works without an account (tap "Continue without an account"). The account shows cloud saving across devices. No two-step verification, no location requirement.

Under **Any other information**, also check **Allow Android to use the credentials you provide for performance and app compatibility testing** if it appears. That's Google's pre-launch testing, and it's harmless.

## 3. Ads

**No, my app does not contain ads.** (**fact**)

## 4. Content rating

Start the questionnaire. Email: your Play Console email. Category: **All Other App Types**. Answer **No** to every content question:
- violence
- sexuality
- language
- controlled substances
- gambling
- crude humor

Also answer **No** to these:

| Question | Answer | Why |
|---|---|---|
| Do users interact or exchange content? | No | There is no user-to-user feature |
| Does the app share the user's current location with other users? | No | |
| Does the app allow purchase of digital goods? | No | |
| Is it a web browser or search engine? | No | |

The result is likely Everyone, or PEGI 3 in Europe. The questionnaire decides that, not me.

## 5. Target audience and content

**Ruled by Michael 2026-10-20 12:50:** **18 and over only.** It keeps MyHQ outside Google's Families policy and matches the adult health framing. Then:
- **Could your store listing unintentionally appeal to children?** No.

## 6. Data safety

Go through the form in this order.

**Data collection and security:**
- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes**
- Which of the following methods of account creation does your app support? **Username and password.** The email serves as the username.
- Delete account URL: `https://gatewayh2.com/privacy/myhq`. **Check before you submit,** see the box below.
- Do you provide a way for users to request that some or all of their data is deleted, without requiring them to delete their account? **Yes.** Single entries can be deleted in History.

> **Checked 2026-10-20 (Michael's screenshot):** the page is titled "MyHQ Privacy Policy" and has an "Export and deletion" section. "Delete your account" names Settings, Delete my account, and the section ends with `michael@gatewayh2.com` for data requests. That meets Google's rule: the app is named, and there is a way to ask without reinstalling.
>
> Suggested hardening (not required; a website chat item): make the last line say outright that the email works for deletion, and add that deletion also works in any browser at h2tracker.gatewayh2.com.

**Data types:** declare only these.

| Category › type | Collected | Shared | Ephemeral | Required or optional | Purposes |
|---|---|---|---|---|---|
| Personal info › Email address | Yes | No | No | Optional (guest mode works without it) | App functionality; Account management |
| Personal info › User IDs | Yes | No | No | Optional | App functionality; Account management |
| App activity › Other user-generated content (equipment, entries and notes) | Yes | No | No | Optional | App functionality |

Everything else is **not collected**:
- location;
- financial info;
- messages;
- photos and videos;
- audio;
- files;
- calendar;
- contacts;
- app interactions;
- search history;
- installed apps;
- web browsing;
- crash logs;
- diagnostics;
- device IDs.

**Ruled by Michael 2026-10-20 12:50:** **do not declare Health and fitness › Health info.** Google defines Health info as "information about a user's health, such as medical records or symptoms."
- **Lean: do not declare it.** MyHQ records intake figures (minutes, flow, volume, concentration). By Google's own definition those are neither medical records nor symptoms. The privacy page also tells users MyHQ asks for no health data, and declaring Health info would contradict it.
- **Cost of the lean:** if a reviewer reads hydrogen-session logs as health data, the form comes back rejected and gets fixed in a day. That would delay the closed test, not production.
- **Alternative:** declare Health info, Optional, App functionality. Then the privacy page's "asks for no health data" line has to change first (website chat), or the two would contradict each other.

## 7. Government apps

**No.** (**fact**)

## 8. Financial features

**My app doesn't provide any financial features.** (**fact**)

## 9. Health

**Ruled by Michael 2026-10-20 12:50:** **Health and fitness › Nutrition and Weight Management**, the closest non-medical category for an intake log.
- Avoid every **Medical** category. "Medication and Treatment Management" and the others imply treatment, contradict the app's own line ("HQ is not a medical device or medical advice"), and invite medical-device scrutiny.
- **Alternative:** "My app doesn't provide any health features." That's defensible, since MyHQ only counts intake, but a reviewer could call it inaccurate for a hydrogen tracker.

## 10. Advertising ID (if Console asks)

**No.** The app doesn't use the advertising ID (**fact**: no AD_ID permission).

## 11. App category and contact details (Store settings)

- App or game: **App**
- Category: **Health & Fitness**
- Tags: pick up to five that fit, such as "Health tracker". Console offers a fixed list.
- Email: **required and shown publicly on the listing.** `michael@gatewayh2.com`, the same address as on the privacy page.
- Phone: leave it blank.
- Website: `https://h2tracker.gatewayh2.com`

## 12. Main store listing (en-US)

The text is in `store/android/listing_en-US.txt`, and the copy lint passes on it. Paste each part into its field.

| Field | Value |
|---|---|
| App name (30 max) | `MyHQ: Hydrogen Intake Tracker` (29). **Ruled by Michael 2026-10-20 12:50:** this title |
| Short description (80 max) | `Log hydrogen water and inhalation. See your daily total in one unit, HQ™.` (73) |
| Full description | 1,667 of 4,000 characters. It carries the HQ formula, the 10.0 reference wording, the app's disclaimer and the disclosure line word for word as they appear in the app |

Graphics. Google's specs, verified 2026-10-20:

| Asset | File | Spec |
|---|---|---|
| App icon | `MyHQ_icon_512.png` | 512 × 512, 32-bit PNG with alpha, under 1 MB (34 KB). Google rounds the corners |
| Feature graphic | `MyHQ_feature_graphic_1024x500.png` | 1024 × 500, 24-bit PNG, no alpha |
| Phone screenshots | `screenshot_1_today.png` to `screenshot_5_history.png` | 1080 × 1920 (9:16), 24-bit PNG. Four or more at this size makes MyHQ eligible for Google's recommendation surfaces |

The screenshots are the real app, rendered with its built-in example data ("Example device", "Example water bottle"). Upload them in numbered order.

A Traditional Chinese (zh-TW) listing comes later, after a native review. Add it under **Manage translations** then.

---

## After setup: Part 3 (closed test)

1. **Test and release › Testing › Closed testing › Create track** (or use the default "Closed testing - Alpha" track).
2. **Testers:** create an email list and add the testers' Google account emails. The emails must be the ones signed in to Play on their phones.
3. **Create release:** upload `app-release.aab` from the latest green **Android build** run on GitHub (artifact `myhq-release-aab`). Release name: `1.0.0 (1)`.
4. Release notes: `First test release.`
5. **Review release**, then **Start rollout to Closed testing**. Google reviews it, which can take a few days for a new app.
6. When it's approved, copy the opt-in link from the track's **Testers** tab. Testers must open it, tap **Become a tester**, then install from the Play Store.
7. The 14-day clock starts when 12 testers are opted in. Dashboard: "Run your closed test with at least 12 testers, for at least 14 days."
