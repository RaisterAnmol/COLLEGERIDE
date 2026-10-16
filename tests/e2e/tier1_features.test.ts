import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { React, renderComponent, FIXTURES } from './helpers.js';

// Master Design System Tokens
import { color, type, spacing, shadow, radius, motion } from '../../client/src/design-system/tokens.js';

// Signature Components
import { RouteThread } from '../../client/src/components/signature/RouteThread.js';
import { JourneyTicket } from '../../client/src/components/signature/JourneyTicket.js';
import { DestinationStamp } from '../../client/src/components/signature/DestinationStamp.js';
import { TactileButton } from '../../client/src/components/signature/TactileButton.js';
import { HoldToConfirm } from '../../client/src/components/signature/HoldToConfirm.js';
import { AvatarFrame } from '../../client/src/components/signature/AvatarFrame.js';

test('Tier 1: Feature Coverage — Campus Atlas Tokens', async (t) => {
  await t.test('1.1: Color tokens adhere to approved Campus Atlas palette', () => {
    // Requirements: Warm Canvas, Deep Route Forest, Signal Amber, Emergency Crimson
    assert.equal(color.brand.primary, '#143D32', 'Deep Campus Green must be #143D32');
    assert.equal(color.brand.primaryHover, '#0F2E26');
    assert.ok(Boolean(color.background.canvas || color.background.base));
    assert.equal(color.status.warning, '#D97706', 'Signal Amber must be #D97706');
    assert.equal(color.status.danger, '#DC2626', 'Emergency Crimson must be #DC2626');
  });

  await t.test('1.2: Typographic scale defines fluid clamp display, h1-h2, body, and mono', () => {
    assert.ok(type.display.includes('clamp'), 'Display type scale must use fluid clamp()');
    assert.ok(type.h1.includes('clamp'), 'H1 type scale must use fluid clamp()');
    assert.ok(type.h2.includes('clamp'), 'H2 type scale must use fluid clamp()');
    assert.equal(type.body, '1rem', 'Body text must be standard 1rem (16px)');
    assert.equal(type.caption, '0.75rem', 'Caption text must be 0.75rem (12px)');
  });

  await t.test('1.3: Spacing scale follows 8px harmonic intervals', () => {
    assert.equal(spacing[1], '4px');
    assert.equal(spacing[2], '8px');
    assert.equal(spacing[3], '12px');
    assert.equal(spacing[4], '16px');
    assert.equal(spacing[6], '24px');
    assert.equal(spacing[8], '32px');
  });

  await t.test('1.4: Radius scale enforces control: 8px or 6px, surface: 16px, pill: 9999px', () => {
    assert.ok(radius.sm === '6px' || radius.md === '10px');
    assert.equal(radius.lg, '16px', 'Surface container radius must be 16px');
    assert.equal(radius.full, '9999px', 'Pill radius must be 9999px');
  });

  await t.test('1.5: CSS variables in tokens.css reflect TypeScript token definitions', () => {
    const cssPath = resolve(process.cwd(), 'client/src/design-system/tokens.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    assert.ok(cssContent.includes('--cr-brand-primary: #143D32'));
    assert.ok(cssContent.includes('--cr-bg-canvas'));
    assert.ok(cssContent.includes('--cr-status-warning'));
  });

  await t.test('1.6: Anti-AI Slop token integrity: zero prohibited purple/violet hexes and bounce easings', () => {
    const tokensJson = JSON.stringify({ color, motion });
    // Banned AI slop colors: #6366f1, #8b5cf6, #a855f7
    assert.ok(!tokensJson.includes('#6366f1'), 'Prohibited indigo #6366f1 found in tokens');
    assert.ok(!tokensJson.includes('#8b5cf6'), 'Prohibited purple #8b5cf6 found in tokens');
    assert.ok(!tokensJson.includes('#a855f7'), 'Prohibited violet #a855f7 found in tokens');
    // Banned bouncy spring overshoot
    assert.ok(!tokensJson.includes('bounce'), 'Bounce easing is prohibited by anti-slop rules');
  });
});

test('Tier 1: Feature Coverage — Route Thread Draw-Once & Waypoints', async (t) => {
  await t.test('2.1: Renders continuous SVG spline path with route-thread-path class', () => {
    const html = renderComponent(React.createElement(RouteThread, {}));
    assert.ok(html.includes('<svg'), 'RouteThread must render an SVG canvas');
    assert.ok(html.includes('viewBox="0 0 600 120"'), 'SVG must use 600x120 aspect ratio');
    assert.ok(html.includes('class="route-thread-path'), 'Active thread must use route-thread-path class');
    assert.ok(html.includes('stroke="var(--route, #143D32)"'), 'Stroke must use deep route forest color');
  });

  await t.test('2.2: Default corridor waypoints match authentic Dehradun transit landmarks', () => {
    const html = renderComponent(React.createElement(RouteThread, {}));
    assert.ok(html.includes('Premnagar Chowk'), 'Origin must be Premnagar Chowk');
    assert.ok(html.includes('Suddhowala Hub'), 'Intermediate stop must include Suddhowala Hub');
    assert.ok(html.includes('Nanda Ki Chowki'), 'Intermediate stop must include Nanda Ki Chowki');
    assert.ok(html.includes('UIT &amp; USCS Gate 1') || html.includes('UIT & USCS Gate 1'), 'Terminus must be UIT Gate 1');
  });

  await t.test('2.3: Waypoint markers feature distinct origin, intermediate stops, and terminus flag', () => {
    const html = renderComponent(React.createElement(RouteThread, {}));
    // Origin at (20, 85)
    assert.ok(html.includes('cx="20" cy="85"'), 'Origin waypoint circle must be at (20, 85)');
    // Terminus at (580, 75)
    assert.ok(html.includes('cx="580" cy="75"'), 'Terminus waypoint circle must be at (580, 75)');
    // Intermediate waypoints
    assert.ok(html.includes('cx="180" cy="65"'), 'Intermediate waypoint 1 at (180, 65)');
    assert.ok(html.includes('cx="380" cy="45"'), 'Intermediate waypoint 2 at (380, 45)');
  });

  await t.test('2.4: Provides accessible region semantics and aria-label', () => {
    const customLabel = 'Premnagar Corridor Line';
    const html = renderComponent(React.createElement(RouteThread, { ariaLabel: customLabel }));
    assert.ok(html.includes('role="region"'), 'RouteThread container must have role="region"');
    assert.ok(html.includes(`aria-label="${customLabel}"`), 'RouteThread must expose accessible aria-label');
  });

  await t.test('2.5: Renders semantic time estimates and landmark descriptions', () => {
    const html = renderComponent(React.createElement(RouteThread, {}));
    assert.ok(html.includes('Market Junction'));
    assert.ok(html.includes('Student PG Quad'));
    assert.ok(html.includes('+6 min'));
    assert.ok(html.includes('+12 min'));
  });

  await t.test('2.6: Accepts and renders custom stops array seamlessly', () => {
    const customStops = [
      { name: 'Clock Tower (Ghanta Ghar)', timeEstimate: 'Start' },
      { name: 'Ballupur Chowk', timeEstimate: '+10 min' },
      { name: 'Premnagar Quad', timeEstimate: 'Arrival' },
    ];
    const html = renderComponent(React.createElement(RouteThread, { stops: customStops }));
    assert.ok(html.includes('Clock Tower (Ghanta Ghar)'));
    assert.ok(html.includes('Ballupur Chowk'));
    assert.ok(html.includes('Premnagar Quad'));
  });
});

test('Tier 1: Feature Coverage — Journey Ticket Masked Notches & Fields', async (t) => {
  await t.test('3.1: Applies .ticket-silhouette mask class for circular side notches and .ticket-wrapper', () => {
    const html = renderComponent(React.createElement(JourneyTicket, { ride: FIXTURES.ridePremnagarToUIT }));
    assert.ok(html.includes('ticket-wrapper'), 'Parent must have ticket-wrapper class for drop-shadow');
    assert.ok(html.includes('ticket-silhouette'), 'Article must have ticket-silhouette class for radial mask');
    assert.ok(html.includes('role="region"'), 'Ticket must have semantic role="region"');
  });

  await t.test('3.2: Displays authentic origin, destination, time, and fuel share fare', () => {
    const html = renderComponent(React.createElement(JourneyTicket, { ride: FIXTURES.ridePremnagarToUIT }));
    assert.ok(html.includes('Premnagar Chowk'), 'Origin text must be rendered');
    assert.ok(html.includes('Uttaranchal University Gate 1'), 'Destination text must be rendered');
    assert.ok(html.includes('₹20'), 'Fuel share fare must render currency symbol and amount');
    assert.ok(html.includes('fuel share'), 'Fuel share label must be displayed');
  });

  await t.test('3.3: Renders driver identity and institution verification badge', () => {
    const html = renderComponent(React.createElement(JourneyTicket, { ride: FIXTURES.ridePremnagarToUIT }));
    assert.ok(html.includes('Aarav Sharma'), 'Driver name must appear');
    assert.ok(html.includes('Uttaranchal University (UIT)'), 'College name must appear');
    assert.ok(html.includes('Computer Science &amp; Engineering') || html.includes('Computer Science & Engineering'));
    assert.ok(html.includes('Verified Institutional Student') || html.includes('lucide-shield-check'));
  });

  await t.test('3.4: Renders open seat count with dynamic pluralization', () => {
    const html1 = renderComponent(React.createElement(JourneyTicket, {
      ride: { ...FIXTURES.ridePremnagarToUIT, availableSeats: 1, seatsAvailable: 1 }
    }));
    assert.ok(html1.includes('1 seat open'), 'Single seat must be singular "1 seat open"');

    const html3 = renderComponent(React.createElement(JourneyTicket, {
      ride: { ...FIXTURES.ridePremnagarToUIT, availableSeats: 3, seatsAvailable: 3 }
    }));
    assert.ok(html3.includes('3 seats open'), 'Multiple seats must be plural "3 seats open"');
  });

  await t.test('3.5: Perforated divider line visually separates corridor and driver sections', () => {
    const html = renderComponent(React.createElement(JourneyTicket, { ride: FIXTURES.ridePremnagarToUIT }));
    assert.ok(html.includes('border-dashed'), 'Perforated divider must have dashed border');
    assert.ok(html.includes('border-line-base'), 'Divider must use line-base token');
  });

  await t.test('3.6: Women-only carpool badge renders conditionally', () => {
    const normalHtml = renderComponent(React.createElement(JourneyTicket, { ride: FIXTURES.ridePremnagarToUIT }));
    assert.ok(!normalHtml.includes('Women-Only Carpool'), 'Normal ride must not show women-only tag');

    const womenRide = { ...FIXTURES.ridePremnagarToUIT, isWomenOnly: true };
    const womenHtml = renderComponent(React.createElement(JourneyTicket, { ride: womenRide }));
    assert.ok(womenHtml.includes('Women-Only Carpool'), 'Women-only ride must render dedicated tag');
  });
});

test('Tier 1: Feature Coverage — Destination Stamp Confirmed Seal', async (t) => {
  await t.test('4.1: Verified status renders stamped seal with -2deg tilt, dashed border, and ShieldCheck', () => {
    const html = renderComponent(React.createElement(DestinationStamp, { status: 'verified', label: 'CAMPUS VERIFIED' }));
    assert.ok(html.includes('rotate-[-2deg]'), 'Verified stamp must have organic -2deg tilt');
    assert.ok(html.includes('border-2 border-dashed border-route'), 'Stamp border must be dashed route forest');
    assert.ok(html.includes('lucide-shield-check'), 'Stamp must include ShieldCheck icon');
    assert.ok(html.includes('CAMPUS VERIFIED'), 'Stamp label must be rendered');
  });

  await t.test('4.2: Confirmed status also renders stamped seal', () => {
    const html = renderComponent(React.createElement(DestinationStamp, { status: 'confirmed', label: 'BOOKING CONFIRMED' }));
    assert.ok(html.includes('rotate-[-2deg]'), 'Confirmed status must trigger stamped seal');
    assert.ok(html.includes('BOOKING CONFIRMED'));
  });

  await t.test('4.3: Pending verification status renders calm plain text badge (Rule R6)', () => {
    const html = renderComponent(React.createElement(DestinationStamp, { status: 'pending', label: 'ID In Review' }));
    assert.ok(!html.includes('rotate-[-2deg]'), 'Pending status MUST NOT render stamped seal');
    assert.ok(html.includes('bg-signal-amber-bg text-signal-amber'), 'Pending status must use signal-amber badge');
    assert.ok(html.includes('ID In Review'), 'Pending label must be rendered');
  });

  await t.test('4.4: Rejected / unverified status renders calm warning badge without stamped seal', () => {
    const html = renderComponent(React.createElement(DestinationStamp, { status: 'rejected', label: 'Verification Incomplete' }));
    assert.ok(!html.includes('rotate-[-2deg]'), 'Rejected status MUST NOT render stamped seal');
    assert.ok(html.includes('text-emergency-crimson'), 'Rejected status must use emergency crimson styling');
    assert.ok(html.includes('Verification Incomplete'));
  });

  await t.test('4.5: Stamp renders optional issued date timestamp', () => {
    const html = renderComponent(React.createElement(DestinationStamp, {
      status: 'verified',
      issuedDate: 'Autumn Term 2026'
    }));
    assert.ok(html.includes('Autumn Term 2026'), 'Issued date text must appear on stamp');
  });

  await t.test('4.6: Stamp includes accessible role="status" and aria-label', () => {
    const html = renderComponent(React.createElement(DestinationStamp, {
      status: 'verified',
      label: 'UIT Verified Student'
    }));
    assert.ok(html.includes('role="status"'), 'Stamp must specify role="status"');
    assert.ok(html.includes('aria-label="UIT Verified Student"'), 'Stamp must have matching aria-label');
  });
});

test('Tier 1: Feature Coverage — Tactile Buttons & 750ms Hold-to-Confirm', async (t) => {
  await t.test('5.1: TactileButton applies mechanical 1-2px depression active:translate-y-[1.5px]', () => {
    const html = renderComponent(React.createElement(TactileButton, { variant: 'primary' }, 'Confirm Ride'));
    assert.ok(html.includes('active:translate-y-[1.5px]'), 'Tactile button must have 1-2px active depression class');
  });

  await t.test('5.2: Medium TactileButton meets touch target floor >= 44px', () => {
    const html = renderComponent(React.createElement(TactileButton, { size: 'md' }, 'Request Seat'));
    assert.ok(html.includes('min-h-[44px]'), 'Button must satisfy 44px touch target minimum');
  });

  await t.test('5.3: TactileButton includes accessible focus ring for keyboard navigation', () => {
    const html = renderComponent(React.createElement(TactileButton, { variant: 'primary' }, 'Submit'));
    assert.ok(html.includes('focus:ring-2'), 'Tactile button must provide focus:ring-2');
    assert.ok(html.includes('focus:ring-offset-2'), 'Tactile button must provide focus:ring-offset');
  });

  await t.test('5.4: TactileButton supports 4 architectural variants', () => {
    const primary = renderComponent(React.createElement(TactileButton, { variant: 'primary' }, 'A'));
    assert.ok(primary.includes('bg-route'));

    const secondary = renderComponent(React.createElement(TactileButton, { variant: 'secondary' }, 'B'));
    assert.ok(secondary.includes('bg-surface text-ink-primary'));

    const danger = renderComponent(React.createElement(TactileButton, { variant: 'danger' }, 'C'));
    assert.ok(danger.includes('bg-emergency-crimson'));

    const quiet = renderComponent(React.createElement(TactileButton, { variant: 'quiet' }, 'D'));
    assert.ok(quiet.includes('bg-transparent'));
  });

  await t.test('5.5: Disabled and loading states suppress depression and show disabled styling', () => {
    const disabledHtml = renderComponent(React.createElement(TactileButton, { disabled: true }, 'Disabled'));
    assert.ok(disabledHtml.includes('disabled=""') || disabledHtml.includes('disabled'));
    assert.ok(disabledHtml.includes('opacity-45 cursor-not-allowed'));
    assert.ok(disabledHtml.includes('active:translate-y-0'));

    const loadingHtml = renderComponent(React.createElement(TactileButton, { isLoading: true }, 'Submit'));
    assert.ok(loadingHtml.includes('Processing...'));
    assert.ok(loadingHtml.includes('animate-spin'));
  });

  await t.test('5.6: HoldToConfirm provides progressbar accessibility semantics', () => {
    const html = renderComponent(React.createElement(HoldToConfirm, {
      onConfirm: () => {},
      label: 'Hold to Cancel Ride'
    }));
    assert.ok(html.includes('role="progressbar"'), 'HoldToConfirm must have role="progressbar"');
    assert.ok(html.includes('aria-valuemin="0"'), 'Progressbar min must be 0');
    assert.ok(html.includes('aria-valuemax="100"'), 'Progressbar max must be 100');
    assert.ok(html.includes('aria-label="Hold to Cancel Ride"'));
  });

  await t.test('5.7: HoldToConfirm renders destructive warning icon and custom labels', () => {
    const html = renderComponent(React.createElement(HoldToConfirm, {
      onConfirm: () => {},
      label: 'Hold to Delete Post',
      confirmingLabel: 'Deleting...'
    }));
    assert.ok(
      html.includes('lucide-alert-triangle') || html.includes('lucide-triangle-alert'),
      'Must render warning icon'
    );
    assert.ok(html.includes('Hold to Delete Post'), 'Must display initial label');
    assert.ok(html.includes('min-h-[44px]'), 'Must satisfy touch target floor >= 44px');
  });
});

test('Tier 1: Feature Coverage — Avatar Frame Grammar (4 Overlay Variants)', async (t) => {
  await t.test('6.1: Plain variant renders clean frame with route dot accent', () => {
    const html = renderComponent(React.createElement(AvatarFrame, { name: 'Priya Sharma', frame: 'plain' }));
    assert.ok(html.includes('rx="16"'), 'Plain frame must have rounded rect rx="16"');
    assert.ok(html.includes('cx="86" cy="14" r="4.5"'), 'Plain frame must feature signature route dot accent at (86, 14)');
  });

  await t.test('6.2: Route variant renders interrupted ring with dasharray and concentric circles', () => {
    const html = renderComponent(React.createElement(AvatarFrame, { name: 'Aarav Kumar', frame: 'route' }));
    assert.ok(html.includes('stroke-dasharray="18 6 40 8"') || html.includes('strokeDasharray="18 6 40 8"'));
    assert.ok(html.includes('cx="88" cy="12"'), 'Route frame must feature concentric waypoint circles at (88, 12)');
  });

  await t.test('6.3: Ticket variant renders dashed ticket border with simulated notches', () => {
    const html = renderComponent(React.createElement(AvatarFrame, { name: 'Kabir Singh', frame: 'ticket' }));
    assert.ok(html.includes('stroke-dasharray="8 5"') || html.includes('strokeDasharray="8 5"'));
    assert.ok(html.includes('cx="50" cy="2"'), 'Ticket frame must feature top simulated notch cutout');
    assert.ok(html.includes('cx="50" cy="98"'), 'Ticket frame must feature bottom simulated notch cutout');
  });

  await t.test('6.4: Milestone variant renders signal-amber border with polygon star node', () => {
    const html = renderComponent(React.createElement(AvatarFrame, { name: 'Bao Mascot', frame: 'milestone' }));
    assert.ok(html.includes('stroke="var(--signal-amber, #D97706)"'));
    assert.ok(html.includes('<polygon points="86,6 89,14 97,14 91,19 93,27 86,22 79,27 81,19 75,14 83,14"'), 'Must render polygon star node');
  });

  await t.test('6.5: Face cropping is square-safe with overflow-hidden and object-cover', () => {
    const html = renderComponent(React.createElement(AvatarFrame, {
      name: 'Priya Sharma',
      src: 'https://example.com/face.jpg'
    }));
    assert.ok(html.includes('rounded-control overflow-hidden'), 'Face container must crop safely');
    assert.ok(html.includes('object-cover'), 'Image must use object-cover to preserve facial proportions');
  });

  await t.test('6.6: Initials fallback renders uppercase initials when no image src is provided', () => {
    const html = renderComponent(React.createElement(AvatarFrame, { name: 'Priya Sharma' }));
    assert.ok(html.includes('PS'), 'Two-word name must render initials "PS"');
    assert.ok(!html.includes('<img'), 'No img element rendered when src is absent');
  });
});

test('Tier 1: Feature Coverage — MotionConfig & Reduced-Motion Enforcement', async (t) => {
  await t.test('7.1: Global App layout enforces MotionConfig reducedMotion="user"', () => {
    const appPath = resolve(process.cwd(), 'client/src/App.tsx');
    const appContent = readFileSync(appPath, 'utf-8');
    assert.ok(
      appContent.includes('<MotionConfig reducedMotion="user">'),
      'App layout must mount <MotionConfig reducedMotion="user"> globally'
    );
  });

  await t.test('7.2: CSS media query resets stroke-dashoffset to 0 !important under reduced motion', () => {
    const indexCssPath = resolve(process.cwd(), 'client/src/index.css');
    const indexCss = readFileSync(indexCssPath, 'utf-8');
    assert.ok(indexCss.includes('@media (prefers-reduced-motion: reduce)'));
    assert.ok(indexCss.includes('stroke-dashoffset: 0 !important;'));
    assert.ok(indexCss.includes('transition: none !important;'));
  });

  await t.test('7.3: Reduced-motion media query clamps animation-duration and transition-duration to 0.001ms', () => {
    const indexCssPath = resolve(process.cwd(), 'client/src/index.css');
    const indexCss = readFileSync(indexCssPath, 'utf-8');
    assert.ok(indexCss.includes('animation-duration: 0.001ms !important;'));
    assert.ok(indexCss.includes('transition-duration: 0.001ms !important;'));
  });

  await t.test('7.4: RouteThread queries prefers-reduced-motion for instant static rendering', () => {
    const rtPath = resolve(process.cwd(), 'client/src/components/signature/RouteThread.tsx');
    const rtContent = readFileSync(rtPath, 'utf-8');
    assert.ok(
      rtContent.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"),
      'RouteThread must check matchMedia prefers-reduced-motion'
    );
    assert.ok(
      rtContent.includes('setIsDrawn(true)'),
      'RouteThread must immediately draw statically under reduced motion'
    );
  });

  await t.test('7.5: Signature components have zero ambient infinite animation loops', () => {
    const components = [
      'RouteThread.tsx',
      'JourneyTicket.tsx',
      'DestinationStamp.tsx',
      'TactileButton.tsx',
      'HoldToConfirm.tsx',
      'AvatarFrame.tsx',
    ];
    for (const comp of components) {
      const p = resolve(process.cwd(), `client/src/components/signature/${comp}`);
      const content = readFileSync(p, 'utf-8');
      assert.ok(!content.includes('animate-pulse'), `${comp} contains prohibited animate-pulse`);
      assert.ok(!content.includes('animate-ping'), `${comp} contains prohibited animate-ping`);
      assert.ok(!content.includes('animate-bounce'), `${comp} contains prohibited animate-bounce`);
      assert.ok(!content.includes('repeat: Infinity'), `${comp} contains prohibited repeat: Infinity`);
    }
  });

  await t.test('7.6: Motion tokens enforce fast, base, slow duration tiers with standard ease-out curves', () => {
    assert.equal(motion.duration.fast, 0.15);
    assert.equal(motion.duration.base, 0.25);
    assert.equal(motion.duration.slow, 0.4);
    assert.deepEqual(motion.ease.out, [0.16, 1, 0.3, 1]);
  });
});
