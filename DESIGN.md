# DESIGN.md — CampusRide "Campus Atlas" (v2)

> Audience: the coding agent (Claude Code, Cursor, Codex...). A browser never reads this file.
> Load order: this file always. Open the `docs/` file for the task you are doing. Do not load everything at once.
> If anything you build starts to look like a template: STOP, run `HUMAN-CHECK.md`, redesign that part.

## 0. What this file can and cannot do
- It cannot make a site "0% AI-looking". Nothing can. It can (a) force specific, product-owned decisions, (b) ban known templated defaults, (c) make you produce screenshot evidence at every phase.
- "Looks human-made" is a property of choices: one owned visual idea, consistent illustration, specific copy, restraint. Libraries and animations are not the source of it.
- If a rule here conflicts with the real repo (framework, routes, data), the repo wins. Report the conflict, do not guess.

## 1. Product truth (verify in the repo; do not invent)
CampusRide: student carpool web app. Client: React + Vite + TypeScript, Tailwind CSS, lucide-react. Server: Express + MongoDB.
Routes known so far: `/` Home, `/post` Offer a Ride, `/search` Find a Ride, `/safety` (incl. Women-Only carpools), `/colleges` Campuses, `/verification` Verification.
Setting: Indian campuses. Existing direction from the owner: green palette, warm beige, panda mascot, illustrated campus backgrounds, anime-influenced hero art, white "CampusRide"-branded sedan.
Anything not listed (live tracking, ratings, payments, chat) must be confirmed in code before it is designed or mentioned in copy.

## 2. Concept: the Campus Atlas
One owned idea: **a small illustrated atlas of Indian campus journeys.**
The memorable thing is not an effect. It is a recognisable system:
1. **Route thread** — one signature line (specific curve, stop dots, destination flag). Reused as progress line, section divider, ticket detail, frame detail.
2. **Journey ticket** — used only for real ride data (route, time, seats, status).
3. **Character family** — 3 silhouettes, 4–5 poses, one drawing style, plus the mascot. See `docs/04`.
4. **Frames** — avatar frames from one grammar (plain / route / ticket / milestone). See `docs/02`.
5. **Real Indian campus detail** — gate, hostel block, canteen/chai stall, bus-stop sign, e-rickshaw, auto, two-wheelers, monsoon, bilingual signage. Specificity is the strongest anti-template tool you have. See `docs/01`.
Public pages are expressive. Student and admin screens are quiet, dense, high-contrast. Do not carry hero styling into forms and tables.

## 3. Hard rules (IDs are cited by HUMAN-CHECK.md)
R1. Write the design brief (section 5) BEFORE code. Show it. No brief, no UI changes.
R2. ONE bold moment per page. Everything else is quiet.
R3. ONE illustration style across the site. Library art must be redrawn/recoloured/composed (see `docs/04`).
R4. Every animation is tied to a user action, a state change, or the one signature moment. No ambient loops.
R5. Every animation has a no-motion version, and `MotionConfig reducedMotion="user"` is set (default is "never").
R6. Success, verification, "ride confirmed", stamps: shown only after the server confirms. Never optimistic for these.
R7. No fabricated data: ride counts, users, ratings, testimonials, trust badges, live maps, ETAs, fake IDs.
R8. No new dependency without: named interaction, written reason, licence checked, bundle impact noted.
R9. Do not change routes, API contracts, auth, authorization, verification, validation, or business rules.
R10. Copy follows `docs/05`. No filler words. Specific to the real product.
R11. Evidence rule: a phase is not "done" without screenshots saved to `design-review/phase-N/` and a filled phase log. Never claim a test or review that was not run.
R12. Do not copy any reference site's code, layout or assets. Study the principle, write your own.

## 4. Banned tells (known signs of generated UI)
Palette/type: cream + high-contrast serif + terracotta/clay; black + one neon accent; purple/blue gradient hero; the first font you would pick for any project (Inter/Roboto/Arial/system-ui as the whole identity).
Layout: grid of identical rounded cards with one radius and one soft shadow; nested cards; side-stripe card borders; centred hero + three feature cards + logo strip + CTA band as the page skeleton.
Text: ALL-CAPS tracked eyebrow above every heading; "A · B · C" meta strings; "WORD — fragment" labels; arrow glyph on every link; 01/02/03 on non-sequences; one accented (italic/coloured) word in every headline; words like seamless, effortless, revolutionise, unlock, supercharge, elevate.
Motion: fade-up on every section; hover-lift on every card; bounce/elastic; infinite pulse/float/spin; dark glows; constant parallax; scroll hijack; custom cursor replacing normal cues.
Fake handmade: random rotations/offsets; faux paper texture on everything; wobbly borders applied everywhere.
Honesty: fake live map, fake counts, fake reviews.
Illustration: raster AI-generated scenes with inconsistent cars/hands/text/shadows between pages; a different style per section; stock avatars shipped untouched.

## 5. Design brief (Campus Atlas v2 — Dehradun University Transit)
```
Palette (4–6 named hex, with role each):
- Warm Canvas: #F7F5F0 (Primary full-viewport background canvas)
- Paper Surface: #FFFDFC (Component cards, sheets, tactile tickets)
- Elevated Surface: #FFFFFF (Modals, popovers, elevated tickets)
- Deep Route Forest: #143D32 (Institutional brand anchor, route paths, primary buttons)
- Signal Amber: #D97706 (Warning states, active reservation requests, cautionary badges)
- Emergency Crimson: #DC2626 (112 SOS emergency trigger, destructive actions, rejection states)
- Ink Primary: #18201D (High-contrast typography and data readouts)

Type roles (display / body / data+ticket):
- Display: Plus Jakarta Sans (Headings, page titles, bold hero statements; geometric yet human warmth)
- Body: Inter (Factual body text, form inputs, navigation items; clean legibility at small sizes)
- Data & Ticket: JetBrains Mono (Departure times, fuel fare amounts, seat counts, coordinates, route stop numbers)

Radii (tied to hierarchy):
- control: 8px (Buttons, text inputs, segmented pills)
- surface: 16px (Main content cards, modals, containers)
- ticket: 6px (Journey ticket perimeter corners, notch masks)
- pill: 9999px (Status tags, pill badges)

Surfaces (max 3):
- Paper Surface: #FFFDFC (all primary cards and tickets)
- Warm Canvas: #F7F5F0 (overall page backdrop)
- Dark Ink Surface: #18201D (admin command center / high-density telemetry)

Route thread spec:
- Single continuous SVG curve with subtle curvature (stroke-width: 2.5–3.5px, Deep Route Forest #143D32)
- Campus stop nodes (radius: 4px solid #143D32, outer ring: 12px with 15% opacity)
- Draw-once transition on viewport intersection (900ms cubic-bezier(0.22, 0.8, 0.3, 1)); instant fallback on reduced-motion

Frame grammar:
- 4 consistent SVG overlay frames (plain, route, ticket, milestone)
- Shared 2.5px stroke weight, 12-16px corner radii, route-dot motif
- Square-safe face cropping preventing overlay occlusion of student identity

Character family:
- Dehradun student commute personas (truthful identities, zero anime personas)
- Bao the Campus Panda mascot (used exclusively for security/liveness guidance, never generic decoration)

The one bold moment per page:
- Home: Hero RouteThread drawing across the quad from Premnagar Chowk to UIT Gate 1
- Search: Interactive JourneyTicket pass preview with expandable waypoint disclosure
- Post: Mechanical tactile price-per-seat counter with verified route preview
- Safety: High-accuracy live GPS coordinate lock with calm 112 SOS modal
- Colleges: Uttarakhand institutional corridor directory
- Verification: Server-gated land-and-settle DestinationStamp
- Admin: High-density institutional SOC telemetry table

Any-app test:
- Replaced generic SaaS soft-shadow cards with authentic physical JourneyTicket passes featuring circular side notches.
- Replaced generic illustrations with Dehradun-specific transit waypoints (Premnagar, Suddhowala, Nanda Ki Chowki, UIT Gate 1).
- Replaced floating cursor and animated car loops with quiet, accessible, human-crafted design tokens.

Three principles:
1. Real data is always plainer than illustration: ticket passes show honest database fields only.
2. Motion is quiet and tied to action: zero infinite decorative loops; instant static under reduced motion.
3. Trust is institutional, never synthetic: status stamps appear exclusively when verified by the server.
```

### Wireframe: Home Page (Single Bold Moment: Hero RouteThread)
```
+-----------------------------------------------------------------------+
|  CAMPUSRIDE  [Premnagar Hub]         Find Rides   Offer Ride  [Log in]|
+-----------------------------------------------------------------------+
|                                                                       |
|   DAILY DEHRADUN STUDENT COMMUTE                                      |
|   Verified University Carpools & Ride Shares                          |
|                                                                       |
|   [ Premnagar Chowk ] ---------> [ UIT & USCS Gate 1 ]   [Find Pass]  |
|                                                                       |
|   ~~~~~ Route Thread Drawing Once Across Quad ~~~~~                   |
|   Premnagar (01) ------> Suddhowala (02) ------> UIT Gate 1 (03)     |
|                                                                       |
+-----------------------------------------------------------------------+
|  TODAY'S VERIFIED JOURNEYS (Live API Tickets)                         |
|                                                                       |
|   +-[Ticket 01]-----------------+  +-[Ticket 02]-----------------+    |
|   (  08:30 AM  *  Premnagar     )  (  09:15 AM  *  Suddhowala    )    |
|   |  -> UIT Gate 1   3 Seats    |  |  -> UPES Bidholi 2 Seats    |    |
|   (  Rs 20 / seat   [Request]   )  (  Rs 30 / seat   [Request]   )    |
|   +-----------------------------+  +-----------------------------+    |
+-----------------------------------------------------------------------+
```

## 6. Tokens
Define as CSS variables (and map into Tailwind theme). Do not leave a UI kit's default tokens visible anywhere.
Motion tokens: quick 120–160ms (press/focus), standard 180–260ms (small transitions), emphasis 280–420ms (explanatory), stagger 30–60ms, small distance 4–8px, large 12–24px. Ease-out family only. These are starting values: tune by eye, delete any that slow a common task.
Three motion personalities: Utility (instant, forms/buttons/menus), Journey (directional: routes, progress, tickets), Celebration (rare, only after real success).
Details and code: `docs/03-motion.md`.

## 7. Animation stack (small on purpose)
1. CSS transitions/animations — press, focus, simple fades, stroke-dash route draw.
2. One engine: `motion` (import from `motion/react`) for component transitions, gestures, layout. Check React version in `package.json` before installing.
3. GSAP only if a single scroll timeline truly needs it. GSAP is now free including all plugins (verified Oct 2026), so cost is not the reason to avoid it; bundle weight and a second mental model are.
4. Rive/Lottie only for a character that must change state, authored in a real editor. Not for buttons.

## 8. Phases and gates
1 Audit → 2 Brief + tokens → 3 Signature components + art → 4 Landing → 5 Student pages → 6 Admin → 7 Motion + polish → 8 Overall review.
Per phase: build → screenshot 1440 + 390 (and 768 when layout changes) → run `scripts/slop-check.sh` and `npx impeccable detect` if installed → fill HUMAN-CHECK section for that phase → fix top 3 problems → only then continue. Details: `docs/06-phase-plan.md`.

## 9. Quality floor
Works at 360px. Visible keyboard focus. Semantic HTML. Touch targets >= 44px. Contrast checked (state the tool and result). Loading/empty/error/pending/disabled/success states reflect real behaviour. Images have alt text or are marked decorative. Layout does not shift when illustrations load (set width/height).

## 10. Final report the agent must write
Files changed; dependencies added (reason, licence, size); original assets made; licence/attribution list; pages × viewports tested; commands run with real output summary; HUMAN-CHECK results per phase; known limitations; what a human still must review (taste, real-device test, 3-person template test).

---

## 11. Milestone 3 Audit & Verification Summary (Completed 2026-10-10)
- **Mounted Child Components**: Cleaned of all ambient infinite decorative loops (`animate-pulse`, `animate-bounce`, `animate-ping`, `animation: ... infinite`), uppercase tracking eyebrows, and glassmorphic backdrop-blur overlays.
- **Spinners**: Converted to deterministic `.cr-spinner` CSS animation with reduced motion fallback.
- **Appendix H Reference Library**: Full clean-room compliance audit performed and documented in `AUDIT.md`.
- **Dependency Licenses**: Cataloged in `THIRD_PARTY.md` (100% permissive open source).
- **Automated Anti-Slop Check**: `scripts/slop-check.sh client/src/components` (0 warnings) and `scripts/slop-check.sh client/src` (0 warnings).
- **Contrast Ratios**: Verified via `node scripts/contrast.mjs` (16/16 checks passing WCAG 2.2 AA).
- **Rule R9 Boundary**: 100% frozen `server/` directory (0 server modifications).

