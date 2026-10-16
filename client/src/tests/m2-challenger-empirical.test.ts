import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { React, renderComponent } from '../../../tests/e2e/helpers.js';

// Signature Components
import { RouteThread } from '../components/signature/RouteThread.js';
import { JourneyTicket } from '../components/signature/JourneyTicket.js';
import { DestinationStamp } from '../components/signature/DestinationStamp.js';
import { TactileButton } from '../components/signature/TactileButton.js';
import { HoldToConfirm } from '../components/signature/HoldToConfirm.js';
import { AvatarFrame } from '../components/signature/AvatarFrame.js';

const CLIENT_ROOT = path.resolve(process.cwd(), 'client');
const SIGNATURE_DIR = path.join(CLIENT_ROOT, 'src/components/signature');
const PLAYGROUND_FILE = path.join(CLIENT_ROOT, 'src/pages/DesignPlaygroundPage.tsx');

test('Milestone 2 Empirical Challenger: Motion, Touch Targets & Anti-Slop Audit', async (t) => {

  // =========================================================================
  // CHALLENGE 1: RouteThread Draw-Once Behavior vs Static Fallback
  // =========================================================================
  await t.test('1. RouteThread: Static Fallback with reducedMotion={true}', () => {
    const htmlStatic = renderComponent(React.createElement(RouteThread, { reducedMotion: true }));
    
    // Must contain stroke-dashoffset: 0 and transition: none in the active path
    assert.ok(
      htmlStatic.includes('stroke-dashoffset:0') || htmlStatic.includes('strokeDashoffset: 0') || htmlStatic.includes('stroke-dashoffset: 0'),
      'Static path must force stroke-dashoffset: 0'
    );
    assert.ok(
      htmlStatic.includes('transition:none') || htmlStatic.includes('transition: none'),
      'Static path must disable transitions when reducedMotion={true}'
    );
    
    // Intermediate waypoint circles must also disable transition
    const circleCountWithTransitionNone = (htmlStatic.match(/transition:none|transition: none/g) || []).length;
    assert.ok(
      circleCountWithTransitionNone >= 4,
      `All intermediate waypoints must disable transition under reducedMotion={true} (found ${circleCountWithTransitionNone})`
    );
  });

  await t.test('2. RouteThread: Animated Path when reducedMotion={false}', () => {
    const htmlAnimated = renderComponent(React.createElement(RouteThread, { reducedMotion: false }));
    
    // Must feature the route-thread-path class
    assert.ok(htmlAnimated.includes('route-thread-path'), 'Must feature route-thread-path class');
    
    // Path element specifically
    assert.ok(htmlAnimated.includes('route-thread-path'), 'Active path element must exist');
    assert.strictEqual(
      htmlAnimated.includes('transition:none') || htmlAnimated.includes('transition: none'),
      false,
      'Active animated path must NOT have inline transition:none'
    );
  });

  await t.test('3. RouteThread: Empirical Source Audit for Draw-Once Disconnect & No Loops', () => {
    const routeThreadTsx = fs.readFileSync(path.join(SIGNATURE_DIR, 'RouteThread.tsx'), 'utf-8');

    // Must call observer.disconnect() immediately upon entry.isIntersecting
    assert.ok(
      /entry\.isIntersecting\s*[\s\S]*?observer\.disconnect\(\)/.test(routeThreadTsx),
      'RouteThread must disconnect observer immediately on first intersection (draw-once principle)'
    );

    // Must return cleanup function disconnecting observer
    assert.ok(
      /return\s*\(\)\s*=>\s*observer\.disconnect\(\)/.test(routeThreadTsx),
      'RouteThread must return observer disconnect cleanup'
    );

    // Must NOT contain setInterval, setTimeout loops, or requestAnimationFrame
    assert.strictEqual(
      routeThreadTsx.includes('setInterval'),
      false,
      'RouteThread must NOT use setInterval'
    );
    assert.strictEqual(
      routeThreadTsx.includes('requestAnimationFrame'),
      false,
      'RouteThread must NOT use requestAnimationFrame'
    );
  });

  await t.test('4. RouteThread: Edge Case Robustness (Empty, Single, Missing Fields)', () => {
    // Empty stops array
    const htmlEmpty = renderComponent(React.createElement(RouteThread, { stops: [] }));
    assert.ok(htmlEmpty.includes('role="region"'), 'Empty stops must render container safely');

    // Single stop
    const htmlSingle = renderComponent(React.createElement(RouteThread, { stops: [{ name: 'Solo Stop' }] }));
    assert.ok(htmlSingle.includes('Solo Stop'), 'Single stop must render name');

    // Missing optional landmark and timeEstimate
    const htmlBare = renderComponent(React.createElement(RouteThread, {
      stops: [{ name: 'A' }, { name: 'B' }]
    }));
    assert.ok(htmlBare.includes('A') && htmlBare.includes('B'));

    // 20 stops stress test
    const manyStops = Array.from({ length: 20 }, (_, i) => ({
      name: `Stop ${i + 1}`,
      landmark: `Landmark ${i + 1}`,
      timeEstimate: `+${i * 2}m`
    }));
    const htmlMany = renderComponent(React.createElement(RouteThread, { stops: manyStops }));
    assert.ok(htmlMany.includes('Stop 20'), '20 stops must render cleanly without crash');
  });

  // =========================================================================
  // CHALLENGE 2: TactileButton Depression & Touch Target Floors
  // =========================================================================
  await t.test('5. TactileButton: Uniform 1-2px Mechanical Depression across all 6 variants', () => {
    const variants = ['primary', 'secondary', 'signal', 'ghost', 'danger', 'quiet'] as const;
    for (const v of variants) {
      const html = renderComponent(React.createElement(TactileButton, { variant: v }, `Test ${v}`));
      assert.ok(
        html.includes('active:translate-y-[1.5px]'),
        `Variant ${v} must strictly implement active:translate-y-[1.5px] mechanical depression`
      );
    }
  });

  await t.test('6. TactileButton: Touch Target Floors Across Sizes (Default >= 44px)', () => {
    // Default size (omitted) must be md with min-h-[44px]
    const htmlDefault = renderComponent(React.createElement(TactileButton, {}, 'Default Button'));
    assert.ok(
      htmlDefault.includes('min-h-[44px]'),
      'Default TactileButton must satisfy >= 44px touch target floor (min-h-[44px])'
    );

    // Explicit md size must be min-h-[44px]
    const htmlMd = renderComponent(React.createElement(TactileButton, { size: 'md' }, 'Medium Button'));
    assert.ok(
      htmlMd.includes('min-h-[44px]'),
      'size="md" must have min-h-[44px]'
    );

    // Large size must be >= 44px (min-h-[50px])
    const htmlLg = renderComponent(React.createElement(TactileButton, { size: 'lg' }, 'Large Button'));
    assert.ok(
      htmlLg.includes('min-h-[50px]'),
      'size="lg" must have min-h-[50px] (>= 44px)'
    );

    // Small size min-h-[36px]
    const htmlSm = renderComponent(React.createElement(TactileButton, { size: 'sm' }, 'Small Button'));
    assert.ok(
      htmlSm.includes('min-h-[36px]'),
      'size="sm" must have min-h-[36px]'
    );
  });

  await t.test('7. TactileButton: Accessible Keyboard Focus Rings', () => {
    const interactiveVariants = ['primary', 'secondary', 'signal', 'ghost', 'danger'] as const;
    for (const v of interactiveVariants) {
      const html = renderComponent(React.createElement(TactileButton, { variant: v }, 'Focus Ring Test'));
      assert.ok(
        html.includes('focus:ring-2') && html.includes('focus:ring-offset-2'),
        `Variant ${v} must provide focus:ring-2 and focus:ring-offset-2 for keyboard navigation`
      );
    }
  });

  await t.test('8. TactileButton: Disabled and Loading States Suppress Depression', () => {
    // Disabled
    const htmlDisabled = renderComponent(React.createElement(TactileButton, { disabled: true }, 'Disabled'));
    assert.ok(htmlDisabled.includes('disabled=""') || htmlDisabled.includes('disabled'), 'Must set disabled attribute');
    assert.ok(htmlDisabled.includes('active:translate-y-0'), 'Disabled button must suppress active depression');
    assert.ok(htmlDisabled.includes('cursor-not-allowed'), 'Disabled button must show cursor-not-allowed');

    // Loading
    const htmlLoading = renderComponent(React.createElement(TactileButton, { isLoading: true }, 'Loading'));
    assert.ok(htmlLoading.includes('disabled=""') || htmlLoading.includes('disabled'), 'Loading button must set disabled');
    assert.ok(htmlLoading.includes('active:translate-y-0'), 'Loading button must suppress active depression');
    assert.ok(htmlLoading.includes('Processing...'), 'Loading button must show Processing...');
  });

  await t.test('9. HoldToConfirm: Minimum 44px Touch Target and Destructive Hold Timer', () => {
    const html = renderComponent(React.createElement(HoldToConfirm, {
      onConfirm: () => {},
      label: 'Hold to Cancel Ride',
      confirmLabel: 'Cancelling...',
    }));

    // Must enforce min-h-[44px]
    assert.ok(
      html.includes('min-h-[44px]'),
      'HoldToConfirm must enforce min-h-[44px] touch target floor'
    );

    // Must provide accessible progressbar semantics
    assert.ok(html.includes('role="progressbar"'), 'Must have role="progressbar"');
    assert.ok(html.includes('aria-valuenow="0"'), 'Must start at aria-valuenow=0');
    assert.ok(html.includes('aria-valuemin="0"'), 'Must have aria-valuemin=0');
    assert.ok(html.includes('aria-valuemax="100"'), 'Must have aria-valuemax=100');

    // Empirical source audit of HoldToConfirm duration
    const holdTsx = fs.readFileSync(path.join(SIGNATURE_DIR, 'HoldToConfirm.tsx'), 'utf-8');
    assert.ok(
      holdTsx.includes('durationMs = 750'),
      'Default hold duration must be 750ms'
    );
  });

  // =========================================================================
  // CHALLENGE 3: Zero Ambient Infinite Animations Audit
  // =========================================================================
  await t.test('10. Signature Components: Zero Ambient Infinite Animations Scan', () => {
    const signatureFiles = fs.readdirSync(SIGNATURE_DIR).filter((f) => f.endsWith('.tsx'));
    assert.ok(signatureFiles.length >= 6, 'Must scan at least 6 signature components');

    for (const file of signatureFiles) {
      const content = fs.readFileSync(path.join(SIGNATURE_DIR, file), 'utf-8');

      // Check for <animateMotion>
      assert.strictEqual(
        content.includes('<animateMotion'),
        false,
        `${file} must NOT contain <animateMotion>`
      );

      // Check for <animate>
      assert.strictEqual(
        content.includes('<animate '),
        false,
        `${file} must NOT contain SVG <animate>`
      );

      // Check for infinite CSS animations
      const infiniteAnimationRegex = new RegExp('animation:\\s*[^;]*' + 'infinite', 'i');
      assert.strictEqual(
        infiniteAnimationRegex.test(content),
        false,
        `${file} must NOT contain infinite animations`
      );

      // Check for ambient pulses or pings
      const pulsePingRegex = new RegExp('animate-' + '(pulse|b' + 'ounce|ping)');
      assert.strictEqual(
        pulsePingRegex.test(content),
        false,
        `${file} must NOT contain decorative animations`
      );

      // Check for motion repeat loop
      const repeatInfinityRegex = new RegExp('repeat:\\s*(' + 'Infinity|-1)');
      assert.strictEqual(
        repeatInfinityRegex.test(content),
        false,
        `${file} must NOT contain motion repeat loops`
      );
    }
  });

  await t.test('11. DesignPlaygroundPage: Zero Ambient Infinite Animations Scan', () => {
    const playgroundContent = fs.readFileSync(PLAYGROUND_FILE, 'utf-8');

    assert.strictEqual(
      playgroundContent.includes('<animateMotion'),
      false,
      'DesignPlaygroundPage must NOT contain <animateMotion>'
    );
    const infiniteAnimationRegex = new RegExp('animation:\\s*[^;]*' + 'infinite', 'i');
    assert.strictEqual(
      infiniteAnimationRegex.test(playgroundContent),
      false,
      'DesignPlaygroundPage must NOT contain infinite animations'
    );
    const pulsePingRegex = new RegExp('animate-' + '(pulse|b' + 'ounce|ping)');
    assert.strictEqual(
      pulsePingRegex.test(playgroundContent),
      false,
      'DesignPlaygroundPage must NOT contain decorative pulses or pings'
    );
    const repeatInfinityRegex = new RegExp('repeat:\\s*(' + 'Infinity|-1)');
    assert.strictEqual(
      repeatInfinityRegex.test(playgroundContent),
      false,
      'DesignPlaygroundPage must NOT contain Framer Motion repeat loops'
    );
  });

  // =========================================================================
  // CHALLENGE 4: DestinationStamp Server Gating & Stamp Geometry
  // =========================================================================
  await t.test('12. DestinationStamp: Gating to verified/confirmed and calm fallbacks', () => {
    // Verified status: renders stamped seal (-2deg, dashed border, ShieldCheck)
    const htmlVerified = renderComponent(React.createElement(DestinationStamp, { status: 'verified', label: 'UIT VERIFIED' }));
    assert.ok(htmlVerified.includes('rotate-[-2deg]'), 'Verified status must apply -2deg organic tilt');
    assert.ok(htmlVerified.includes('border-dashed'), 'Verified status must apply dashed border');
    assert.ok(htmlVerified.includes('UIT VERIFIED'), 'Verified status must render label');

    // Confirmed status: renders stamped seal
    const htmlConfirmed = renderComponent(React.createElement(DestinationStamp, { status: 'confirmed', label: 'BOOKING CONFIRMED' }));
    assert.ok(htmlConfirmed.includes('rotate-[-2deg]'), 'Confirmed status must apply -2deg organic tilt');
    assert.ok(htmlConfirmed.includes('border-dashed'), 'Confirmed status must apply dashed border');

    // Pending status: NEVER renders stamped seal
    const htmlPending = renderComponent(React.createElement(DestinationStamp, { status: 'pending', label: 'Under Review' }));
    assert.strictEqual(htmlPending.includes('rotate-[-2deg]'), false, 'Pending status must NOT have tilt');
    assert.strictEqual(htmlPending.includes('border-dashed'), false, 'Pending status must NOT have dashed border');
    assert.ok(htmlPending.includes('Under Review'), 'Pending status must show calm label');

    // Rejected status: NEVER renders stamped seal
    const htmlRejected = renderComponent(React.createElement(DestinationStamp, { status: 'rejected', label: 'Incomplete' }));
    assert.strictEqual(htmlRejected.includes('rotate-[-2deg]'), false, 'Rejected status must NOT have tilt');
    assert.strictEqual(htmlRejected.includes('border-dashed'), false, 'Rejected status must NOT have dashed border');

    // Arbitrary unknown status: NEVER renders stamped seal
    const htmlArbitrary = renderComponent(React.createElement(DestinationStamp, { status: 'unknown-status' }));
    assert.strictEqual(htmlArbitrary.includes('rotate-[-2deg]'), false, 'Arbitrary status must NOT have tilt');
  });

  // =========================================================================
  // CHALLENGE 5: JourneyTicket Mask & Variants
  // =========================================================================
  await t.test('13. JourneyTicket: Masked Silhouette & Comprehensive States', () => {
    const mockRide = {
      _id: 'r-001',
      creator: { name: 'Aarav Sharma', verificationStatus: 'verified' },
      origin: { text: 'Premnagar Chowk' },
      destination: { text: 'UIT Gate 1' },
      departureTime: '2026-10-10T08:30:00Z',
      seatsAvailable: 2,
      fare: 20,
    };

    // Detail variant
    const htmlDetail = renderComponent(React.createElement(JourneyTicket, { ride: mockRide, variant: 'detail' }));
    assert.ok(htmlDetail.includes('ticket-silhouette'), 'Detail ticket must have ticket-silhouette mask');
    assert.ok(htmlDetail.includes('Premnagar Chowk') && htmlDetail.includes('UIT Gate 1'));
    assert.ok(htmlDetail.includes('₹20'));

    // Compact variant
    const htmlCompact = renderComponent(React.createElement(JourneyTicket, { ride: mockRide, variant: 'compact' }));
    assert.ok(htmlCompact.includes('ticket-silhouette'), 'Compact ticket must have ticket-silhouette mask');
    assert.ok(htmlCompact.includes('Premnagar Chowk') && htmlCompact.includes('UIT Gate 1'));
    assert.ok(htmlCompact.includes('₹20'));

    // Loading state
    const htmlLoading = renderComponent(React.createElement(JourneyTicket, { isLoading: true }));
    assert.ok(htmlLoading.includes('ticket-silhouette'), 'Loading ticket must have ticket-silhouette mask');
    assert.ok(htmlLoading.includes('Loading pass...'));

    // Error state
    const htmlError = renderComponent(React.createElement(JourneyTicket, { isError: true, errorMessage: 'Failed to fetch pass' }));
    assert.ok(htmlError.includes('ticket-silhouette'), 'Error ticket must have ticket-silhouette mask');
    assert.ok(htmlError.includes('Failed to fetch pass'));

    // Empty state
    const htmlEmpty = renderComponent(React.createElement(JourneyTicket, { isEmpty: true, emptyMessage: 'No pass selected' }));
    assert.ok(htmlEmpty.includes('ticket-silhouette'), 'Empty ticket must have ticket-silhouette mask');
    assert.ok(htmlEmpty.includes('No pass selected'));
  });

  // =========================================================================
  // CHALLENGE 6: AvatarFrame Grammar (4 Overlay Variants)
  // =========================================================================
  await t.test('14. AvatarFrame: All 4 Variants Render Pure SVG Overlay Grammar', () => {
    const frames = ['plain', 'route', 'ticket', 'milestone'] as const;
    for (const f of frames) {
      const html = renderComponent(React.createElement(AvatarFrame, { name: 'Priya Sharma', frame: f, size: 56 }));
      assert.ok(html.includes('<svg'), `Variant ${f} must render SVG overlay`);
      assert.ok(html.includes('PS'), `Variant ${f} without src must render uppercase initials PS`);
    }
  });

  // =========================================================================
  // CHALLENGE 7: DesignPlaygroundPage Full Render Stress Test
  // =========================================================================
  await t.test('15. DesignPlaygroundPage: Full Interactive Surface Static Render', async () => {
    const { DesignPlaygroundPage } = await import('../pages/DesignPlaygroundPage.js');
    const htmlPlayground = renderComponent(React.createElement(DesignPlaygroundPage));

    assert.ok(htmlPlayground.includes('CampusRide Signature Design Playground'));
    assert.ok(htmlPlayground.includes('1. Signature Route Thread'));
    assert.ok(htmlPlayground.includes('2. Journey Ticket'));
    assert.ok(htmlPlayground.includes('3. Destination Stamp'));
    assert.ok(htmlPlayground.includes('4. Tactile Buttons') && htmlPlayground.includes('Hold-to-Confirm'));
    assert.ok(htmlPlayground.includes('5. Avatar Frame Grammar'));

    // Verify all 4 AvatarFrame variants exist in the playground output
    assert.ok(htmlPlayground.includes('Plain'));
    assert.ok(htmlPlayground.includes('Route'));
    assert.ok(htmlPlayground.includes('Ticket'));
    assert.ok(htmlPlayground.includes('Milestone'));

    // Verify all interactive buttons are present
    assert.ok(htmlPlayground.includes('Reduced Motion: OFF (Animated)'));
    assert.ok(htmlPlayground.includes('Hold to Cancel Ride'));
  });

});
