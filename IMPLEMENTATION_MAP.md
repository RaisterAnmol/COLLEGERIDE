# CollegeRide (CampusRide) — Implementation Map
**Version:** 4.0  
**Generated Date:** October 2026  
**Status:** Phase 0 Baseline Audit Complete

---

## 1. System Architecture Overview

CollegeRide is a campus-centric carpooling and commute-matching platform designed for university students and administrators (primarily tested with Uttaranchal University, Graphic Era University, UPES Dehradun, and DIT University).

The repository contains a hybrid architecture:
1. **Frontend (`client/`)**: Single Page Application built with **React 19**, **TypeScript 5.7**, **Vite 6.1**, **Tailwind CSS 3.4**, **React Router 7.1**, **Lucide React**, **Leaflet 1.9**, and **Framer Motion 13 / GSAP 3.15**.
2. **Serverless Monolithic API (`client/api/index.ts` & `api/index.ts`)**: Monolithic HTTP request dispatcher designed for deployment on **Vercel Serverless Functions**. It connects directly to MongoDB via the native MongoDB Node.js driver and Mongoose.
3. **Dedicated Express API Server (`server/`)**: Express 4.21 backend server with Mongoose 8.9 models, Zod validation, Pino structured logging, Helmet/CORS/Rate-limiting security middleware, Socket.IO real-time hub, and Jest integration tests with MongoMemoryServer.
4. **Geospatial & Map Services**: Leaflet-based map rendering, CARTO basemap tiles, custom OSRM-based routing via `/api/routes/calculate` or `/api/routing/route`, and campus pickup hubs.

---

## 2. Directory Structure & Key Files

```
campusride/
├── api/
│   └── index.ts                         # Re-exports client/api/index.ts for root Vercel deployments
├── client/
│   ├── api/
│   │   └── index.ts                     # Vercel Serverless Monolithic Handler (1,550+ lines)
│   ├── public/
│   │   ├── favicon.ico                  # 32x32 Favicon (cache-busted with ?v=3 in index.html)
│   │   ├── favicon.png                  # PNG icon
│   │   ├── favicon.svg                  # Vector icon
│   │   └── assets/
│   │       └── campus-map-bg.jpg        # Illustrated campus roads backdrop
│   ├── src/
│   │   ├── App.tsx                      # Root layout, AppLayout, routing, global CampusBackground
│   │   ├── components/
│   │   │   ├── Navbar.tsx               # Responsive frosted navbar with role-aware navigation
│   │   │   ├── common/
│   │   │   │   ├── CampusBackground.tsx # Multi-layer animated SVG & backdrop illustration
│   │   │   │   ├── CampusBackground.css # GPU-accelerated styling for background routes & vehicles
│   │   │   │   └── CustomCursor.tsx     # Custom cursor component
│   │   │   ├── map/
│   │   │   │   └── PickupAndRouteNavigationMap.tsx # Leaflet & OSRM road route map
│   │   │   └── verification/
│   │   │       └── VerificationReviewModal.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Client authentication state & session management
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # Public overview and campus statistics
│   │   │   ├── AuthPage.tsx             # Login / Register tabs, role selection, academic details
│   │   │   ├── DashboardPage.tsx        # Role-based dashboard (Driver offers, Passenger bookings)
│   │   │   ├── SearchRidesPage.tsx      # Ride search, filters, pricing, seat request modal
│   │   │   ├── PostRidePage.tsx         # Offer a ride, waypoint selection, seats, preferences
│   │   │   ├── RideDetailPage.tsx       # Ride telemetry, driver profile, seat requests, reviews
│   │   │   ├── TripTrackingPage.tsx     # Live ride tracking, OTP verification, SOS trigger
│   │   │   ├── AdminDashboardPage.tsx   # Admin telemetry, live rides, verification queue, SOC
│   │   │   ├── SafetyPage.tsx           # University safety protocols & verification guidelines
│   │   │   ├── CollegesPage.tsx         # Affiliated institutions & active campus hubs
│   │   │   ├── VerificationStatusPage.tsx # Identity & student document verification submission
│   │   │   └── FaceVerifyPage.tsx       # Biometric face liveness verification (@vladmandic/human)
│   │   └── services/
│   │       ├── api.ts                   # Fetch wrapper for /api endpoints
│   │       └── socket.ts                # Socket.IO client connector
│   └── vercel.json                      # Vercel routing rewrites (/api/(.*) -> /api, /(.*) -> /index.html)
├── server/
│   ├── src/
│   │   ├── app.ts                       # Express app configuration with middleware & routes
│   │   ├── index.ts                     # HTTP & Socket.IO server startup
│   │   ├── models/                      # Mongoose models (User, Ride, RideRequest, Trip, Incident, etc.)
│   │   ├── routes/                      # Modular Express route handlers
│   │   ├── middleware/                  # auth.ts (JWT), rateLimiter.ts, validate.ts
│   │   ├── services/                    # matchingEngine.ts, osmRoutingService.ts
│   │   └── utils/                       # db.ts (MongoDB Atlas + MongoMemoryServer), logger.ts
│   └── tests/                           # Jest test suites (authorization, security, matching engine)
```

---

## 3. Route & Navigation Map

| Client Route | Component | Access Control / Target Audience | CampusBackground Variant |
|---|---|---|---|
| `/` | `LandingPage` | Public (Unauthenticated / All) | `home` |
| `/auth`, `/login`, `/register` | `AuthPage` | Public (Redirects to dashboard if logged in) | `auth` |
| `/dashboard` | `DashboardPage` | Authenticated (Passenger / Driver / Dean) | `dashboard` |
| `/search`, `/rides` | `SearchRidesPage` | Public / Students looking for carpools | `dashboard` |
| `/rides/:id` | `RideDetailPage` | Authenticated / Public view of ride details | `dashboard` |
| `/post`, `/post-ride` | `PostRidePage` | Verified Drivers | `dashboard` |
| `/trips/:id` | `TripTrackingPage` | Authenticated Driver / Accepted Passengers | `dashboard` |
| `/verification` | `VerificationStatusPage` | Authenticated Students awaiting ID approval | `verification` |
| `/face-verify` | `FaceVerifyPage` | Authenticated Students / Drivers | `verification` |
| `/admin` | `AdminDashboardPage` | Campus Admins, Super Admins, Security Moderators | `dashboard` |
| `/safety` | `SafetyPage` | Public Safety Information | `dashboard` |
| `/colleges` | `CollegesPage` | Public University Directory | `home` |

---

## 4. API Inventory & Dual-Engine Divergence

The project operates two distinct backend implementations that must maintain parity:

### Endpoints Implemented in Both Engines:

| Endpoint | Method | `server/src/` (Express) | `client/api/index.ts` (Vercel) | Discrepancy / Risk |
|---|---|---|---|---|
| `/api/auth/login` | POST | Zod validation, JWT, tokenVersion | Native Mongo lookup, bcrypt, JWT | Parity OK |
| `/api/auth/register` | POST | Full validation, academic info | Native Mongo insert, duplicate check | Parity OK |
| `/api/auth/me` | GET | `requireAuth`, scopes by JWT ID | `getAuthUser`, scopes by JWT ID | Parity OK |
| `/api/rides` | GET | Filter by college, query, status | Filter by college, seats, lat/lng | Parity OK |
| `/api/rides` | POST | `requireAuth`, driver validation | `getAuthUser`, driver validation | Parity OK |
| `/api/requests` | GET | **Scoped**: Driver gets own rides' reqs, Passenger gets own reqs | **VULNERABLE**: Returns unscoped requests if role!=passenger or unauthed | **P0 Blocker**: Cross-role data exposure |
| `/api/trips` | GET | Scoped to authenticated user's trips | **VULNERABLE**: Returns all trips without user scoping | **P0 Blocker**: Privacy leak |
| `/api/admin/operations` | GET | Express admin route with RBAC | Native Mongo queries for active rides & KPIs | **VULNERABLE**: Returns unpopulated `passengers` array -> UI crash |
| `/api/emergency/sos` | POST | Dispatches alerts, creates Incident | Inserts into `emergencyincidents` collection | Parity OK |
| `/api/emergency/incidents` | GET | Express role-checked list | Role-checked list (401 if unauthenticated) | Parity OK |
| `/api/routes/calculate` | POST | OSRM route service | Direct OSRM request via fetch | Need strict axis order verification |

---

## 5. Role & Ownership Access Matrix

| Role | Permitted Actions | Restricted Actions |
|---|---|---|
| **Passenger** (`student` / `passenger`) | Find rides, request seats on valid rides, view own requests, view own trip tracking, review completed rides. | Post rides, view other passengers' requests, view admin telemetry, approve verifications. |
| **Driver** (`verified_driver` / `driver`) | Post rides, manage requests for *own* rides only, start/complete own trips, view own reviews. | Modify or cancel another driver's rides, view requests for other drivers' rides, access admin logs. |
| **Campus Admin / Dean** (`campus_admin`) | View campus verification requests, approve/reject student IDs for assigned college, view SOC security incidents. | Access cross-college data outside assigned college scope, modify driver ride fares arbitrarily. |
| **Super Admin** (`super_admin`) | System-wide audit logs, pricing configurations, global analytics, multi-campus administration. | Bypassing audit logging on sensitive mutations. |

---

## 6. Baseline Verification Commands & Status

| Test Suite / Command | Scope | Result | Notes |
|---|---|---|---|
| `npm --prefix client run build` | Frontend TypeScript & Vite bundle | **PASSED (0)** | 2,155 modules transformed, 36.8s build time. |
| `npm --prefix server test` | Backend Jest test suite | **PASSED (0)** | 6 test suites passed, 51 tests passed, 0 failures. |
| `git status` | Source control status | **CLEAN** | Working tree clean, synced with origin/main. |
