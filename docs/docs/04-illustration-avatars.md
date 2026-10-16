# 04 — Illustration, mascot, avatars

## 1. The biggest "AI tell" on this project
If the hero/banner images come from an image generator, they are the highest-risk element: small inconsistencies (car shape, plates, hands, text, shadows) between images read as generated even when each image looks good alone. Pick a pipeline that removes that risk:
- Best: a hired illustrator or the owner draws a style sheet (palette, line weight, 3 characters, the sedan, the panda) and every scene is built from it.
- Good: generate only rough concepts, then redraw as vector (Figma/Inkscape) with one shared character/vehicle library. Ship the redrawn version.
- Minimum: freeze one master "character sheet" + one "vehicle sheet", reuse them as references, remove all text from images (set text in HTML), crop for consistency, and review every image at 100% for artefacts.
Never ship an image with garbled text, mismatched wheels, extra fingers, or a different sedan design from the rest of the site.

## 2. Style sheet (create before illustrating)
Line: weight + end caps. Fill: flat / grain / gradient (pick one). Shadow rule. Palette (from `01`). Eye style, nose style, hair rules. Proportions (head:body). Min stroke at 390px. Export SVG where possible; raster only for complex scenes (WebP/AVIF with width/height).

## 3. Character family
Three students with different silhouettes (height, build, bag, headwear/hair), one driver/owner figure if the product needs it, the mascot. Four to five poses: waiting, walking, in-car, celebrating (rare), puzzled/help. Reuse across empty states, onboarding, 404, success.
Mascot (panda): one master drawing; expressions limited to 4. Do not use a stock panda; ensure shapes are your own. Mascot appears at most once per screen.

## 4. Avatars: identity + frame + expression (separate layers)
Where to get identity art:
| Source | Licence (verified Oct 2026) | Use |
|---|---|---|
| DiceBear core | MIT; **each style has its own licence** | generator code only |
| DiceBear CC0 styles: Lorelei, Notionists, Open Peeps, Pixel Art, Identicon, Initials, Rings, Shapes, Thumbs, Glass | CC0 1.0 | usable commercially, no credit; still recognisable, so redraw/recolour |
| DiceBear CC BY 4.0 styles: Adventurer, Big Ears, Big Smile, Croodles, Dylan, Micah, Miniavs, Personas, ToonHead, Fun Emoji | CC BY 4.0 | needs visible credit to designer |
| Avataaars | free for personal and commercial | very recognisable, avoid |
| DiceBear 10.6 new "handmade" styles | DiceBear originals, CC0 | worth testing; style count is now 55 and changes, never hard-code it |
| Open Peeps (Pablo Stanley) | CC0 | modular SVG parts to recombine |
Recommended for CampusRide: default user avatars = initials or a simple custom set drawn in your style sheet (low risk, consistent); optional "choose a character" from your own family; DiceBear only as a seed-based fallback in a CC0 style that you recolour to your palette.
Privacy: do not send user names/emails as seeds to a third-party hosted DiceBear API. Self-host the library or use an opaque id.
Keep a `CREDITS.md` for every third-party asset.

## 5. Component contract
```tsx
type AvatarProps = {identity: string; frame: "plain"|"route"|"ticket"|"milestone"; expression?: "neutral"|"happy"|"help"; size: number; alt: string}
```
Frames never crop the face; alt text names the person; decorative frames are `aria-hidden`.

## 6. Asset checklist (initial set only)
1 hero scene • 3 characters × 4–5 poses • mascot (4 expressions) • sedan (side + 3/4) • 3 empty states • 1 route-map illustration • 4 frames • 3 stamps (verified, completed, safe-arrival only if data exists) • landmark icons for real campus types.
