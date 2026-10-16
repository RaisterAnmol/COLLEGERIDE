# 06 — Phase plan with gates

Each phase ends with: screenshots in `design-review/phase-N/` (1440 and 390 minimum), `scripts/slop-check.sh` output, `npx impeccable detect` output if installed, HUMAN-CHECK section filled, top 3 problems fixed. If any is missing the phase is incomplete.

| # | Phase | Deliverable | Gate (must be true) |
|---|---|---|---|
| 1 | Repo + browser audit | list of routes, components, tokens in use, states found, baseline screenshots, test commands | no assumptions about features; existing tests run and results recorded |
| 2 | Brief + tokens | filled brief (DESIGN.md §5), CSS variables, Tailwind theme mapping, type setup | brief passes the any-app test; fonts compared in layout; contrast numbers recorded |
| 3 | Signature + art | route thread, ticket, stamp, frames, style sheet, first assets | components render in `/__design`; reduced-motion versions exist; licences logged |
| 4 | Landing | Home page redesigned | one bold moment; works with animation off; real copy only |
| 5 | Student pages | `/search`, `/post`, `/safety`, `/colleges`, `/verification` | functional behaviour unchanged; all states checked with real data |
| 6 | Admin | admin screens | quiet, dense, accessible; no hero styling |
| 7 | Motion + polish | utility/journey/celebration motion applied | each animation maps to an action; keyboard + reduced motion tested |
| 8 | Overall review | HUMAN-CHECK final, three-person template test, final report | owner approves; limitations listed |

## Scope control
Work page by page. Do not restyle everything at once. If a phase reveals a functional bug, report it; do not fix backend behaviour as part of design work unless asked.

## What the agent must not do
Skip screenshots; say "tested" without running; add libraries speculatively; use more animation to hide weak layout; change copy about safety or verification without owner review.
