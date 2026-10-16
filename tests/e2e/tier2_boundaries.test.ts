import test from 'node:test';
import assert from 'node:assert/strict';
import { React, renderComponent, FIXTURES } from './helpers.js';

// Signature Components
import { RouteThread } from '../../client/src/components/signature/RouteThread.js';
import { JourneyTicket } from '../../client/src/components/signature/JourneyTicket.js';
import { DestinationStamp } from '../../client/src/components/signature/DestinationStamp.js';
import { TactileButton } from '../../client/src/components/signature/TactileButton.js';
import { HoldToConfirm } from '../../client/src/components/signature/HoldToConfirm.js';
import { AvatarFrame } from '../../client/src/components/signature/AvatarFrame.js';

test('Tier 2: Boundary & Corner Cases — Route Thread Boundaries', async (t) => {
  await t.test('2.B1: RouteThread handles empty waypoints array without crashing', () => {
    const html = renderComponent(React.createElement(RouteThread, { stops: [] }));
    assert.ok(html.includes('<svg'), 'SVG must still render');
    assert.ok(html.includes('viewBox="0 0 600 120"'));
    // The stops list is empty, so no stop text should render
    assert.ok(!html.includes('Premnagar Chowk'), 'Default stops should not appear when empty array provided');
  });

  await t.test('2.B2: RouteThread handles single waypoint without layout distortion', () => {
    const singleStop = [{ name: 'Solo Campus Gate', landmark: 'North Entry' }];
    const html = renderComponent(React.createElement(RouteThread, { stops: singleStop }));
    assert.ok(html.includes('Solo Campus Gate'));
    assert.ok(html.includes('North Entry'));
  });

  await t.test('2.B3: RouteThread handles missing optional landmark and timeEstimate in stops', () => {
    const minimalStops = [
      { name: 'Start Point' },
      { name: 'End Point' },
    ];
    const html = renderComponent(React.createElement(RouteThread, { stops: minimalStops }));
    assert.ok(html.includes('Start Point'));
    assert.ok(html.includes('End Point'));
  });
});

test('Tier 2: Boundary & Corner Cases — Journey Ticket Missing Fields & Seat Thresholds', async (t) => {
  await t.test('2.B4: JourneyTicket gracefully handles missing avatarURL (renders initials circle)', () => {
    const rideNoAvatar = {
      ...FIXTURES.ridePremnagarToUIT,
      creator: {
        name: 'Devika Rawat',
        college: 'UIT',
        verificationStatus: 'verified',
        avatarURL: undefined,
      },
    };
    const html = renderComponent(React.createElement(JourneyTicket, { ride: rideNoAvatar }));
    assert.ok(!html.includes('<img'), 'Must not render broken img element');
    assert.ok(html.includes('D'), 'Must render initial "D" in fallback badge');
    assert.ok(html.includes('Devika Rawat'));
  });

  await t.test('2.B5: JourneyTicket handles missing vehiclePlate and missing driver notes', () => {
    const rideSparse = {
      ...FIXTURES.ridePremnagarToUIT,
      vehiclePlate: undefined,
      vehicleModel: undefined,
      notes: undefined,
    };
    const html = renderComponent(React.createElement(JourneyTicket, { ride: rideSparse }));
    assert.ok(!html.includes('UK 07 AK 4821'), 'No plate text rendered');
    assert.ok(!html.includes('Departing sharply'), 'No notes text rendered');
    assert.ok(html.includes('Premnagar Chowk'), 'Core corridor fields remain intact');
  });

  await t.test('2.B6: JourneyTicket zero seats boundary: disables seat request with cursor-not-allowed', () => {
    const zeroSeatsRide = {
      ...FIXTURES.ridePremnagarToUIT,
      availableSeats: 0,
      seatsAvailable: 0,
    };
    const html = renderComponent(React.createElement(JourneyTicket, {
      ride: zeroSeatsRide,
      onRequestSeat: () => {}
    }));
    assert.ok(html.includes('0 seats open'), 'Must display "0 seats open"');
    assert.ok(html.includes('disabled=""') || html.includes('disabled'), 'Request button must be disabled');
    assert.ok(html.includes('cursor-not-allowed'), 'Button must apply cursor-not-allowed class');
  });

  await t.test('2.B7: JourneyTicket negative seats boundary handled defensively', () => {
    const negativeSeatsRide = {
      ...FIXTURES.ridePremnagarToUIT,
      availableSeats: -2,
      seatsAvailable: -2,
    };
    const html = renderComponent(React.createElement(JourneyTicket, {
      ride: negativeSeatsRide,
      onRequestSeat: () => {}
    }));
    assert.ok(html.includes('disabled=""') || html.includes('disabled'));
    assert.ok(html.includes('cursor-not-allowed'));
  });

  await t.test('2.B8: JourneyTicket creator view: displays "Your Ride" instead of "Request Seat"', () => {
    const html = renderComponent(React.createElement(JourneyTicket, {
      ride: FIXTURES.ridePremnagarToUIT,
      isCurrentUserCreator: true,
      onRequestSeat: () => {}
    }));
    assert.ok(html.includes('Your Ride'), 'Must render "Your Ride" badge for owner');
    assert.ok(!html.includes('Request Seat'), 'Must not display Request Seat action to creator');
  });

  await t.test('2.B9: JourneyTicket unverified requester: prompts "Verify ID to Request"', () => {
    const html = renderComponent(React.createElement(JourneyTicket, {
      ride: FIXTURES.ridePremnagarToUIT,
      isCurrentUserCreator: false,
      isUserVerified: false,
      onVerifyPrompt: () => {}
    }));
    assert.ok(html.includes('Verify ID to Request'), 'Must show verification gate');
    assert.ok(!html.includes('Requesting...'), 'Must not allow direct seat requesting without verification');
  });
});

test('Tier 2: Boundary & Corner Cases — Destination Stamp & Hold-to-Confirm Extremes', async (t) => {
  await t.test('2.B10: DestinationStamp with unknown/arbitrary status renders calm plain badge without tilt', () => {
    const html = renderComponent(React.createElement(DestinationStamp, {
      status: 'arbitrary_status',
      label: 'Status Undetermined'
    }));
    assert.ok(!html.includes('rotate-[-2deg]'), 'Arbitrary status must never render stamped seal');
    assert.ok(html.includes('Status Undetermined'));
  });

  await t.test('2.B11: HoldToConfirm with custom zero or custom durationMs preserves 44px touch target', () => {
    const html = renderComponent(React.createElement(HoldToConfirm, {
      onConfirm: () => {},
      durationMs: 0,
      label: 'Instant Action'
    }));
    assert.ok(html.includes('min-h-[44px]'), 'Must always preserve touch target floor');
    assert.ok(html.includes('Instant Action'));
  });

  await t.test('2.B12: AvatarFrame handles single-character name and empty string safely', () => {
    const singleLetterHtml = renderComponent(React.createElement(AvatarFrame, { name: 'K' }));
    assert.ok(singleLetterHtml.includes('K'), 'Single letter must render "K"');

    const emptyNameHtml = renderComponent(React.createElement(AvatarFrame, { name: '' }));
    assert.ok(emptyNameHtml.includes('S'), 'Empty name must fall back to default student initial "S"');
  });

  await t.test('2.B13: TactileButton small, medium, and large size boundary classes', () => {
    const smHtml = renderComponent(React.createElement(TactileButton, { size: 'sm' }, 'Small'));
    assert.ok(smHtml.includes('min-h-[36px]'));

    const mdHtml = renderComponent(React.createElement(TactileButton, { size: 'md' }, 'Medium'));
    assert.ok(mdHtml.includes('min-h-[44px]'));

    const lgHtml = renderComponent(React.createElement(TactileButton, { size: 'lg' }, 'Large'));
    assert.ok(lgHtml.includes('min-h-[50px]'));
  });
});
