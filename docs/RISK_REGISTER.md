# RISK REGISTER — COLLEGERIDE
**Version:** 1.0 (Phase P0-A Baseline)  
**Date:** September 2026

---

## Risk Matrix Summary

| Risk ID | Category | Description | Likelihood | Impact | Severity | Mitigation Strategy | Status |
|---|---|---|---|---|---|---|---|
| **RSK-001** | Data Loss | Destructive database migration or drop in remote MongoDB Atlas. | Low | Critical | **HIGH** | Strict non-destructive policy; backup before migrations; tests use isolated MongoMemoryServer. | **MITIGATED** |
| **RSK-002** | Data Integrity | Legacy Delhi / Metro records in remote Atlas rendering to users. | Medium | High | **HIGH** | Wire-level and frontend regex sanitization layers transform any legacy string dynamically. | **MITIGATED** |
| **RSK-003** | Security | Broken Object-Level Authorization allowing users to cancel others' rides. | Low | Critical | **CRITICAL** | Route handlers explicitly check `ride.creator.toString() === req.user.id`. Verified in test suite. | **VERIFIED** |
| **RSK-004** | Security | Students escalating privileges to approve their own verification requests. | Low | High | **HIGH** | Dedicated admin-only middleware (`requireRole('campus_admin')`) guarding `/api/verification/approve`. | **VERIFIED** |
| **RSK-005** | Performance | Heavy bundle size from `@vladmandic/face-api` / `human.esm.js` on slow mobile networks. | High | Medium | **MEDIUM** | Dynamic code splitting via React lazy-loading on face-verification route. | **MONITORED** |
| **RSK-006** | Integration | Third-party geocoding / OSRM API downtime or rate-limiting. | Medium | Medium | **MEDIUM** | Graceful fallback error states, client-side CARTO base tiles, and cached route coordinates. | **MITIGATED** |
| **RSK-007** | Concurrency | Race conditions in simultaneous seat reservation leading to overbooking. | Low | High | **HIGH** | Atomic database decrement with conditional check (`availableSeats > 0`) during seat booking. | **VERIFIED** |
