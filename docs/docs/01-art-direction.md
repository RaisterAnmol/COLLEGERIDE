# 01 — Art direction: making it CampusRide, not "a campus app"

Goal: choices that only make sense for Indian student carpooling. This is the main anti-template lever.

## 1. Reconcile with the owner's existing direction
The owner shared a look: green palette, warm beige, panda mascot, illustrated campus backgrounds. Keep it as the starting point, but note the risk: "friendly green + beige + mascot" is itself a common startup pattern. It becomes ownable only through the details below. Decide, in the brief, what is NOT generic about it.
Test: remove the mascot and the logo. Does anything on the page still say "Indian college carpool"? If not, add specificity from section 2.

## 2. Specific material to draw from (pick a few, do not use all)
- Campus architecture: main gate with guard cabin, hostel block with balconies and drying clothes, canteen/chai stall, college bus bay, library steps, sports ground fence, flex banners on boundary walls.
- Vehicles: auto, e-rickshaw, hatchbacks/sedans, scooters, college buses. Keep the CampusRide sedan identical in every image (same shape, plate area, decal position).
- Signage: bilingual boards (English + Hindi or local script), bus-stop poles, route-number plates, painted kerbs. Use real script correctly; have a native reader check any Devanagari/other script text.
- Weather and light: monsoon umbrellas, dusty gold evening, winter morning haze. One lighting mood per illustration set.
- People: backpacks, ID-card lanyards, dupattas/scarves, kurtas with sneakers, helmets. Different heights and builds. Avoid one "default" face.
- Journey objects: bus/train-ticket-like slips (do NOT imitate any real operator's branding or layout), handwritten seat chits, route stamps.
Do not use stereotype shortcuts (monuments as wallpaper, saffron-green everywhere). Be local and ordinary: the gate people actually wait at.

## 3. Palette method (no generator first-result)
1. Collect 10 reference images (campus photos you take, printed tickets, painted signs, street boards). Not other websites.
2. Pull 4–6 colours with an eyedropper. Name them by what they are (e.g. "gate-paint green", "chit paper").
3. Assign roles: ink, paper, route, signal (alerts/CTA), safety (Women-Only accent), neutral.
4. Test contrast (text >= 4.5:1, large text >= 3:1, UI components >= 3:1). Record results.
5. Dark mode is optional. If added, design it separately; do not invert.

## 4. Typography method
- Candidates from Fontshare, Google Fonts, or an indie foundry. Test 3 display + 3 body in the real Home layout at 1440 and 390.
- Roles: display (headlines, tickets), body (UI), data (times, seat counts, route codes; tabular numbers on).
- Check script support if any Hindi/regional text is used in UI (matching weights and metrics).
- Line length < 75ch. Headline scale has a reason (e.g. 1.25 ratio) and fewer sizes than you think.
- Banned: using one family at one weight for everything; accented word in each headline.

## 5. Layout principles
- Asymmetry must serve reading order: the CTA sits where the eye lands after the headline.
- Vary section rhythm: not every section is "heading + 3 cards".
- Real product screens (`/search`, a ticket) appear at honest scale. Cropping is fine; fabricating is not.
- Use the route thread as the page's spine on Home, not as wallpaper.

## 6. Public vs app screens
Public (Home, Colleges, Safety intro): illustration, thread, character, one signature moment.
App (Post, Search, Verification, admin): paper surfaces, strong hierarchy, minimal decoration. Character appears only in empty/success/help states.
Safety page: calm and plain. Never use playful motion around safety, reporting or verification content.

## 7. Per-page bold moment (starting proposals; change them)
Home: route thread draws between two campus landmarks once, as the hero enters.
Search: results are journey tickets; selecting one expands details in place.
Post: a route builder where stops snap onto the thread as the form is filled (visual only; data comes from the form).
Safety: none. Typography and clarity only.
Colleges: a hand-drawn campus index with one landmark per college (only for colleges that actually exist in data).
Verification: a stamp that lands only after the server returns verified.
