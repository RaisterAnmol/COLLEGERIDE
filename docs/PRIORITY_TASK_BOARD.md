# PRIORITY TASK BOARD — COLLEGERIDE
**Version:** 1.0  
**Updated:** September 2026  
**Status Legend:** `[DONE]`, `[IN_PROGRESS]`, `[PLANNED]`, `[BLOCKED]`

---

## P0-A: Preserve Project, Inspect Repository, Establish Baseline
- [DONE] Audit repository directory layout, dependencies, build pipelines, and testing suites.
- [DONE] Purge all legacy Delhi NCR / Metro station references and enforce strict Dehradun / Premnagar localization.
- [DONE] Implement wire-level runtime location sanitizer in `client/api/index.ts` and `client/src/utils/sanitizeLocation.ts`.
- [DONE] Align test suites with Dehradun corridor coordinates; achieve 100% test pass rate (51/51 tests passing across 6 test suites).
- [DONE] Verify zero TypeScript errors and successful production bundling (`npm --prefix client run build`).
- [DONE] Establish formal documentation: `IMPLEMENTATION_MAP.md`, `PRIORITY_TASK_BOARD.md`, `ARCHITECTURE_DECISIONS.md`, `RISK_REGISTER.md`, `RELEASE_REPORT.md`.

---

## P0-B: Critical Security and Data Isolation
- [DONE] Broken Object-Level Authorization (BOLA) protections on Ride modification, deletion, and request acceptance.
- [DONE] Prevent regular students from self-verifying (`/api/verification/approve` restricted to `campus_admin`).
- [DONE] Passenger-specific dashboard view isolation: Hide "Your Offered Rides" div for passengers; show only "Your Requested Rides" & relevant passenger reviews.
- [DONE] Mask sensitive user attributes in public ride listings via `sanitizePublicUser()`.
- [PLANNED] Implement CSRF token verification on cookie-based stateful flows if enabled.

---

## P0-C: Authentication, Account Status, Verification Gates
- [DONE] Institutional email domain validation (`@uuofficial.edu.in`, `@geu.ac.in`, `@upes.ac.in`, `@college.edu`).
- [DONE] Role-aware dashboard routing (`driver`, `passenger`, `campus_admin`, `safety_officer`).
- [DONE] Biometric & campus ID card upload verification workflows.
- [PLANNED] Automatic token expiration refresh cycle with silent token renewal.

---

## P0-D: Core Ride Lifecycle and Database Integrity
- [DONE] Atomic seat decrement upon ride request acceptance.
- [DONE] Prevent overbooking and concurrent seat claiming beyond available capacity.
- [DONE] Trip lifecycle state machine: `scheduled` -> `driver_arrived` -> `in_progress` -> `completed` / `cancelled`.
- [DONE] Secure 4-digit OTP / QR verification protocol for passenger onboarding.

---

## P1-A: Geocoding, Coordinates, Real Road Routing
- [DONE] Road-aware routing engine integration (OSRM / CARTO) with zero straight-line geometric falsification.
- [DONE] Strict 1.2 km corridor proximity boundary enforcing realistic carpool detours.
- [DONE] Fallback handling displaying explicit error state if external map routing fails.

---

## P1-B: Profiles, Reviews, Chat, Notifications, SOS, Admin
- [DONE] Real-time ride-scoped participant messaging (WebSocket / REST conversation endpoints).
- [DONE] Emergency SOS trigger with idempotent incident creation and SMS / contact dispatch simulation.
- [DONE] Mutual peer reviews with role-adaptive criteria (driver rating on time; passenger rating behavior).
- [DONE] Campus administrator mobility analytics dashboard and verification queue management.

---

## P1-C: UX, Responsive Behavior, Accessibility, Error States
- [DONE] Distinct Loading, Empty, Error, and Success states across ride search and commute feeds.
- [DONE] Full mobile and tablet responsive layouts with Tailwind CSS.
- [PLANNED] Screen-reader ARIA audit across map markers and modal controls.

---

## P2-A: Performance, Observability, Maintainability
- [DONE] Structured logging with Pino logger and correlation IDs (`X-Request-Id`).
- [DONE] Indexed MongoDB queries on `creator`, `status`, `departureTime`, and geospatial points.
- [PLANNED] Client-side bundle splitting for heavy packages (`human.esm.js` dynamic import).

---

## P2-B: Deployment Readiness and Controlled Release
- [DONE] Single-command dual-mode execution (local memory server vs. production MongoDB Atlas).
- [DONE] Automated Vercel serverless proxy deployment configuration (`vercel.json`).
- [DONE] Production release audit and Go/No-Go release gate verification.
