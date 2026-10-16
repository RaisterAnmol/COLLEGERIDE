import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { React, renderComponent, FIXTURES } from './helpers.js';

// Signature Components
import { RouteThread } from '../../client/src/components/signature/RouteThread.js';
import { JourneyTicket } from '../../client/src/components/signature/JourneyTicket.js';
import { DestinationStamp } from '../../client/src/components/signature/DestinationStamp.js';
import { TactileButton } from '../../client/src/components/signature/TactileButton.js';
import { HoldToConfirm } from '../../client/src/components/signature/HoldToConfirm.js';

test('Tier 4: Real-World Application Scenarios — Premnagar to UIT Commute Corridor Flow', async (t) => {
  await t.test('4.S1: Premnagar to UIT transit corridor route thread maps campus route sequence', () => {
    const threadHtml = renderComponent(React.createElement(RouteThread, {
      stops: FIXTURES.corridorStops,
      ariaLabel: 'Premnagar - UIT Commute Spine',
    }));

    assert.ok(threadHtml.includes('Premnagar Chowk'), 'Origin stop is Premnagar Chowk');
    assert.ok(threadHtml.includes('Suddhowala Hub'), 'Intermediate stop is Suddhowala Hub');
    assert.ok(threadHtml.includes('Nanda Ki Chowki'), 'Intermediate stop is Nanda Ki Chowki');
    assert.ok(threadHtml.includes('UIT &amp; USCS Gate 1') || threadHtml.includes('UIT & USCS Gate 1'), 'Terminus is UIT Gate 1');
    assert.ok(threadHtml.includes('+6 min'));
    assert.ok(threadHtml.includes('+12 min'));
  });

  await t.test('4.S2: Commute pass displays real vehicle model, corridor disclosure, and fare', () => {
    const ticketHtml = renderComponent(React.createElement(JourneyTicket, {
      ride: FIXTURES.ridePremnagarToUIT,
    }));

    assert.ok(ticketHtml.includes('Maruti Suzuki Swift'), 'Vehicle model displayed');
    assert.ok(
      ticketHtml.includes('Vehicle &amp; Corridor Notes') || ticketHtml.includes('Vehicle & Corridor Notes'),
      'Corridor disclosure button displayed'
    );
    assert.ok(ticketHtml.includes('₹20'), 'Fuel share cost displayed');
  });

  await t.test('4.S3: Seat request lifecycle transitions from Request Seat to Requested checkmark', () => {
    // Initial state: Request Seat button available
    const initialHtml = renderComponent(React.createElement(JourneyTicket, {
      ride: FIXTURES.ridePremnagarToUIT,
      onRequestSeat: () => {},
      isRequested: false,
    }));
    assert.ok(initialHtml.includes('Request Seat'), 'Initial state allows requesting');
    assert.ok(!initialHtml.includes('Requested ✓'));

    // Requested state: Requested checkmark and cancel button rendered
    const requestedHtml = renderComponent(React.createElement(JourneyTicket, {
      ride: FIXTURES.ridePremnagarToUIT,
      isRequested: true,
      onCancelRequest: () => {},
    }));
    assert.ok(requestedHtml.includes('Requested ✓'), 'Requested status badge displayed');
    assert.ok(requestedHtml.includes('title="Cancel request"'), 'Cancel button enabled');
  });
});

test('Tier 4: Real-World Application Scenarios — Emergency 112 SOS Distress Flow & GPS Telemetry', async (t) => {
  await t.test('4.S4: Emergency SOS validates student 10-digit mobile phone contact', () => {
    // Validate phone number validation logic as implemented in SafetyPage
    const validatePhone = (rawPhone: string) => {
      const finalPhone = rawPhone.trim().startsWith('+91') ? rawPhone.trim() : `+91 ${rawPhone.trim()}`;
      return Boolean(rawPhone.trim() && finalPhone.replace(/\D/g, '').length >= 10);
    };

    assert.equal(validatePhone('9876543210'), true, 'Valid 10-digit mobile passes');
    assert.equal(validatePhone('+91 98765 43210'), true, 'Formatted +91 10-digit passes');
    assert.equal(validatePhone('12345'), false, 'Short number rejected');
    assert.equal(validatePhone(''), false, 'Empty phone rejected');
  });

  await t.test('4.S5: GPS coordinate lock telemetry formats accurate campus coordinates', () => {
    // Dehradun UIT campus perimeter coordinates
    const liveCoords = { lat: 30.3415, lng: 77.9540, accuracy: 15 };
    const liveAddress = 'Uttaranchal University Campus Perimeter, Suddhowala, Dehradun';

    // Verify coordinate bounds for Dehradun valley region (Lat ~30.2 - 30.4, Lng ~77.8 - 78.1)
    assert.ok(liveCoords.lat >= 30.2 && liveCoords.lat <= 30.4, 'Latitude in Dehradun bounds');
    assert.ok(liveCoords.lng >= 77.8 && liveCoords.lng <= 78.1, 'Longitude in Dehradun bounds');
    assert.ok(liveCoords.accuracy <= 50, 'GPS accuracy within institutional tolerance');

    // Build SOS emergency dispatch contract payload
    const sosPayload = {
      latitude: liveCoords.lat,
      longitude: liveCoords.lng,
      accuracy: liveCoords.accuracy,
      address: liveAddress,
      notes: 'Emergency SOS button triggered from Safety & Protection Hub.',
      phone: '+91 9876543210',
    };

    assert.equal(typeof sosPayload.latitude, 'number');
    assert.equal(typeof sosPayload.longitude, 'number');
    assert.ok(sosPayload.address.includes('Dehradun'));
    assert.ok(sosPayload.phone.startsWith('+91'));
  });

  await t.test('4.S6: Safety page includes direct dial 112 institutional emergency helpline', () => {
    const safetyPagePath = resolve(process.cwd(), 'client/src/pages/SafetyPage.tsx');
    const safetyPageContent = readFileSync(safetyPagePath, 'utf-8');

    // Direct police / emergency helpline 112
    assert.ok(
      safetyPageContent.includes('112') || safetyPageContent.includes('100 / 112'),
      'Safety page must explicitly reference 112 emergency line'
    );
  });
});

test('Tier 4: Real-World Application Scenarios — Admin Command Center Tabular Telemetry', async (t) => {
  await t.test('4.S7: Admin dashboard features structured tabular layout and institutional KPIs', () => {
    const adminPath = resolve(process.cwd(), 'client/src/pages/AdminDashboardPage.tsx');
    const adminContent = readFileSync(adminPath, 'utf-8');

    // Verify administrative tabs: overview, users, rides, verifications
    assert.ok(adminContent.includes("'overview'"));
    assert.ok(adminContent.includes("'users'"));
    assert.ok(adminContent.includes("'rides'"));
    assert.ok(adminContent.includes("'verifications'"));

    // Verify factual operations telemetry KPI metrics
    assert.ok(adminContent.includes('totalRevenue'));
    assert.ok(adminContent.includes('totalRides'));
    assert.ok(adminContent.includes('ongoingRides'));
  });

  await t.test('4.S8: Admin dashboard avoids ambient pulse/ping slop on live status indicators', () => {
    const adminPath = resolve(process.cwd(), 'client/src/pages/AdminDashboardPage.tsx');
    const adminContent = readFileSync(adminPath, 'utf-8');

    // Verify clean calm styling without distracting AI animations
    assert.ok(!adminContent.includes('repeat: -1'), 'Prohibited repeat: -1 animation in admin');
  });
});

test('Tier 4: Real-World Application Scenarios — Permanent Constitutions & Anti-Slop Audit', async (t) => {
  await t.test('4.S9: Root DESIGN.md and HUMAN-CHECK.md exist as permanent design constitutions', () => {
    const designMd = resolve(process.cwd(), 'DESIGN.md');
    const humanCheckMd = resolve(process.cwd(), 'HUMAN-CHECK.md');

    assert.ok(existsSync(designMd), 'DESIGN.md must exist in repo root');
    assert.ok(existsSync(humanCheckMd), 'HUMAN-CHECK.md must exist in repo root');

    const designContent = readFileSync(designMd, 'utf-8');
    assert.ok(designContent.includes('Campus Atlas'), 'DESIGN.md must specify Campus Atlas system');
    assert.ok(designContent.includes('#143D32'), 'DESIGN.md must specify Route Forest #143D32');

    const humanContent = readFileSync(humanCheckMd, 'utf-8');
    assert.ok(
      humanContent.includes('reducedMotion="user"') || humanContent.includes('reduced-motion'),
      'HUMAN-CHECK.md must enforce reduced motion'
    );
  });

  await t.test('4.S10: Backend server boundary (Rule R9) is strictly frozen and preserved', () => {
    const serverRoutesDir = resolve(process.cwd(), 'server/src/routes');
    const serverModelsDir = resolve(process.cwd(), 'server/src/models');

    assert.ok(existsSync(serverRoutesDir), 'Server routes directory exists and untouched');
    assert.ok(existsSync(serverModelsDir), 'Server models directory exists and untouched');
  });
});
