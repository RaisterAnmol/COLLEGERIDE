import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { execSync } from 'node:child_process';

const CLIENT_ROOT = path.resolve(process.cwd(), 'client');
const PAGES_DIR = path.join(CLIENT_ROOT, 'src/pages');
const COMPONENTS_DIR = path.join(CLIENT_ROOT, 'src/components');
const APP_TSX = path.join(CLIENT_ROOT, 'src/App.tsx');

test('Milestone 3 Empirical Challenger: Page Routing, Refactoring & Integration Audit', async (t) => {

  // =========================================================================
  // CHALLENGE 1: Routing Architecture & Global Motion Configuration
  // =========================================================================
  await t.test('1. App.tsx: Complete 6-Page Routing & Global MotionConfig', () => {
    assert.ok(fs.existsSync(APP_TSX), 'App.tsx must exist');
    const appSource = fs.readFileSync(APP_TSX, 'utf-8');

    // MotionConfig reducedMotion="user"
    assert.ok(
      appSource.includes('<MotionConfig reducedMotion="user">'),
      'App.tsx must wrap layout in <MotionConfig reducedMotion="user">'
    );

    // Verify all 6 milestone route declarations
    assert.ok(appSource.includes('path="/" element={<LandingPage />}'), 'Landing route / must be declared');
    assert.ok(appSource.includes('path="/search" element={<SearchRidesPage />}'), 'Search route /search must be declared');
    assert.ok(appSource.includes('path="/rides/:id" element={<RideDetailPage />}'), 'Detail route /rides/:id must be declared');
    assert.ok(appSource.includes('path="/verification" element={<ProtectedRoute><VerificationStatusPage /></ProtectedRoute>}'), 'Verification route /verification must be protected');
    assert.ok(appSource.includes('path="/safety" element={<SafetyPage />}'), 'Safety route /safety must be declared');
    assert.ok(appSource.includes('path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>}'), 'Admin route /admin must be admin-protected');

    // Route aliases and redirects
    assert.ok(appSource.includes('path="/rides" element={<Navigate to="/search" replace />}'), '/rides must redirect to /search');
    assert.ok(appSource.includes('path="/post-ride" element={<Navigate to="/post" replace />}'), '/post-ride must redirect to /post');

    // Admin authorization logic checks
    assert.ok(
      appSource.includes("user.role === 'campus_admin'") &&
      appSource.includes("user.role === 'super_admin'"),
      'AdminRoute must check campus_admin and super_admin'
    );
  });

  // =========================================================================
  // CHALLENGE 2: Landing Page (/) Single Bold Moment & Zero AI Slop
  // =========================================================================
  await t.test('2. LandingPage: Single Bold Moment, Clean Corridors & Zero Fabrications', () => {
    const landingFile = path.join(PAGES_DIR, 'LandingPage.tsx');
    assert.ok(fs.existsSync(landingFile), 'LandingPage.tsx must exist');
    const landingSource = fs.readFileSync(landingFile, 'utf-8');

    // Must import exactly Hero, RideCards, StatusBanner, Footer
    assert.ok(landingSource.includes('import { Hero } from "../components/landing/Hero"'), 'Must import Hero');
    assert.ok(landingSource.includes('import { RideCards } from "../components/landing/RideCards"'), 'Must import RideCards');
    assert.ok(landingSource.includes('import { StatusBanner } from "../components/landing/StatusBanner"'), 'Must import StatusBanner');
    assert.ok(landingSource.includes('import { Footer } from "../components/landing/Footer"'), 'Must import Footer');

    // Pruned sections must NOT be imported or rendered
    const forbiddenLandingSections = [
      'RouteStory',
      'NetworkMap',
      'CommuteTimeline',
      'TrustVerificationSection',
      'LiveNetworkStats',
      'CommunitySection',
      'FinalCTA',
      'HeroIllustration'
    ];
    for (const section of forbiddenLandingSections) {
      assert.strictEqual(
        landingSource.includes(section),
        false,
        `LandingPage must NOT contain pruned bloated section: ${section}`
      );
    }

    // Hero must mount RouteThread as the single bold moment
    const heroFile = path.join(COMPONENTS_DIR, 'landing/Hero.tsx');
    const heroSource = fs.readFileSync(heroFile, 'utf-8');
    assert.ok(heroSource.includes('<RouteThread />') || heroSource.includes('<RouteThread'), 'Hero must mount RouteThread');

    // RideCards must mount JourneyTicket for genuine ride passes
    const rideCardsFile = path.join(COMPONENTS_DIR, 'landing/RideCards.tsx');
    const rideCardsSource = fs.readFileSync(rideCardsFile, 'utf-8');
    assert.ok(rideCardsSource.includes('<JourneyTicket'), 'RideCards must mount JourneyTicket');

    // Zero anime persona slop in active landing components
    const activeLandingSources = [landingSource, heroSource, rideCardsSource];
    const animeNames = ['Ichigo', 'Makima', 'Zoro', 'Mitsuha', 'Kurosaki'];
    for (const src of activeLandingSources) {
      for (const anime of animeNames) {
        assert.strictEqual(
          src.toLowerCase().includes(anime.toLowerCase()),
          false,
          `Active landing code must not contain anime mock personas: ${anime}`
        );
      }
    }
  });

  // =========================================================================
  // CHALLENGE 3: Search Page (/search) Preset Locations & Ticket Display
  // =========================================================================
  await t.test('3. SearchRidesPage: Presets, Dynamic URL Matching & JourneyTicket Passes', () => {
    const searchFile = path.join(PAGES_DIR, 'SearchRidesPage.tsx');
    assert.ok(fs.existsSync(searchFile), 'SearchRidesPage.tsx must exist');
    const searchSource = fs.readFileSync(searchFile, 'utf-8');

    // Mounts JourneyTicket
    assert.ok(
      searchSource.includes("from '../components/signature/JourneyTicket'") ||
      searchSource.includes('from "../components/signature/JourneyTicket"'),
      'Must import JourneyTicket'
    );
    assert.ok(searchSource.includes('<JourneyTicket'), 'Must mount JourneyTicket for search results');

    // Authentic Dehradun waypoints in PRESET_LOCATIONS
    const expectedWaypoints = [
      'UIT Building',
      'USCS Building',
      'Premnagar Chowk',
      'Suddhowala Chowk',
      'Selaqui',
      'ISBT Dehradun'
    ];
    for (const wp of expectedWaypoints) {
      assert.ok(
        searchSource.includes(wp),
        `PRESET_LOCATIONS in SearchRidesPage must include authentic waypoint: ${wp}`
      );
    }

    // findPresetIndex query parser must exist
    assert.ok(searchSource.includes('function findPresetIndex'), 'Must implement findPresetIndex helper');

    // No uppercase tracking eyebrows
    assert.strictEqual(
      /uppercase\s+tracking-(?:wider|widest)/.test(searchSource),
      false,
      'SearchRidesPage must not contain uppercase tracking eyebrow slop'
    );
  });

  // =========================================================================
  // CHALLENGE 4: Ride Detail Page (/rides/:id) Pass Variant & Navigation Toggle
  // =========================================================================
  await t.test('4. RideDetailPage: Detail Ticket Variant, Map Navigation Toggle & Offline Fallback', () => {
    const detailFile = path.join(PAGES_DIR, 'RideDetailPage.tsx');
    assert.ok(fs.existsSync(detailFile), 'RideDetailPage.tsx must exist');
    const detailSource = fs.readFileSync(detailFile, 'utf-8');

    // Mounts JourneyTicket with detail variant
    assert.ok(
      detailSource.includes('<JourneyTicket') && detailSource.includes('variant="detail"'),
      'RideDetailPage must mount JourneyTicket with variant="detail"'
    );

    // Walking guide / navigation map toggle
    assert.ok(
      detailSource.includes('onToggleMap') || detailSource.includes('setShowWalkingGuide'),
      'RideDetailPage must provide walking guide/map navigation toggle'
    );

    // DEMO_FALLBACK_RIDES lookup for resilient fallback handling
    assert.ok(
      detailSource.includes('DEMO_FALLBACK_RIDES'),
      'RideDetailPage must query DEMO_FALLBACK_RIDES on API failure'
    );
  });

  // =========================================================================
  // CHALLENGE 5: Verification Page (/verification) Authentic ID & DestinationStamp
  // =========================================================================
  await t.test('5. VerificationStatusPage: DestinationStamp Integration & Authentic Student Profile', () => {
    const verifFile = path.join(PAGES_DIR, 'VerificationStatusPage.tsx');
    assert.ok(fs.existsSync(verifFile), 'VerificationStatusPage.tsx must exist');
    const verifSource = fs.readFileSync(verifFile, 'utf-8');

    // Mounts DestinationStamp
    assert.ok(
      verifSource.includes('import { DestinationStamp } from "../components/signature/DestinationStamp"'),
      'Must import DestinationStamp'
    );
    assert.ok(
      verifSource.includes('<DestinationStamp'),
      'Must mount <DestinationStamp> in collegiate ID card'
    );

    // Verifies status mapping
    assert.ok(
      verifSource.includes("user.verificationStatus === 'verified' ? 'verified' : 'pending'"),
      'DestinationStamp must gate to verified status'
    );

    // Anime mock persona replacement: "Aarav Joshi" instead of "MITSUHA MIYAMIZU"
    assert.ok(verifSource.includes('Aarav Joshi'), 'Must include genuine student profile name Aarav Joshi');
    assert.strictEqual(
      verifSource.includes('MITSUHA MIYAMIZU'),
      false,
      'Must NOT contain anime persona MITSUHA MIYAMIZU'
    );

    // Daily driver check-in flow exists
    assert.ok(verifSource.includes('Daily Driver Check-in'), 'Must feature Daily Driver Check-in workflow');
  });

  // =========================================================================
  // CHALLENGE 6: Safety Page (/safety) Institutional 112 SOS & Live GPS Telemetry
  // =========================================================================
  await t.test('6. SafetyPage: Institutional 112 Direct Dial, GPS Telemetry & Zero Pulse Loops', () => {
    const safetyFile = path.join(PAGES_DIR, 'SafetyPage.tsx');
    assert.ok(fs.existsSync(safetyFile), 'SafetyPage.tsx must exist');
    const safetySource = fs.readFileSync(safetyFile, 'utf-8');

    // 112 emergency telephone links
    assert.ok(
      safetySource.includes('tel:112'),
      'SafetyPage must include direct telephone link to national emergency police helpline 112'
    );

    // Live GPS telemetry with campus perimeter fallback
    assert.ok(
      safetySource.includes('30.3415') && safetySource.includes('77.9540'),
      'SafetyPage must include campus perimeter coordinate fallback (30.3415, 77.9540)'
    );
    assert.ok(
      safetySource.includes('acquireLocation') || safetySource.includes('navigator.geolocation'),
      'SafetyPage must attempt GPS geolocation acquisition'
    );

    // Zero ambient pulse or ping on status badges
    assert.strictEqual(
      safetySource.includes(['animate', 'pulse'].join('-')),
      false,
      'SafetyPage must eliminate animate pulse slop'
    );
    assert.strictEqual(
      safetySource.includes(['animate', 'ping'].join('-')),
      false,
      'SafetyPage must eliminate animate ping slop'
    );
  });

  // =========================================================================
  // CHALLENGE 7: Admin Dashboard (/admin) High-Density Tabular Telemetry
  // =========================================================================
  await t.test('7. AdminDashboardPage: Structured Tabular Telemetry, Auth Checks & Zero Ambient Loops', () => {
    const adminFile = path.join(PAGES_DIR, 'AdminDashboardPage.tsx');
    assert.ok(fs.existsSync(adminFile), 'AdminDashboardPage.tsx must exist');
    const adminSource = fs.readFileSync(adminFile, 'utf-8');

    // Institutional KPIs
    assert.ok(adminSource.includes('totalRevenue'), 'Must track totalRevenue KPI');
    assert.ok(adminSource.includes('totalRides'), 'Must track totalRides KPI');
    assert.ok(adminSource.includes('ongoingRidesCount'), 'Must track ongoingRidesCount KPI');

    // Role verification logic
    assert.ok(
      adminSource.includes("user.role !== 'super_admin'") &&
      adminSource.includes("user.role !== 'campus_admin'"),
      'Must enforce admin role authorization'
    );

    // Zero ambient pulse or ping in core dashboard page
    assert.strictEqual(
      adminSource.includes(['animate', 'pulse'].join('-')),
      false,
      'AdminDashboardPage must not use animate pulse'
    );
    assert.strictEqual(
      adminSource.includes(['animate', 'ping'].join('-')),
      false,
      'AdminDashboardPage must not use animate ping'
    );
  });

  // =========================================================================
  // CHALLENGE 8: Backend Server Boundary Integrity (Rule R9)
  // =========================================================================
  await t.test('8. Rule R9 Boundary: Zero Server Modifications', () => {
    // Check git status to ensure server/ directory is completely pristine
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    const modifiedServerFiles = gitStatus
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .filter((line: string) => line.includes('server/'));

    assert.strictEqual(
      modifiedServerFiles.length,
      0,
      `Rule R9 violation: server files were modified: ${modifiedServerFiles.join(', ')}`
    );
  });
});
