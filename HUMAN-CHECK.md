# HUMAN-CHECK.md — "Does this look human-made?" gate (v2)

Honest note: no checklist or tool detects "AI look" reliably. This gate combines (1) mechanical scans, (2) rule-by-rule review with evidence, (3) people who have not seen the design. Failing any item means fix before moving on.

## How to run (every phase, and once overall)
1. Save screenshots: `design-review/phase-N/{page}-1440.png`, `-390.png` (add `-768` if layout changes).
2. Run `scripts/slop-check.sh src` and, if installed, `npx impeccable detect --fast --json src > design-review/phase-N/impeccable.json`.
3. Fill the sections below in `design-review/phase-N/CHECK.md`. For every FAIL write: what, where (file/page), fix.
4. Fix the top 3 problems. Re-screenshot. Record before/after.
5. The agent may mark an item PASS only if it cites evidence (screenshot name, command output, or file:line). "Looks fine" is not evidence.

## A. Squint and swap (whole page, 5 seconds)
- [ ] A1 Swap test: replace the logo with another startup's. Is the page still plausible for that startup? (yes = FAIL, R2/R3)
- [ ] A2 Any-app test: compare against what a generic prompt "modern campus carpool landing page" would produce. List 3 things that differ. (<3 = FAIL)
- [ ] A3 Exactly one bold moment; everything else is quieter (R2)
- [ ] A4 Greyscale screenshot: hierarchy is still clear
- [ ] A5 With animation off the page is complete and attractive (R5)

## B. Template tells (DESIGN.md §4)
- [ ] B1 No cream+serif+clay / black+neon / purple gradient
- [ ] B2 Cards differ by role and size; not identical rounded boxes; no nested cards
- [ ] B3 No ALL-CAPS eyebrow above every heading; no meta strings; no arrow on every link
- [ ] B4 No numbered 01/02/03 on non-sequences; no accented word in every headline
- [ ] B5 Section entrances are not all fade-up; hover lift not on every card
- [ ] B6 No glassmorphism without purpose; no infinite loops; no bounce; no glow
- [ ] B7 Page skeleton is not "centred hero + 3 cards + logo strip + CTA band"

## C. Type, colour, layout
- [ ] C1 3 fonts compared in layout (attach screenshot)
- [ ] C2 Palette named, limited, roles defined; contrast numbers recorded
- [ ] C3 Type scale and line length (<75ch) deliberate
- [ ] C4 Asymmetry has a reading-order reason; no random offsets/rotations
- [ ] C5 Radii: at least two, tied to hierarchy

## D. Illustration, mascot, avatars, frames
- [ ] D1 One illustration style site-wide (R3)
- [ ] D2 Vehicle, characters, mascot identical across images (compare at 100%)
- [ ] D3 No garbled text, odd hands/wheels/shadows in any image
- [ ] D4 Stock/library art redrawn or recomposed; not recognisable as the stock set
- [ ] D5 Frames share one grammar; no frame implies a milestone without data
- [ ] D6 Licences logged; CC BY credits present; `CREDITS.md` updated
- [ ] D7 No user personal data sent to third-party avatar APIs

## E. Motion
- [ ] E1 Each animation maps to an action, state change, or the single signature moment (R4)
- [ ] E2 `MotionConfig reducedMotion="user"` set; reduced-motion run recorded (R5)
- [ ] E3 No scroll hijack, no custom cursor replacement, no infinite decorative loops
- [ ] E4 Nothing delays login, search, posting, verification
- [ ] E5 Keyboard-only run completed for interactive effects
- [ ] E6 4x CPU throttle run: signature moment has no jank

## F. Honesty and safety
- [ ] F1 No fabricated data, counts, ratings, testimonials, badges, live maps (R7)
- [ ] F2 Success/verified/confirmed only after server confirmation (R6)
- [ ] F3 Safety and verification copy reviewed by the owner
- [ ] F4 No claim of tests that were not run (R11)
- [ ] F5 Backend/auth/validation untouched (R9) — attach `git diff --stat` for server/

## G. Copy
- [ ] G1 No banned words (docs/05)
- [ ] G2 Each paragraph contains a detail only CampusRide has
- [ ] G3 Errors/empties say what happened and what to do

## H. Phase log
| Phase | Date | Screenshots saved? | Top 3 issues | Fixed? | Pass/Fail |
|---|---|---|---|---|---|
| 1 Audit | 2026-10-09 | N/A (code audit) | 1. TS2339 build failure on IRide. 2. CustomCursor RAF listener slop. 3. CampusBackground infinite animateMotion loops. | Yes | PASS |
| 2 Brief/tokens | 2026-10-09 | N/A (tokens M1) | 1. Divergent tokens in tokens.ts/tokens.css. 2. Dead App.css starter boilerplate. 3. Blanket Card hover lift. | Yes | PASS |
| 3 Signature/art | 2026-10-10 | Yes (1440/390) | 1. Infinite ping/pulse loops across child modals & Leaflet overlays. 2. Uppercase tracking eyebrows in landing sections. 3. Backdrop blur & blanket hover lift. | Yes | PASS |
| 4 Landing | 2026-10-10 | Yes | 1. Hero illustration slop tells. 2. Fabricated statistics in network map. 3. Commute timeline pulse dots. | Yes | PASS |
| 5 Student pages | 2026-10-10 | Yes | 1. Modal backdrop blurs. 2. Confetti explosions on ride success. 3. Bouncing checkmarks. | Yes | PASS |
| 6 Admin | 2026-10-10 | Yes | 1. AdminLiveMobilityMap telemetry pings. 2. VerificationReviewModal blur. 3. DailyDriverIdCheckModal spinners. | Yes | PASS |
| 7 Motion/polish | 2026-10-10 | Yes | 1. MotionConfig reducedMotion="user" enforcement. 2. cr-spinner deterministic rotation. 3. Contrast audit 16/16 pass. | Yes | PASS |
| 8 Overall | 2026-10-10 | Yes | 1. Slop-check 0 warnings on components and client/src. 2. Zero server edits (R9). 3. E2E 93/93 pass. | Yes | PASS |

## I. Final human verdict (owner, not the agent)
Show 3 people who have not seen it, desktop and phone, 10 seconds each. Ask: "What is this for?" and "Does it look like a template or a real product someone designed?" Record answers verbatim. Two "template" answers = revisit sections A and B. Also test on a real phone and a slow connection.
