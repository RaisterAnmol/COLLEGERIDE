# ARCHITECTURE DECISIONS LOG — COLLEGERIDE
**Version:** 1.0 (Phase P0-A Baseline)  
**Date:** September 2026

---

## ADR-001: Strict Localization Boundary (Dehradun / Premnagar Corridor)
- **Status:** Accepted
- **Context:** The application previously retained legacy demo data referencing Delhi Metro stations (Rohini, Pitampura, Hauz Khas, DTU). The target deployment is dedicated exclusively to university communities in Dehradun, Uttarakhand (Uttaranchal University, Graphic Era University, UPES).
- **Decision:**
  1. Purged all hardcoded Delhi/Metro data across client mock datasets (`mockData.ts`, `academicData.ts`) and landing page components.
  2. Updated the seed script (`seed.ts`) to anchor all campuses, pickup hubs, geofences, vehicles, and rides to the Premnagar — Selaqui — Suddhowala — Clement Town corridors.
  3. Implemented a dual-layer sanitization architecture (`client/src/utils/sanitizeLocation.ts` on the client and in `client/api/index.ts` on the wire) that proactively cleans any legacy strings from existing MongoDB Atlas documents without requiring destructive database truncation.
- **Consequences:** Eliminates geographic disorientation for users and protects existing production Atlas databases from destructive resets.

---

## ADR-002: Role-Adaptive Commute Dashboard
- **Status:** Accepted
- **Context:** Passengers logging into the system were exposed to driver-centric UI blocks (such as "Your Offered Rides" and driver-oriented review tags like "Right on time"), which confused student passengers who do not own vehicles or offer rides.
- **Decision:**
  1. Refactored `DashboardPage.tsx` to conditionally render "Your Offered Rides" exclusively when `user.role === 'driver'` or `user.accountType === 'DRIVER'`.
  2. For passengers, display only "Your Requested Rides" (upcoming and past carpools).
  3. Filter review cards to present passenger-appropriate feedback and ratings.
- **Consequences:** Provides role integrity across student personas and eliminates cognitive dissonance during onboarding.

---

## ADR-003: Single Vercel Serverless Function Proxy (`client/api/index.ts`)
- **Status:** Accepted
- **Context:** The monorepo consists of a Vite React frontend and an Express backend. Deploying separately often leads to CORS errors, port mismatching, and cookie delivery hurdles.
- **Decision:**
  The Express server is packaged into a serverless handler inside `client/api/index.ts` for Vercel, while local development can run either standalone Express on port 5000 or the in-memory test harness.
- **Consequences:** Zero-CORS overhead on production; unified deployment from a single Git repository commit; atomic synchronization between frontend and backend contracts.

---

## ADR-004: Hierarchical Academic Affinity Matching Algorithm
- **Status:** Accepted
- **Context:** Campus carpooling safety and social comfort are maximized when students share classes, majors, or institutions.
- **Decision:**
  Implemented a 4-tier sorting and scoring engine:
  - **Rank 1:** Same Course & Semester.
  - **Rank 2:** Same Academic Department.
  - **Rank 3:** Same University Campus.
  - **Rank 4:** General proximity carpool matching score (RouteOverlap + TimeMatch + PickupProximity + SeatBonus).
- **Consequences:** Drives peer familiarity and accountability without sacrificing routing efficiency.
