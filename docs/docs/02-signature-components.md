# 02 — Signature components (build original; principles borrowed, code written fresh)

Studied principles from dqnamo's Kitchen (tactile button, magnetic drop zone, ticket silhouette, stamp frame, hold-to-confirm, signature draw). No licence was found on those pages: do not copy their code. Rebuild from the description of the behaviour.

## A. Route thread
Purpose: brand spine. Shape: pick one personality in the brief (e.g. long soft curves with one sharp turn at the gate).
Implementation (CSS-only draw, no library):
```html
<svg viewBox="0 0 600 160" role="img" aria-label="Route from Hostel Gate to Main Block">
  <path class="thread" pathLength="1" d="M10 130 C120 20, 240 150, 360 70 S 520 30, 590 90"/>
  <circle class="stop" cx="10" cy="130" r="6"/><circle class="stop" cx="590" cy="90" r="6"/>
</svg>
```
```css
.thread{fill:none;stroke:var(--route);stroke-width:3;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1}
.thread.is-drawn{stroke-dashoffset:0;transition:stroke-dashoffset 900ms cubic-bezier(.22,.8,.3,1)}
@media (prefers-reduced-motion:reduce){.thread{stroke-dashoffset:0;transition:none}}
```
Trigger `.is-drawn` once with IntersectionObserver (or Motion `useInView({once:true})`). Static fallback = fully drawn.
Rules: draws once; never loops; labels are real place names from data when it shows data, otherwise decorative with `aria-hidden`.
Do not present it as a live map or imply live location.

## B. Journey ticket (real ride data only)
Fields from the actual ride model only. Do not invent serial numbers; if a code is shown it must be a real field.
Notched edge via mask (shadow must go on the parent with `filter: drop-shadow`, because mask clips box-shadow):
```css
.ticket{--r:10px;
  mask:radial-gradient(circle var(--r) at 0 50%,#0000 98%,#000) left/51% 100% no-repeat,
       radial-gradient(circle var(--r) at 100% 50%,#0000 98%,#000) right/51% 100% no-repeat}
.ticket-wrap{filter:drop-shadow(0 1px 0 var(--ink-12)) drop-shadow(0 6px 10px var(--ink-08))}
```
Interaction: focus/hover reveals detail; a small tilt is allowed only for `(hover:hover) and (pointer:fine)` and no reduced motion. Keyboard activation must work with Enter/Space and expose `aria-expanded`.
Do not put the ticket shape on generic cards.

## C. Destination stamp
Renders only when `status === "verified"|"confirmed"` came from the server response. Pending/failed show plain status text.
Motion: 280–360ms scale 1.12→1 plus 2° settle, ease-out, once. Reduced motion: appears without movement.
Add `role="status"` text such as "Verified" so screen readers get the result.

## D. Frames (one grammar, four variants)
Shared grammar: same stroke weight, same corner logic, same route-dot motif. Frames are overlay SVG components separate from the identity image:
```tsx
<Avatar identity={student.avatar} expression="neutral" frame="route" size={56} />
```
Variants: `plain` (thin ring with one route dot), `route` (ring broken by a small thread curve), `ticket` (notched/perforated edge), `milestone` (awarded after a real milestone from data, e.g. first completed ride).
Perforated edge: mask with repeating radial-gradient holes. Provide a square-safe crop so faces are never clipped.
Never invent milestones. A frame appears only if the backend has the data to justify it.

## E. Magnetic upload zone (verification documents, if uploads exist)
On `dragenter` the zone grows slightly and a marker moves toward the cursor; on `drop` it hands the file to the existing upload logic. Validation, size limits, virus scan, and success all come from the real flow. Provide a normal `<input type="file">` fallback and visible focus.

## F. Hold-to-confirm (destructive actions only)
Cancel ride, delete post. Fill while held (min ~700ms), release cancels. Keyboard: hold Space/Enter, or a normal confirm dialog fallback. Announce progress to assistive tech. Undo window only if the backend supports undo.

## G. Tactile button
Press state moves 1–2px with a firm edge; 120–160ms. Same component for all primary buttons. Disabled state is visibly different without relying on colour alone.

## H. States playground (dev-only route)
Route `/__design` excluded from production builds showing buttons, tickets, frames, stamps, loading/empty/error states, and each motion at utility/journey/celebration. Used for screenshot review. Remove or guard before release.
