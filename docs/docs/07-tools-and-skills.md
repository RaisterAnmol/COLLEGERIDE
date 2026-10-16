# 07 — Tools, skills, and where each helps

Verified from public pages in Oct 2026. Counts differ between sources and versions: confirm in the repo before relying on them.

## Agent skills
**Impeccable** (pbakaus/impeccable, impeccable.style, Apache-2.0). A design skill for coding agents built on Anthropic's frontend-design skill. One skill with many sub-commands (sources report 18, 23 or 24 depending on version), design reference files (type, colour, space, motion, interaction, responsive, UX writing), and a deterministic detector `npx impeccable detect` that needs no LLM (sources report 24, 27 or 61 rules depending on version). Install: `npx skills add pbakaus/impeccable`, then `/impeccable teach` (or `init`) once.
 - Useful commands: `critique` (hierarchy/clarity review), `audit`, `polish`, `typeset`, `layout`, `animate`, `harden`, `distill`.
 - Detector: `npx impeccable detect src/` or `--fast --json .`; can scan a URL (needs Puppeteer).
 - Conflict warning: Impeccable also reads/writes `PRODUCT.md` and `DESIGN.md` (its `document` command writes a DESIGN.md in Google Stitch format). Back up this DESIGN.md first (`cp DESIGN.md CAMPUSRIDE-DESIGN.md`). Never run `document` over it without a backup; merge instead.
 - Limits: opinionated, may not fit every brand; it improves taste, it does not guarantee originality.
**Anthropic frontend-design skill**: palette/type/layout intent and a list of defaults to avoid; Impeccable extends it.
**GSAP official skills** (greensock/gsap-skills): only if you adopt GSAP.
**Karpathy-style guidelines** (several forks of "andrej-karpathy-skills"): a CLAUDE.md with rules on think-first, simplicity, surgical changes, verifiable goals. Helps code discipline, not visual taste. Your Instagram hashtag link is not a source; use the GitHub repo you trust and read it before adopting.

## Component sources (raw material, not identity)
- Motion Primitives (ibelick/motion-primitives): MIT, Motion + Tailwind. Beware same-name lookalike repos.
- Watermelon UI (ui.watermelon.sh): MIT, React + Tailwind + Radix + Motion; large catalogue (counts disagree between sources).
- Magic UI, React Bits: copy-paste effects. Check licence per component. These effects are widely reused across sites, so they make a page look generic when used as-is; use sparingly and restyle.
- dqnamo Kitchen: study only; no licence seen.
Rule: functional foundations may be reused; creative effects borrowed selectively; signature pieces built by you.

## Art and shape tools
Figma/Inkscape (draw), Haikei (SVG blobs/waves; terms of use not verified, read them), DiceBear (avatars, see `04`), Open Peeps (CC0 parts).

## Inspiration (method, not templates)
Godly, Awwwards, SiteInspire, Admire The Web, Land-book, plus real-world references (tickets, signboards, campus photos). Save 10 screenshots, write what you like in words (rhythm, material, transition), then design something different. Awwwards listings show award dates and categories (Art & Illustration, Interaction) but I did not extract any single "best" site: judge by whether it is a product that works, not a showcase.

## Review tools
Browser DevTools (reduced-motion emulation, CPU throttle), Lighthouse/axe for accessibility, Playwright screenshots for evidence, Vercel Web Interface Guidelines as a checklist (named in the pasted review; I did not open it, verify first).
