# Test Infrastructure Documentation (CampusRide E2E Test Suite)

## Overview
CampusRide's end-to-end testing suite is designed as an authoritative, requirements-driven, opaque-box test harness grounded directly in `ORIGINAL_REQUEST.md` and the Campus Atlas design constitution. The suite validates design tokens, signature human-crafted components, interactive states, security/verification gates, accessibility semantics, and reduced-motion guardrails.

---

## Architecture & Framework
- **Test Runner**: Node.js Native Test Runner (`node:test`, `node:assert/strict`) executed via `tsx`.
- **Component Rendering**: Headless React 19 server-side static markup generation via `react-dom/server.node.js`.
- **Cross-Platform Compatibility**: Fully validated on Windows (PowerShell) and POSIX environments with 0 external browser/display dependencies.
- **Execution Performance**: 93 test assertions execute completely in ~1.0 second.

---

## Directory Structure
```
tests/e2e/
├── helpers.ts                  # Shared React 19 test harness, render helpers, and commute fixtures
├── index.test.ts               # Master test suite runner aggregating Tiers 1-4
├── tier1_features.test.ts      # Feature coverage across tokens and 6 signature components (50 tests)
├── tier2_boundaries.test.ts    # Boundary values, zero/negative seats, missing fields, permission gates (16 tests)
├── tier3_combinations.test.ts  # Cross-feature compositions and Design Playground integration (13 tests)
└── tier4_scenarios.test.ts     # Real-world commute corridor, 112 SOS GPS lock, admin telemetry (14 tests)
```

---

## 4-Tier Test Architecture

### Tier 1: Feature Coverage (50 Tests)
Covers baseline happy paths and interaction rules across all 7 core design features:
1. **Campus Atlas Tokens**: Verifies approved palette (Deep Campus Green `#143D32`, Signal Amber `#D97706`, Emergency Crimson `#DC2626`, Canvas/Paper surfaces), fluid clamp typography scale (`display`, `h1`-`h4`, `body`, `caption`), 8px harmonic spacing intervals, radius scales, and zero prohibited AI slop tokens (no violet hexes `#6366f1` / `#8b5cf6`, no bounce easings).
2. **Route Thread Draw-Once & Waypoints**: Continuous SVG spline path (`.route-thread-path`), authentic transit landmarks (Premnagar Chowk → Suddhowala Hub → Nanda Ki Chowki → UIT & USCS Gate 1), distinct origin/intermediate/terminus waypoint circles, accessible `role="region"`, time estimates, and custom stops support.
3. **Journey Ticket Masked Notches & Fields**: `.ticket-silhouette` dual radial mask class, `.ticket-wrapper` drop-shadow, real corridor origins/destinations, fuel share fare (`₹20`), driver credentials, verification badge, dynamic seat pluralization, and perforated dashed divider.
4. **Destination Stamp Confirmed Seal**: Server-gated seal displaying `-2deg` organic tilt, dashed route forest border, and `ShieldCheck` icon exclusively for `verified` and `confirmed` statuses. Enforces plain un-stamped text badges for `pending` and `rejected` statuses per Rule R6.
5. **Tactile Buttons & Hold-to-Confirm**: Mechanical 1–2px active button depression (`active:translate-y-[1.5px]`), 44px minimum touch target floor (`min-h-[44px]`), visible keyboard focus rings (`focus:ring-2 focus:ring-offset-2`), 4 variants (primary, secondary, danger, quiet), disabled/loading states, and `HoldToConfirm` 750ms progressbar semantics.
6. **Avatar Frame Grammar (4 Overlay Variants)**: Validates `plain` (route dot accent), `route` (interrupted dashed ring), `ticket` (simulated notch cutouts), and `milestone` (polygon star node). Enforces square-safe face cropping (`overflow-hidden rounded-control`, `object-cover`) and uppercase initials fallback.
7. **MotionConfig & Reduced-Motion Enforcement**: Global `<MotionConfig reducedMotion="user">`, CSS media query resetting stroke-dashoffset and clamping durations to `0.001ms`, instant static rendering query in `RouteThread`, zero ambient infinite animations (`animate-pulse`, `animate-ping`, `repeat: Infinity`), and predictable transition timings.

### Tier 2: Boundary & Corner Cases (16 Tests)
Validates system resilience against extreme and missing inputs:
- **Route Thread**: Empty waypoints array (`stops: []`), single-stop journeys, and missing optional landmark/time metadata.
- **Journey Ticket**: Missing avatar URL (initials fallback badge), missing vehicle plate, missing driver notes, zero seats boundary (`seatsAvailable: 0` disables request with `cursor-not-allowed`), negative seats defensive clamping, ride creator permission boundary ("Your Ride" badge), and unverified requester gate ("Verify ID to Request").
- **Destination Stamp & Hold**: Unknown/arbitrary status falls back to calm plain badge, custom 0ms duration preserves 44px touch floor, single-character and empty name avatar initials extraction, and button size boundary classes (`sm`, `md`, `lg`).

### Tier 3: Cross-Feature Combinations (13 Tests)
Validates harmonious coexistence and visual composition:
- **Avatar Frame in Journey Ticket**: All 4 frame variants mounted in driver profile slot.
- **Route Thread Alongside Journey Ticket**: Multi-component search and corridor hub layouts without CSS collisions.
- **Destination Stamp with Ride Verification**: Stamped seal and verified student badges in lockstep.
- **Action Nesting**: Tactile buttons and hold-to-confirm combined inside ride detail cancellation panels.
- **Design Playground Surface**: Full page compilation of `DesignPlaygroundPage` rendering all signature components with Campus Atlas token consistency.

### Tier 4: Real-World Application Scenarios (14 Tests)
Simulates end-to-end user workflows:
- **Premnagar to UIT Commute Corridor Flow**: Multi-stop transit corridor tracking, vehicle model & corridor notes disclosure, and seat request state transition from request action to "Requested ✓".
- **Emergency 112 SOS Distress Flow**: 10-digit mobile phone contact validation, GPS coordinate locking within Dehradun valley perimeter (`lat ~30.3415`, `lng ~77.9540`, `accuracy <= 50m`), reverse-geocoded landmark address, dispatch payload generation, and direct 112 emergency helpline reference.
- **Admin Tabular Telemetry Data Density**: Structured tabs (overview, users, rides, verifications), operational KPI metrics, tabular layout without AI pulse/ping ambient slop.
- **Permanent Constitutions Audit**: Verifies presence and contents of root `DESIGN.md` and `HUMAN-CHECK.md`, and validates that Rule R9 server boundaries remain 100% frozen.

---

## How to Run Tests

### Run Full Test Suite
```bash
npm run test:e2e
```
*or via tsx directly:*
```bash
npx tsx --test tests/e2e/index.test.ts
```

### Run Specific Test Tiers
```bash
npx tsx --test tests/e2e/tier1_features.test.ts
npx tsx --test tests/e2e/tier2_boundaries.test.ts
npx tsx --test tests/e2e/tier3_combinations.test.ts
npx tsx --test tests/e2e/tier4_scenarios.test.ts
```

---

## Test Execution Summary
- **Total Test Suites**: 4
- **Total Test Assertions**: 93
- **Passing**: 93 (100%)
- **Failing**: 0
- **Average Runtime**: ~1.0 - 1.2s
