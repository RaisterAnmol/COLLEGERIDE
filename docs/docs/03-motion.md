# 03 — Motion system

## Principle
Motion explains cause and effect or marks one memorable moment. If it does neither, delete it.

## Hierarchy
| Personality | Where | Feel | Duration |
|---|---|---|---|
| Utility | buttons, menus, form feedback | immediate | 120–220ms |
| Journey | route thread, ticket expand, progress | directional, connected | 280–600ms |
| Celebration | verified stamp, first ride done | expressive, rare | 280–700ms once |

## Setup with Motion (React)
```tsx
import { MotionConfig } from "motion/react";
export const App = () => (
  <MotionConfig reducedMotion="user">{/* routes */}</MotionConfig>
);
```
Verified from motion.dev docs (Oct 2026): `reducedMotion` default is `"never"`; `"user"` follows the OS; when reduced, transform and layout animations are disabled but opacity and colour animations persist. So you must still design what "reduced" looks like: use opacity/colour changes or instant state change, never leave a state change unclear.
`useReducedMotion()` returns a boolean for bespoke decisions.
Check `package.json` React version against Motion's current requirements before install (not verified here).

## CSS fallback
```css
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}
```
Use sparingly; prefer per-effect handling so essential feedback is not erased.

## Easing
Use ease-out style curves (e.g. cubic-bezier(.22,.8,.3,1)). No bounce/elastic. Springs only with high damping and no visible overshoot.

## Performance rules
Animate transform and opacity. Do not animate layout properties on long lists. Cap simultaneous animated elements. Lazy-load Rive/Lottie. Test on a low-end Android device or throttled CPU (state what was used).

## Scroll
No scroll hijack, no forced horizontal scroll, no scroll-snap mandatory. Reveal once, never replay on scroll back. One scroll-linked moment per page at most.

## Allowed signature moments (max one per page)
Route draw (Home) • ticket expand (Search) • stamp land (Verification) • stops snapping onto the thread (Post).

## Forbidden
Infinite loops, parallax on multiple layers, text scramble on every heading, cursor followers, animated gradients, shimmer on non-loading content, animation that delays a form submit.

## Test checklist (must be actually run)
OS reduced-motion on → every signature effect has a clear static equivalent. Keyboard only → all interactive effects reachable. Slow network → no layout jump. 4x CPU throttle → no jank in the signature moment.
