# CollegeRide — Priority Task Board
**Version:** 4.0  
**Status:** Phase 0 Active / Phase 1 Ready

---

## Task Summary Table

| Task ID | Priority | Owner | Status | Objective |
|---|---|---|---|---|
| **CR-P0A-01** | P0-A | Chief Orchestrator | **DONE** | Establish working copy safety, git baseline, and baseline test execution. |
| **CR-P0A-02** | P0-A | Principal Architect | **DONE** | Generate implementation map, route inventory, and dual-backend divergence map. |
| **CR-P0B-01** | P0-B | Frontend Engineer | **DONE** | Fix `AdminDashboardPage.tsx` runtime TypeError (`Cannot read properties of undefined (reading 'avatarURL')`). |
| **CR-P0B-02** | P0-B | Backend / Security | **DONE** | Enforce strict authentication & driver/passenger ownership scoping on `GET /api/requests` in `client/api/index.ts`. |
| **CR-P0B-03** | P0-B | Backend / Security | **DONE** | Fix unscoped `GET /api/trips` endpoint in `client/api/index.ts` to prevent cross-user trip exposure. |
| **CR-P0B-04** | P0-B | Backend / Database | **DONE** | Populate `passengers` & `driver` user metadata safely on `/api/admin/operations` in `client/api/index.ts`. |
| **CR-P0C-01** | P0-C | Backend / Frontend | **TODO** | Formalize user account & verification status state machine (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`). |
| **CR-P0C-02** | P0-C | Frontend Engineer | **TODO** | Add client-side route guards in `App.tsx` for protected routes (`/admin`, `/post`, `/dashboard`). |
| **CR-P0D-01** | P0-D | Backend / Database | **TODO** | Atomic seat reservation and duplicate request prevention under concurrent booking load. |
| **CR-P0D-02** | P0-D | Backend / Frontend | **TODO** | Strict review eligibility enforcement (only verified participants of completed trips can review). |
| **CR-P1A-01** | P1-A | Geospatial Engineer | **TODO** | Validate coordinate order `[lon, lat]` vs `[lat, lon]` and eliminate any straight-line route fallback. |
| **CR-P1B-01** | P1-B | Backend / Security | **TODO** | Role-scoped dean multi-campus tenancy filtering for verification requests and SOC incidents. |
| **CR-P1C-01** | P1-C | UI-UX / Frontend | **TODO** | Standardize explicit four-state rendering (LOADING, EMPTY, ERROR, SUCCESS) across dashboard tables and search. |
| **CR-P2A-01** | P2-A | Reliability Engineer | **TODO** | Add query indexing and performance telemetry on active ride lookup and telemetry endpoints. |
| **CR-P2B-01** | P2-B | Release Engineer | **TODO** | Vercel production deployment smoke verification and zero-regression audit. |

---

## Detailed High-Priority Ticket Specifications

### Task: CR-P0B-01
```text
Task ID: CR-P0B-01
Priority: P0-B (Blocker)
Owner: Frontend Engineer (Agent 3)
Reviewers: Debugging Engineer (Agent 9), Independent Reviewer (Agent 11)
Objective: Eliminate runtime TypeError on /admin caused by accessing avatarURL on undefined or unpopulated passenger objects.
Observed defect or requirement: 
  Live Vercel console error: "Uncaught TypeError: Cannot read properties of undefined (reading 'avatarURL')".
  Occurs on AdminDashboardPage.tsx lines 929-955 in `(ride.passengers || []).map((p: any) => ...)`.
In scope: 
  Defensive null-checks and optional chaining for `p?.avatarURL`, `p?.name`, `p?.department`, `p?.college`, `p?.emergencyContact`.
  Filtering `ride.passengers` with `.filter(Boolean)` and handling string IDs vs populated objects.
Out of scope: UI redesign of the ongoing rides cards.
Files allowed to change: client/src/pages/AdminDashboardPage.tsx
Dependencies: None.
Acceptance criteria: 
  Visiting /admin without being logged in or with unpopulated passenger IDs in MongoDB renders safely without any console TypeErrors.
Tests required: Client production build succeeds (`npm --prefix client run build`), manual DevTools verification on /admin.
Risk: Low (isolated defensive rendering).
Status: TODO
Evidence: Pending implementation.
```

### Task: CR-P0B-02
```text
Task ID: CR-P0B-02
Priority: P0-B (Blocker / Privacy Incident)
Owner: Backend Engineer (Agent 4)
Reviewers: Security Engineer (Agent 7), Principal Architect (Agent 1)
Objective: Enforce strict authentication and ownership scoping on GET /api/requests in client/api/index.ts to resolve cross-role history leak.
Observed defect or requirement: 
  In client/api/index.ts lines 941-963, if roleParam !== 'passenger' or unauthenticated, the query is `{}`.
  This allows anyone to query all ride requests across all users in the system.
In scope: 
  1. Require valid JWT authentication via `getAuthUser(req)`. Reject unauthenticated calls with 401.
  2. If role is 'passenger' (or default for student), scope query strictly to `{ passengerId: authUser.id }`.
  3. If role is 'driver', query the driver's created rides and scope to `{ rideId: { $in: driverRideIds } }`.
  4. If specific `rideId` is passed, verify that the authenticated user is either the ride's creator or a participant before returning.
Out of scope: Express routes (which already have this logic in requestRoutes.ts).
Files allowed to change: client/api/index.ts
Dependencies: CR-P0A-02.
Acceptance criteria: 
  Unauthenticated GET /api/requests returns 401. Driver only receives requests for their own rides. Passenger only receives their own requests.
Tests required: Curl / automated API test verifying cross-user isolation.
Risk: Medium (core request list behavior).
Status: TODO
Evidence: Pending implementation.
```

### Task: CR-P0B-03
```text
Task ID: CR-P0B-03
Priority: P0-B (Blocker / Privacy Incident)
Owner: Backend Engineer (Agent 4)
Reviewers: Security Engineer (Agent 7)
Objective: Enforce strict user scoping on GET /api/trips in client/api/index.ts.
Observed defect or requirement: 
  client/api/index.ts lines 1030-1033 queries `tripsCol.find({}).limit(20)` without checking authenticated user ID.
In scope: 
  1. Enforce `getAuthUser(req)`.
  2. Scope query to `{ $or: [{ driverId: authUser.id }, { passengerId: authUser.id }, { "passengers.userId": authUser.id }] }`.
  3. Return 401 if unauthenticated.
Out of scope: Trip creation workflow.
Files allowed to change: client/api/index.ts
Dependencies: CR-P0A-02.
Acceptance criteria: Users only receive trips they participated in as driver or passenger.
Tests required: Curl / automated API test verifying scoping.
Risk: Low.
Status: TODO
Evidence: Pending implementation.
```
