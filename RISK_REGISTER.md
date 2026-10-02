# CollegeRide — Risk Register
**Version:** 4.0  
**Status:** Monitored

---

| Risk ID | Severity | Category | Risk Description | Root Cause | Impact | Mitigation / Treatment | Status |
|---|---|---|---|---|---|---|---|
| **R-01** | **BLOCKER** | Security & Privacy | Cross-role ride request data exposure on Vercel deployment. | `client/api/index.ts` `GET /api/requests` does not enforce auth and has empty query `{}` when `role!=passenger`. | Any user or unauthenticated client can dump all carpool requests. | Implement strict auth check and ownership scoping by role (`CR-P0B-02`). | **IDENTIFIED (Fix in progress)** |
| **R-02** | **BLOCKER** | Reliability / UX | Runtime TypeError crashing `/admin` page on Vercel. | `AdminDashboardPage.tsx` accesses `p.avatarURL` on unpopulated/undefined passenger objects. | White screen or broken telemetry cards on admin console. | Add optional chaining and null guards (`CR-P0B-01`). | **IDENTIFIED (Fix in progress)** |
| **R-03** | **HIGH** | Security & Privacy | Cross-user trip history leak on Vercel deployment. | `client/api/index.ts` `GET /api/trips` queries `tripsCol.find({})` with no user ID filter. | Any user can view all completed/scheduled trips. | Filter trips by `authUser.id` matching driver or passenger (`CR-P0B-03`). | **IDENTIFIED (Fix in progress)** |
| **R-04** | **MEDIUM** | Architecture | Behavioral drift between Express backend and Vercel serverless API. | Dual codebase maintaining duplicate routes. | Fixes applied to `server/` may not reflect on Vercel if not applied to `client/api/index.ts`. | Establish strict parity protocol (ADR-001) and update both handlers. | **CONTROLLED** |
| **R-05** | **MEDIUM** | UX / Navigation | Unauthenticated users can access `/admin` route before auth check completes. | `App.tsx` renders `AdminDashboardPage` directly without client-side route guard. | Non-admin users see admin layout momentarily before redirection. | Add `ProtectedRoute` or `AdminRoute` wrapper in `App.tsx` (`CR-P0C-02`). | **SCHEDULED** |
| **R-06** | **LOW** | Database / Infra | In-memory database fallback in production if `MONGODB_URI` environment variable is unset. | `db.ts` falls back to `MongoMemoryServer` when URI is missing. | Data reset on container or function restart. | Ensure production environment variables in Vercel include persistent MongoDB Atlas connection string. | **MONITORED** |
