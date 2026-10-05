# Parity gate log

Each screen ships only after Michael compares it side by side with the live Horizons app
(h2tracker.gatewayh2.com) and says it is at least as good. The live app stays untouched until cutover.

| Screen | Approved | Commit | Notes |
|---|---|---|---|
| Log (New entry) | 2026-10-04 19:36 Taipei, "looks great. lock it in." | 6a58bda | Large centered title (no glow, item 20); drop and wind route icons; one-row equipment picker; timer first for inhalation; time and note folded into one line; "Calculated HQ"; repeat list at the bottom. Example device named "device", never "inhaler". |
| Today | 2026-10-04 20:34 Taipei, "looks good" | (this commit) | Ring full circle 15.0 HQ with the 10.0 tick two thirds round, stepping up in fives above 15 (shown to Michael, approved with the screen, not ruled separately). 7-day average labeled "Last 7 days, today included" with no arithmetic line (Michael). Lifetime kept for parity. |
| History (with Trends) | 2026-10-04 21:00 Taipei, "looks great!" | 939ee1c | No streak counter (the live Analytics streak is goal gamification, not in the approved v1 list). |
| Settings | 2026-10-04 21:25 Taipei, "Setting page good!"; CSV and JSON downloads and account deletion (throwaway account) tested by Michael, "both cleared" | 79dd559 | Account, My equipment (edit, remove, add), language, download CSV and JSON, delete my account (signed in) or erase this device (guest), About HQ, disclaimer and disclosure, version. |
| First-run cards | 2026-10-05 09:03 Taipei, "The cards are great." | fe6c0c7 | Three skippable cards, shown once to someone with no entries and no equipment; "Show the intro again" in Settings. |
| Sign-in | 2026-10-04 20:25 Taipei, "all passed" | 0eaf02c | Michael ran the database setup (RLS and formula test passed in Supabase) and the six-step phone test: guest entry, create account, email confirmation with hand-over, sign out and in, password reset. |

## Decisions outside the screens

- 2026-10-05 09:03 Taipei: **no data carries over from the old app** (Michael: "I dont need any data from the old app to carry over"). The import step in the handoff is dropped; everyone starts fresh in the new app.
