# CampusRide — Verified Student Carpool & Commute-Matching Platform

**CampusRide** is a verified, student-only carpool-matching web application connecting university students between home/hostel and campus with intelligent route & time matching, real-time coordination chat, pickup OTP verification, mutual ratings, and mobility analytics.

---

## 🚀 Quick Start (Zero Setup Required)

The project includes an automatic in-memory MongoDB fallback (`mongodb-memory-server`) with auto-seeding, meaning **no Docker or separate MongoDB daemon is required** to run locally out of the box.

### 1. Install Dependencies
```bash
# From the root directory:
npm run install:all
```
*(Or install separately inside `/server` and `/client` via `npm install`)*

### 2. Start Backend & Frontend Concurrently

**Terminal 1: Backend Server (Port 5000)**
```bash
npm run dev:server
# Runs Express + Socket.IO + In-Memory MongoDB + Auto-seeding
```

**Terminal 2: Frontend Client (Port 5173)**
```bash
npm run dev:client
# Launches Vite dev server at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Run Tests

### Backend Unit Tests & Live E2E Verification
```bash
npm run test:server
```
Runs 16/16 tests including:
- Section 8.1 Matching Engine Unit Tests (Route overlap, divergent routes, time gap clamping, seat limits, preference filtering, haversine accuracy).
- Section 6 Live E2E Verification Pass (Auth, Ride creation, Search scoring, Women-only preference filter, Request/Accept workflow, Real-time Chat, OTP Pickup verification, Mutual Reviews, Mobility Analytics).
Runs 40/40 tests across 4 suites:
- Matching Engine Unit Tests (Route overlap, divergent routes, time gap clamping, seat limits, preference filtering, haversine accuracy).
- Security & RBAC Guardrails Suite (Self-verification prevention, admin audit log protection, SOS incident creation, trip state machine transitions).
- Live E2E Verification Pass (Auth, Ride creation, Search scoring, Women-only filter, Request/Accept workflow, Real-time Chat, OTP Pickup verification, Mutual Reviews, Mobility Analytics).
- Security Patch & Core Invariants (Atomic seat oversell prevention, cryptographic OTP lockout, timing-safe verification, PII sanitization).

---

## 👥 Demo Personas (One-Click Switcher Available in UI)
## 👥 Demo Personas & Evaluation

Three pre-seeded demo accounts are ready for instant evaluation via the top banner switcher:
Pre-seeded student, driver, and administrator accounts are ready for testing.
In development mode, use the **One-Click Persona Switcher** dropdown in the top navigation bar to instantly assume driver, passenger, and security operations roles.

| Persona | Role | Email | Password | Features Tested |
|---|---|---|---|---|
| **Aditya Kumar** | Driver | `aditya.kumar@college.edu` | `password123` | DTU 3rd yr, 4.8★, Honda City car, active ride offered |
| **Rahul Sharma** | Passenger | `rahul.sharma@college.edu` | `password123` | DTU 2nd yr, 4.9★, searches same route, gets **90%+ match** |
| **Priya Singh** | Passenger | `priya.singh@college.edu` | `password123` | 1st yr, **Women-only preference** (strictly filters out Aditya) |
- For local credentials and complete persona profiles, see [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md).
- For security architecture and vulnerability disclosure policies, see [SECURITY.md](./SECURITY.md).

---

## 🛠️ Architecture & Tech Stack

```
campusride/
├── client/                     # React 19 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, MatchScoreBadge, ChatModal, ReviewModal
│   │   ├── context/            # AuthContext (with 1-click persona switcher)
│   │   ├── pages/              # Landing, Auth, Dashboard, PostRide, SearchRides,
│   │   │                       # RideDetail, TripTracking, AdminDashboard
│   │   ├── services/           # REST API client & Socket.IO client
│   │   └── types/              # Full TypeScript contracts matching Section 7
│   │   └── types/              # Full TypeScript contracts
├── server/                     # Node.js + Express + TypeScript + Mongoose + Socket.IO
│   ├── src/
│   │   ├── models/             # User, Vehicle, Ride, RideRequest, Trip, Conversation, Review
│   │   ├── routes/             # auth, rides, requests, trips, conversations, reviews, analytics
│   │   ├── services/           # Pure function matching engine (detour algorithm)
│   │   ├── sockets/            # Socket.IO room management (user rooms, ride rooms)
│   │   └── utils/              # Dual-mode DB connection (external URI or in-memory)
│   └── tests/                  # Section 8.1 unit tests & full E2E narrative test suite
│   │   └── utils/              # Dual-mode DB connection & Pino logger
│   └── tests/                  # Unit tests & full E2E narrative test suite
├── docker-compose.yml          # Containerized deployment config (Mongo + Server + Client)
└── package.json                # Root workspace scripts
```

---

## 📐 Matching Engine Algorithm (Section 7.3)
## 📐 Matching Engine Algorithm

$$\text{MatchScore} = 0.5 \times \text{RouteOverlap} + 0.3 \times \text{TimeMatch} + 0.15 \times \text{PickupProximity} + 0.05 \times \text{SeatBonus}$$

- **Route Overlap (50%)**: $1 - (\text{DetourDistance} / \text{DriverRouteDistance})$, where detour is calculated via Haversine great-circle formula.
- **Time Alignment (30%)**: $\max(0, 1 - |\Delta t| / 15\text{ min})$.
- **Pickup Proximity (15%)**: Normalized inverse distance capped at $2\text{ km}$.
- **Seat Bonus (5%)**: Disqualifies if requested seats exceed capacity.
- **Hard Filters**: Preferences like `womenOnlyDriver` strictly disqualify non-matching rides ($Score = 0$).

---

## 🔒 Campus Safety Guardrails

- **Zero Payments**: CampusRide handles zero money processing; cost-sharing is strictly informational.
- **Pickup OTP**: Drivers generate a secure 4-digit code on departure. Passengers enter it upon boarding to activate live trip telemetry.
- **Emergency ICE**: Direct emergency SOS dialer and student ICE contact persistence.
- **Pickup OTP**: Drivers generate a secure 6-digit CSPRNG code on departure. Passengers enter or scan QR code upon boarding to activate live trip telemetry.
- **Emergency ICE & SOC**: Direct emergency SOS dispatcher, student ICE contacts persistence, and Security Operations Center (SOC).
- **Ownership Verification**: Strict authorization middleware prevents cross-user ride modification or unauthorized request acceptance.


# COLLEGERIDE
