#!/usr/bin/env bash
# Rough grep for common generated-UI tells. Cannot judge taste. Usage: ./slop-check.sh src
TARGETS=("$@")
if [ ${#TARGETS[@]} -eq 0 ]; then
  TARGETS=(".")
fi
INC=(--include=*.css --include=*.scss --include=*.tsx --include=*.jsx --include=*.html --include=*.ts --include=*.js)
EXC=(--exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build --exclude-dir=.next --exclude-dir=design-review)
n=0
chk(){ local label="$1" pat="$2" out
  out=$(grep -rniE "${INC[@]}" "${EXC[@]}" -e "$pat" "${TARGETS[@]}" 2>/dev/null | head -5)
  if [ -n "$out" ]; then echo "WARN: $label"; echo "$out" | sed 's/^/   /'; n=$((n+1)); fi; }
chk "bounce/elastic easing" 'ease-bounce|elastic|bounce|cubic-bezier\(([^)]*,){2}[^)]*(1\.[3-9]|[2-9]\.)'
chk "purple/indigo/violet gradient" 'from-(purple|violet|indigo|fuchsia)-[0-9]+|to-(purple|violet|indigo|fuchsia)-[0-9]+|#6366f1|#8b5cf6|#a855f7'
chk "uppercase + tracking (eyebrow)" 'uppercase[^"'"'"']*tracking-(wide|wider|widest)|tracking-(wide|wider|widest)[^"'"'"']*uppercase'
chk "infinite decorative animation" 'animation:[^;]*infinite|animate-(pulse|bounce|spin|ping)|repeat: *Infinity|repeat: *-1'
chk "backdrop blur (glassmorphism)" 'backdrop-(blur|filter)'
chk "generic font only" "font-family:[[:space:]]*['\"]?(Inter|Roboto|Arial|Helvetica|system-ui)"
chk "custom cursor / cursor none" 'cursor:[[:space:]]*none|cursor-none'
chk "scroll hijack" 'scroll-snap-type:[[:space:]]*y[[:space:]]+mandatory|wheel[^;]*preventDefault'
chk "filler copy" 'lorem ipsum|seamless|effortless|revolutioni[sz]e|unlock the|supercharge|cutting-edge|next-gen'
chk "numbered markers (check not a real sequence)" '>[[:space:]]*0[1-9][[:space:]]*<'
chk "blanket hover lift" 'hover:-translate-y|hover:scale-1(0[5-9]|[1-9][0-9])'
chk "glow shadows" 'shadow-(purple|indigo|violet|blue|cyan)-[0-9]+/[0-9]+|box-shadow:[^;]*0 0 [0-9]+px'
chk "fabricated stats" '([0-9][0-9,.]*[kK+]?\+?[[:space:]]*(rides|students|users|colleges|reviews))'
if ! grep -rqiE "prefers-reduced-motion|useReducedMotion|reducedMotion" "${EXC[@]}" "${TARGETS[@]}" 2>/dev/null; then echo "WARN: no reduced-motion handling found"; n=$((n+1)); fi
if grep -rqE "from ['\"](motion|framer-motion)" "${EXC[@]}" "${TARGETS[@]}" 2>/dev/null && ! grep -rqE "reducedMotion=" "${EXC[@]}" "${TARGETS[@]}" 2>/dev/null; then echo "WARN: Motion used but MotionConfig reducedMotion is not set (default is 'never')"; n=$((n+1)); fi
echo "---"; echo "$n warning group(s). Zero warnings does NOT mean it looks human-made. Run HUMAN-CHECK.md."
