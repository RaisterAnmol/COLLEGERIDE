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

// Dev Playground Page
import { DesignPlaygroundPage } from '../../client/src/pages/DesignPlaygroundPage.js';

test('Tier 3: Cross-Feature Combinations — Journey Ticket & Avatar Frame', async (t) => {
  await t.test('3.C1: AvatarFrame integrates into driver slot across all 4 frame variants', () => {
    const frames = ['plain', 'route', 'ticket', 'milestone'] as const;
    for (const frame of frames) {
      const avatarEl = React.createElement(AvatarFrame, {
        name: FIXTURES.driverVerified.name,
        src: FIXTURES.driverVerified.avatarURL,
        frame,
        size: 40,
      });

      // Composite layout container simulating card header
      const compositeEl = React.createElement(
        'div',
        { className: 'ticket-driver-profile' },
        avatarEl,
        React.createElement(JourneyTicket, { ride: FIXTURES.ridePremnagarToUIT })
      );

      const html = renderComponent(compositeEl);
      assert.ok(html.includes('ticket-silhouette'), 'Ticket silhouette preserved');
      assert.ok(html.includes('Aarav Sharma'), 'Driver name preserved');
      assert.ok(html.includes('viewBox="0 0 100 100"'), 'Avatar frame SVG rendered');
    }
  });

  await t.test('3.C2: Milestone AvatarFrame paired with top-rated driver in JourneyTicket', () => {
    const avatarEl = React.createElement(AvatarFrame, {
      name: 'Bao Mascot',
      frame: 'milestone',
      size: 44,
    });
    const ticketEl = React.createElement(JourneyTicket, {
      ride: {
        ...FIXTURES.ridePremnagarToUIT,
        creator: { ...FIXTURES.driverVerified, name: 'Bao Mascot' },
      },
    });
    const html = renderComponent(React.createElement('div', {}, avatarEl, ticketEl));
    assert.ok(html.includes('polygon points="86,6 89,14'), 'Milestone star node rendered');
    assert.ok(html.includes('Bao Mascot'), 'Driver name rendered');
  });
});

test('Tier 3: Cross-Feature Combinations — Route Thread Alongside Journey Ticket', async (t) => {
  await t.test('3.C3: Simultaneous presence on corridor search and detail page layouts', () => {
    const searchLayoutEl = React.createElement(
      'section',
      { className: 'corridor-hub-view max-w-5xl mx-auto p-4' },
      React.createElement(RouteThread, { ariaLabel: 'Active Commute Corridor' }),
      React.createElement(
        'div',
        { className: 'ride-passes-grid grid gap-4 mt-6' },
        React.createElement(JourneyTicket, { ride: FIXTURES.ridePremnagarToUIT }),
        React.createElement(JourneyTicket, {
          ride: {
            ...FIXTURES.ridePremnagarToUIT,
            _id: 'ride-prem-uit-102',
            creator: FIXTURES.driverPending,
            fare: 25,
            availableSeats: 2,
          },
        })
      )
    );

    const html = renderComponent(searchLayoutEl);
    assert.ok(html.includes('Active Commute Corridor'), 'RouteThread aria label rendered');
    assert.ok(html.includes('route-thread-path'), 'RouteThread path rendered');
    assert.ok(html.includes('ticket-silhouette'), 'JourneyTicket mask rendered');
    assert.ok(html.includes('₹20'), 'Ride 1 fare rendered');
    assert.ok(html.includes('₹25'), 'Ride 2 fare rendered');
  });
});

test('Tier 3: Cross-Feature Combinations — Destination Stamp with Ride Verification', async (t) => {
  await t.test('3.C4: Verified ride status displays DestinationStamp seal and JourneyTicket verified badge', () => {
    const verifiedComposite = React.createElement(
      'div',
      { className: 'verified-ride-detail space-y-4' },
      React.createElement(DestinationStamp, {
        status: 'verified',
        label: 'CAMPUS ACCREDITED',
        issuedDate: 'Term 2026'
      }),
      React.createElement(JourneyTicket, { ride: FIXTURES.ridePremnagarToUIT })
    );

    const html = renderComponent(verifiedComposite);
    assert.ok(html.includes('rotate-[-2deg]'), 'DestinationStamp has seal tilt');
    assert.ok(html.includes('CAMPUS ACCREDITED'), 'DestinationStamp label rendered');
    assert.ok(html.includes('Verified Institutional Student') || html.includes('lucide-shield-check'));
    assert.ok(html.includes('ticket-silhouette'), 'JourneyTicket rendered in lockstep');
  });

  await t.test('3.C5: Unverified or pending ride displays un-stamped DestinationStamp alongside JourneyTicket', () => {
    const pendingComposite = React.createElement(
      'div',
      { className: 'pending-ride-detail space-y-4' },
      React.createElement(DestinationStamp, {
        status: 'pending',
        label: 'Institutional ID Under Review'
      }),
      React.createElement(JourneyTicket, {
        ride: {
          ...FIXTURES.ridePremnagarToUIT,
          creator: FIXTURES.driverPending
        }
      })
    );

    const html = renderComponent(pendingComposite);
    assert.ok(!html.includes('rotate-[-2deg]'), 'Must NOT contain stamped tilt');
    assert.ok(html.includes('Institutional ID Under Review'), 'Plain pending status displayed');
    assert.ok(html.includes('Priya Nautiyal'), 'Pending driver name displayed');
  });
});

test('Tier 3: Cross-Feature Combinations — Tactile Button & Hold-to-Confirm Nesting', async (t) => {
  await t.test('3.C6: HoldToConfirm and TactileButton co-exist in ride detail cancellation actions', () => {
    const actionPanelEl = React.createElement(
      'div',
      { className: 'ride-actions-panel flex items-center gap-4 p-4 border border-line-base rounded-surface' },
      React.createElement(TactileButton, { variant: 'secondary' }, 'Message Driver'),
      React.createElement(HoldToConfirm, {
        onConfirm: () => {},
        label: 'Hold to Cancel Ride',
        confirmingLabel: 'Cancelling...'
      })
    );

    const html = renderComponent(actionPanelEl);
    assert.ok(html.includes('Message Driver'));
    assert.ok(html.includes('active:translate-y-[1.5px]'), 'TactileButton 1-2px depression present');
    assert.ok(html.includes('role="progressbar"'), 'HoldToConfirm progressbar semantics present');
    assert.ok(html.includes('Hold to Cancel Ride'));
  });
});

test('Tier 3: Cross-Feature Combinations — Design Playground All-Component Integration', async (t) => {
  await t.test('3.C7: DesignPlaygroundPage renders all signature components in one harmonious surface', () => {
    const html = renderComponent(React.createElement(DesignPlaygroundPage, {}));
    assert.ok(html.includes('CampusRide Signature Design Playground'));
    assert.ok(html.includes('RouteThread') || html.includes('route-thread-path'));
    assert.ok(html.includes('ticket-silhouette'));
    assert.ok(html.includes('rotate-[-2deg]'));
    assert.ok(html.includes('Hold to Cancel Ride'));
    assert.ok(html.includes('Bao Mascot'));
  });

  await t.test('3.C8: Theme consistency: Campus Atlas tokens present across combined components', () => {
    const playgroundHtml = renderComponent(React.createElement(DesignPlaygroundPage, {}));
    // Check architectural color classes
    assert.ok(playgroundHtml.includes('bg-canvas'));
    assert.ok(playgroundHtml.includes('text-ink-primary'));
    assert.ok(playgroundHtml.includes('bg-surface'));
    assert.ok(playgroundHtml.includes('border-line-base'));
  });
});
