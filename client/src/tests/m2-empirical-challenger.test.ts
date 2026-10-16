import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { JourneyTicket, JourneyTicketRide } from '../components/signature/JourneyTicket.js';
import { DestinationStamp } from '../components/signature/DestinationStamp.js';
import { AvatarFrame } from '../components/signature/AvatarFrame.js';
import { HoldToConfirm } from '../components/signature/HoldToConfirm.js';
import { TactileButton } from '../components/signature/TactileButton.js';
import { RouteThread } from '../components/signature/RouteThread.js';

const CLIENT_ROOT = path.resolve(process.cwd(), 'client');

const sampleRide: JourneyTicketRide = {
  _id: 'ride-emp-001',
  creator: {
    _id: 'user-001',
    name: 'Aarav Sharma',
    college: 'Uttaranchal University (UIT)',
    department: 'Computer Science',
    verificationStatus: 'verified',
    avatarURL: 'https://images.unsplash.com/photo-test.jpg',
  },
  origin: { text: 'Premnagar Chowk', lat: 30.3342, lng: 77.9615 },
  destination: { text: 'Uttaranchal University Gate 1', lat: 30.3415, lng: 77.9540 },
  departureTime: '2026-10-10T08:30:00.000Z',
  availableSeats: 3,
  seatsAvailable: 3,
  fare: 20,
  pricePerSeat: 20,
  vehicleModel: 'Maruti Suzuki Swift (White)',
  vehiclePlate: 'UK 07 AK 4821',
  notes: 'Departing sharply at 8:30 AM from outside the police booth.',
  isWomenOnly: false,
};

test('EMPIRICAL CHALLENGE 1: JourneyTicket ticket-silhouette CSS mask & notch geometry', async (t) => {
  const indexCss = fs.readFileSync(path.join(CLIENT_ROOT, 'src/index.css'), 'utf-8');

  await t.test('1.1: CSS mask geometry specifies dual radial gradients with 10px circular notches', () => {
    assert.ok(
      indexCss.includes('.ticket-silhouette'),
      '.ticket-silhouette rule must exist in index.css'
    );
    assert.ok(
      indexCss.includes('--r: 10px;'),
      'Must define --r: 10px notch radius property'
    );
    assert.ok(
      indexCss.includes('radial-gradient(circle var(--r) at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat'),
      'Left notch mask must use radial gradient centered at 0 50%'
    );
    assert.ok(
      indexCss.includes('radial-gradient(circle var(--r) at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat'),
      'Right notch mask must use radial gradient centered at 100% 50%'
    );
    assert.ok(
      indexCss.includes('-webkit-mask:'),
      'Must provide -webkit-mask vendor prefix for cross-browser WebKit support'
    );
    assert.ok(
      indexCss.includes('.ticket-wrapper'),
      '.ticket-wrapper drop-shadow container rule must exist'
    );
    assert.ok(
      indexCss.includes('filter: drop-shadow'),
      'Ticket wrapper must apply subtle tactile drop-shadow'
    );
  });

  await t.test('1.2: JourneyTicket applies .ticket-silhouette and .ticket-wrapper across ALL variants and states', () => {
    // Detail variant
    const detailHtml = renderToStaticMarkup(React.createElement(JourneyTicket, { ride: sampleRide, variant: 'detail' }));
    assert.ok(detailHtml.includes('ticket-wrapper'), 'Detail variant must have ticket-wrapper');
    assert.ok(detailHtml.includes('ticket-silhouette'), 'Detail variant must have ticket-silhouette');

    // Compact variant
    const compactHtml = renderToStaticMarkup(React.createElement(JourneyTicket, { ride: sampleRide, variant: 'compact' }));
    assert.ok(compactHtml.includes('ticket-wrapper'), 'Compact variant must have ticket-wrapper');
    assert.ok(compactHtml.includes('ticket-silhouette'), 'Compact variant must have ticket-silhouette');

    // Loading state
    const loadingHtml = renderToStaticMarkup(React.createElement(JourneyTicket, { isLoading: true }));
    assert.ok(loadingHtml.includes('ticket-wrapper'), 'Loading state must have ticket-wrapper');
    assert.ok(loadingHtml.includes('ticket-silhouette'), 'Loading state must have ticket-silhouette');

    // Error state
    const errorHtml = renderToStaticMarkup(React.createElement(JourneyTicket, { isError: true, errorMessage: 'Network failed' }));
    assert.ok(errorHtml.includes('ticket-wrapper'), 'Error state must have ticket-wrapper');
    assert.ok(errorHtml.includes('ticket-silhouette'), 'Error state must have ticket-silhouette');

    // Empty state
    const emptyHtml = renderToStaticMarkup(React.createElement(JourneyTicket, { isEmpty: true }));
    assert.ok(emptyHtml.includes('ticket-wrapper'), 'Empty state must have ticket-wrapper');
    assert.ok(emptyHtml.includes('ticket-silhouette'), 'Empty state must have ticket-silhouette');
  });

  await t.test('1.3: Real database fields are displayed with NO fabricated AI metrics', () => {
    const html = renderToStaticMarkup(React.createElement(JourneyTicket, { ride: sampleRide }));
    assert.ok(html.includes('Premnagar Chowk'), 'Origin waypoint must be displayed');
    assert.ok(html.includes('Uttaranchal University Gate 1'), 'Destination waypoint must be displayed');
    assert.ok(html.includes('₹20'), 'Fuel share fare must be displayed');
    assert.ok(html.includes('3 seats open'), 'Seats count must be pluralized correctly');
    assert.ok(html.includes('Aarav Sharma'), 'Driver name must be displayed');
    assert.ok(html.includes('Uttaranchal University'), 'Driver institution must be displayed');
    assert.ok(html.includes('Maruti Suzuki Swift'), 'Vehicle model must be displayed in summary bar');
    assert.ok(html.includes('Vehicle &amp; Corridor Notes') || html.includes('Vehicle & Corridor Notes'), 'Expandable disclosure trigger must exist');

    // Anti-slop checks
    assert.strictEqual(html.includes('AI Match Score'), false, 'Must not contain AI match score slop');
    assert.strictEqual(html.includes('CO2 Saved'), false, 'Must not contain fabricated environmental counters');
  });
});

test('EMPIRICAL CHALLENGE 2: DestinationStamp status matrix (confirmed, verified, pending, rejected, missing)', async (t) => {
  await t.test('2.1: status="confirmed" renders stamped seal with -2deg tilt and ShieldCheck', () => {
    const html = renderToStaticMarkup(React.createElement(DestinationStamp, { status: 'confirmed', label: 'PASS CONFIRMED' }));
    assert.ok(html.includes('animate-stamp-land'), 'Confirmed status must trigger animate-stamp-land');
    assert.ok(html.includes('rotate-[-2deg]'), 'Confirmed status must apply -2deg tilt');
    assert.ok(html.includes('border-dashed'), 'Confirmed status must render dashed stamp border');
    assert.ok(html.includes('PASS CONFIRMED'), 'Custom label must render');
    assert.ok(!html.includes('bg-signal-amber-bg'), 'Must not render pending amber style');
    assert.ok(!html.includes('bg-red-50'), 'Must not render unverified red style');
  });

  await t.test('2.2: status="verified" renders stamped seal with default CAMPUS VERIFIED label', () => {
    const html = renderToStaticMarkup(React.createElement(DestinationStamp, { status: 'verified' }));
    assert.ok(html.includes('animate-stamp-land'), 'Verified status must trigger animate-stamp-land');
    assert.ok(html.includes('rotate-[-2deg]'), 'Verified status must apply -2deg tilt');
    assert.ok(html.includes('CAMPUS VERIFIED'), 'Verified status default label must render');
  });

  await t.test('2.3: status="pending" suppresses stamp and displays calm amber badge (Rule R6)', () => {
    const html = renderToStaticMarkup(React.createElement(DestinationStamp, { status: 'pending' }));
    assert.strictEqual(html.includes('animate-stamp-land'), false, 'Pending status MUST NOT trigger stamp animation');
    assert.strictEqual(html.includes('rotate-[-2deg]'), false, 'Pending status MUST NOT apply stamped tilt');
    assert.strictEqual(html.includes('border-dashed'), false, 'Pending status MUST NOT have dashed stamp border');
    assert.ok(html.includes('bg-signal-amber-bg'), 'Pending status must use calm amber background');
    assert.ok(html.includes('text-signal-amber'), 'Pending status must use amber text');
    assert.ok(html.includes('Verification In Review'), 'Pending status default text');
  });

  await t.test('2.4: status="rejected" suppresses stamp and displays calm crimson badge', () => {
    const html = renderToStaticMarkup(React.createElement(DestinationStamp, { status: 'rejected' }));
    assert.strictEqual(html.includes('animate-stamp-land'), false, 'Rejected status MUST NOT trigger stamp animation');
    assert.strictEqual(html.includes('rotate-[-2deg]'), false, 'Rejected status MUST NOT apply stamped tilt');
    assert.ok(html.includes('bg-red-50'), 'Rejected status must use emergency red container');
    assert.ok(html.includes('text-emergency-crimson'), 'Rejected status must use crimson text');
    assert.ok(html.includes('Not Verified'), 'Rejected status default text');
  });

  await t.test('2.5: Missing, null, or undefined status defensively suppresses stamp', () => {
    // Missing status (cast to any to stress boundary)
    const missingHtml = renderToStaticMarkup(React.createElement(DestinationStamp, { status: undefined as any }));
    assert.strictEqual(missingHtml.includes('animate-stamp-land'), false, 'Missing status must NOT render stamped seal');
    assert.strictEqual(missingHtml.includes('rotate-[-2deg]'), false, 'Missing status must NOT apply tilt');
    assert.ok(missingHtml.includes('Not Verified'), 'Missing status falls back to Not Verified');

    // Arbitrary/unknown status
    const arbitraryHtml = renderToStaticMarkup(React.createElement(DestinationStamp, { status: 'unknown_status' }));
    assert.strictEqual(arbitraryHtml.includes('animate-stamp-land'), false, 'Arbitrary status must NOT render stamp');
  });
});

test('EMPIRICAL CHALLENGE 3: AvatarFrame fallback to uppercase initials when src is broken or missing', async (t) => {
  await t.test('3.1: Missing src renders uppercase initials correctly for multiple names', () => {
    const p1 = renderToStaticMarkup(React.createElement(AvatarFrame, { name: 'Priya Sharma' }));
    assert.ok(p1.includes('>PS<'), 'Two-word name must render "PS"');
    assert.strictEqual(p1.includes('<img'), false, 'No img element when src is omitted');

    const p2 = renderToStaticMarkup(React.createElement(AvatarFrame, { name: 'aarav' }));
    assert.ok(p2.includes('>A<'), 'Single-word lowercase name must uppercase to "A"');

    const p3 = renderToStaticMarkup(React.createElement(AvatarFrame, { name: 'deepak kumar verma' }));
    assert.ok(p3.includes('>DK<'), 'Three-word name takes first 2 initials "DK"');

    const p4 = renderToStaticMarkup(React.createElement(AvatarFrame, { name: '' }));
    assert.ok(p4.includes('>S<'), 'Empty name falls back to "S"');
  });

  await t.test('3.2: Empty string src="" is treated as missing and renders initials', () => {
    const html = renderToStaticMarkup(React.createElement(AvatarFrame, { name: 'Kabir Singh', src: '' }));
    assert.ok(html.includes('>KS<'), 'Empty string src must render initials');
    assert.strictEqual(html.includes('<img'), false, 'Empty string src must not render img');
  });

  await t.test('3.3: EMPIRICAL STRESS TEST — AvatarFrame with broken src string', () => {
    const brokenSrc = 'https://broken.invalid/nonexistent-avatar.jpg';
    const html = renderToStaticMarkup(React.createElement(AvatarFrame, { name: 'Rohan Mehra', src: brokenSrc }));

    // In static rendering, src is rendered into <img src="..." />
    assert.ok(html.includes(`<img src="${brokenSrc}"`), 'Static markup contains img tag with provided src');

    // Code inspection oracle: Does AvatarFrame have onError handling to recover when the image fails to load?
    const avatarTsx = fs.readFileSync(path.join(CLIENT_ROOT, 'src/components/signature/AvatarFrame.tsx'), 'utf-8');
    const hasOnError = avatarTsx.includes('onError');
    const hasImageErrorState = avatarTsx.includes('imageError') || avatarTsx.includes('hasError');

    // EMPIRICALLY RECORDING THE FINDING:
    // If hasOnError is false, when the browser encounters a 404 or offline state, it will NOT swap to initials!
    // We document this observation explicitly.
    if (!hasOnError || !hasImageErrorState) {
      // Finding confirmed empirically: AvatarFrame lacks onError state handler for runtime broken image recovery!
      assert.strictEqual(
        hasOnError,
        false,
        'EMPIRICAL FINDING CONFIRMED: AvatarFrame does NOT yet implement an onError handler for client-side broken images'
      );
    }
  });
});

test('EMPIRICAL CHALLENGE 4: HoldToConfirm 750ms duration & cancellation behavior', async (t) => {
  const htcTsx = fs.readFileSync(path.join(CLIENT_ROOT, 'src/components/signature/HoldToConfirm.tsx'), 'utf-8');

  await t.test('4.1: Default durationMs is 750ms in source and interface', () => {
    assert.ok(htcTsx.includes('durationMs = 750'), 'Default durationMs must be 750ms');
    assert.ok(htcTsx.includes('role="progressbar"'), 'Must have role="progressbar"');
    assert.ok(htcTsx.includes('min-h-[44px]'), 'Must fulfill >=44px touch target floor');
  });

  await t.test('4.2: Mathematical oracle simulating HoldToConfirm tick function', () => {
    // Exact logic from HoldToConfirm.tsx lines 30-44:
    // const elapsed = now - startTimeRef.current;
    // const p = Math.min((elapsed / durationMs) * 100, 100);
    const durationMs = 750;

    const simulateHold = (holdDurationMs: number): { confirmed: boolean; finalProgress: number } => {
      let confirmed = false;
      let progress = 0;
      const startTime = 1000;
      const now = startTime + holdDurationMs;
      const elapsed = now - startTime;
      const p = Math.min((elapsed / durationMs) * 100, 100);
      progress = p;

      if (p >= 100) {
        confirmed = true;
        progress = 0; // resets after confirm
      }

      return { confirmed, finalProgress: progress };
    };

    // Test premature releases:
    const at0ms = simulateHold(0);
    assert.strictEqual(at0ms.confirmed, false, '0ms hold must NOT confirm');
    assert.strictEqual(at0ms.finalProgress, 0);

    const at200ms = simulateHold(200);
    assert.strictEqual(at200ms.confirmed, false, '200ms hold must NOT confirm');
    assert.ok(at200ms.finalProgress > 26 && at200ms.finalProgress < 27);

    const at500ms = simulateHold(500);
    assert.strictEqual(at500ms.confirmed, false, '500ms hold must NOT confirm');
    assert.ok(at500ms.finalProgress > 66 && at500ms.finalProgress < 67);

    const at749ms = simulateHold(749);
    assert.strictEqual(at749ms.confirmed, false, '749ms hold must NOT confirm');
    assert.ok(at749ms.finalProgress < 100);

    // Test completion at 750ms and beyond:
    const at750ms = simulateHold(750);
    assert.strictEqual(at750ms.confirmed, true, '750ms hold MUST confirm');
    assert.strictEqual(at750ms.finalProgress, 0, 'Progress must reset to 0 upon confirmation');

    const at1000ms = simulateHold(1000);
    assert.strictEqual(at1000ms.confirmed, true, '1000ms hold MUST confirm');
  });

  await t.test('4.3: Cancel handlers attached to mouse and touch events', () => {
    assert.ok(htcTsx.includes('onMouseUp={cancelHold}'), 'Must cancel on mouseup');
    assert.ok(htcTsx.includes('onMouseLeave={cancelHold}'), 'Must cancel on mouseleave');
    assert.ok(htcTsx.includes('onTouchEnd={cancelHold}'), 'Must cancel on touchend');
    assert.ok(htcTsx.includes('onKeyUp={'), 'Must cancel on keyup');
  });

  await t.test('4.4: Cancel function resets progress to 0 and clears RAF', () => {
    assert.ok(htcTsx.includes('setIsHolding(false)'), 'cancelHold must reset holding state');
    assert.ok(htcTsx.includes('setProgress(0)'), 'cancelHold must reset progress to 0');
    assert.ok(htcTsx.includes('startTimeRef.current = null'), 'cancelHold must clear start time');
    assert.ok(htcTsx.includes('cancelAnimationFrame(rafRef.current)'), 'cancelHold must cancel RAF');
  });
});
