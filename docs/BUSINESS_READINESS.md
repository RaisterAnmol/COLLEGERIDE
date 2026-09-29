# CampusRide Business & Institutional Readiness

## 1. Multi-Tenancy Architecture

CampusRide is engineered as a multi-tenant platform centered around two core domain primitives:
- `Institution`: Accredited university entity with authorized email domains (e.g. `uuofficial.edu.in`, `college.edu`).
- `Campus`: Physical campuses belonging to an institution, with distinct pickup hubs, safe parking shelters, and geofence safety zones.

### Cross-Institution Data Isolation
1. **Ride Matching Scoping**: Ride queries filter by matching campus corridors or institution boundaries.
2. **Administrative RBAC**: The `enforceInstitutionScope` middleware ensures campus safety officers and deans can only view their own students' verification queues, rides, and emergency incidents.
3. **Platform Super-Admin Layer**: Reserved for cross-institution analytics and global security auditing.

---

## 2. Institutional B2B Monetization Model

In accordance with the **Zero Payments** safety invariant for students, CampusRide generates revenue through direct B2B institutional software licenses sold to universities:

### Campus Annual Licensing Tiers
1. **Standard Campus Tier**: Includes `.edu` verification queue, 3 designated pickup hubs, cryptographic OTP ride passes, and basic campus transit analytics.
2. **Enterprise Safety Tier**: Adds real-time Route Deviation Monitoring, Campus Security Operations Center (SOC) dashboard, SMS emergency contact broadcast integration, and custom geofencing boundaries.

### White-Label Readiness
The client architecture supports institutional customization:
- **Design System Tokens (`client/src/design-system/tokens.ts`)**: Primary campus colors (e.g., Deep Campus Green `#143D32` to Crimson or Navy) can be configured per institution.
- **Dynamic Hub Directory**: Campuses and designated pickup points are dynamically fetched from `GET /api/places/hubs`.

---

## 3. Phased Pilot Rollout via Feature Flags

Using the `FeatureFlag` service (`server/src/services/featureFlagService.ts`), institutions can pilot specific capabilities without impacting other campuses:
- `womenOnlyFilter`: Pilot women-only carpools on specific campuses.
- `evPriorityMatching`: Reward electric vehicle drivers with top-tier search placement.
- `automatedStudentIdOcr`: Gate experimental OCR verification behind selected universities.
