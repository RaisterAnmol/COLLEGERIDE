# CollegeRide — Architecture Decision Records (ADRs)
**Version:** 4.0  
**Status:** Approved & Recorded

---

## ADR-001: Parity & Dual-Backend Maintenance Strategy
- **Status:** Accepted
- **Context:** The repository contains both a local modular Express server (`server/src`) used for development/testing and a monolithic Vercel serverless function (`client/api/index.ts`) used for live deployment. 
- **Decision:** All critical business rules, security guards, data-scoping constraints, and emergency endpoints must be implemented symmetrically across both `server/src/` and `client/api/index.ts`. Jest integration tests run against `server/`, while live browser DevTools verification runs against `client/api/index.ts` on Vercel.
- **Consequences:** Eliminates behavioral drift between development/testing and production Vercel environments.

---

## ADR-002: Authoritative Server-Side Role and Ownership Scoping for Requests & Trips
- **Status:** Accepted
- **Context:** `GET /api/requests` and `GET /api/trips` on the Vercel serverless endpoint previously did not enforce authentication and allowed unscoped queries returning all records.
- **Decision:** 
  1. The server must derive user identity exclusively from the verified JWT token (`getAuthUser(req)`).
  2. For `GET /api/requests`:
     - If the user is a passenger, query only records where `passengerId == authUser.id`.
     - If the user is a driver, query only records where `rideId` belongs to rides created by `authUser.id`.
     - Unauthenticated requests must return `401 UNAUTHORIZED`.
  3. For `GET /api/trips`:
     - Only return trips where `driverId == authUser.id` or `passengerId == authUser.id`.
- **Consequences:** Prevents cross-role history leakage and broken object-level authorization (BOLA/IDOR).

---

## ADR-003: Defensive Frontend Hydration & Null-Safe Rendering for Heterogeneous MongoDB Documents
- **Status:** Accepted
- **Context:** In MongoDB collections like `rides`, passenger and driver fields may be stored as raw string ObjectIds or populated user objects, or may be undefined/null during live carpool states.
- **Decision:** Frontend JSX components must never assume sub-documents are populated objects. Every property access on nested objects (e.g. `ride.driver?.avatarURL`, `passenger?.avatarURL`, `p?.name`) must use optional chaining and provide sensible fallbacks. Arrays must be filtered with `.filter(Boolean)` before mapping.
- **Consequences:** Eliminates uncaught runtime TypeErrors on client dashboards and telemetry screens.

---

## ADR-004: Global Adaptive Map Illustration Background (`CampusBackground.tsx`)
- **Status:** Accepted
- **Context:** Individual page background layers caused visual clutter, high contrast, and obscured UI elements.
- **Decision:** A single, fixed, GPU-accelerated background (`CampusBackground.tsx`) is mounted in `AppLayout` behind all routes (`z-index: -1`, `pointer-events: none`). It automatically adapts its variant based on the current URL path:
  - `home` (`/`, `/colleges`): Full animated SVG routes, moving vehicles, and ambient particles.
  - `auth` (`/auth`, `/login`, `/register`): Softened 40% opacity, simplified geometry.
  - `verification` (`/verification`, `/face-verify`): Calm geometry, clear focus on document upload.
  - `dashboard` (`/dashboard`, `/admin`, `/search`, `/rides`): Mid-level opacity without distracting ambient leaves.
- **Consequences:** Cohesive visual identity, zero layout shifts, high contrast readability.

---

## ADR-005: Strict OSRM Coordinate Ordering `[lon, lat]` vs Leaflet `[lat, lon]` and Anti-Straight-Line Rule
- **Status:** Accepted
- **Context:** Coordinate inversion causes routing failures. Falling back to straight lines (`Polyline([pickup, destination])`) misleads users regarding actual road distances, driving times, and road feasibility in Dehradun's mountainous terrain.
- **Decision:**
  1. Internal coordinate representations must always specify explicit keys `{ lat, lng }`.
  2. At the OSRM boundary, coordinates must be explicitly formatted as `${lng},${lat}`.
  3. At the Leaflet boundary, coordinates must be explicitly formatted as `[lat, lng]`.
  4. If the routing provider fails, returns an error, or times out, the system must display an explicit "Route Unavailable" warning and NEVER draw a straight line or invent 0 km / 0 min values.
- **Consequences:** Reliable road navigation and truthful travel metrics.
