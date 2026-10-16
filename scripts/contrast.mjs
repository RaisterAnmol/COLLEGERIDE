#!/usr/bin/env node
/**
 * scripts/contrast.mjs
 * WCAG 2.2 AA Contrast Compliance Checker
 * Validates design tokens against Canvas (#F7F5F0), Paper (#FFFDFC), and Surface (#FFFFFF)
 */

function parseHex(hex) {
  const clean = hex.replace('#', '').trim();
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function sRGBtoLin(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]) {
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}

export function contrastRatio(fgHex, bgHex) {
  const l1 = relativeLuminance(parseHex(fgHex));
  const l2 = relativeLuminance(parseHex(bgHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const CHECKS = [
  // Normal Body & Heading Text: min 4.5:1
  { name: 'Ink Primary on Canvas', fg: '#18201D', bg: '#F7F5F0', minRatio: 4.5, type: 'normal-text' },
  { name: 'Ink Primary on Paper', fg: '#18201D', bg: '#FFFDFC', minRatio: 4.5, type: 'normal-text' },
  { name: 'Ink Primary on Card (White)', fg: '#18201D', bg: '#FFFFFF', minRatio: 4.5, type: 'normal-text' },
  { name: 'Route Forest on Canvas', fg: '#143D32', bg: '#F7F5F0', minRatio: 4.5, type: 'normal-text' },
  { name: 'Route Forest on Paper', fg: '#143D32', bg: '#FFFDFC', minRatio: 4.5, type: 'normal-text' },
  { name: 'Route Forest on Card (White)', fg: '#143D32', bg: '#FFFFFF', minRatio: 4.5, type: 'normal-text' },
  { name: 'Ink Secondary on Canvas', fg: '#5F6964', bg: '#F7F5F0', minRatio: 4.5, type: 'normal-text' },
  { name: 'Ink Secondary on Paper', fg: '#5F6964', bg: '#FFFDFC', minRatio: 4.5, type: 'normal-text' },
  { name: 'Ink Faint on Canvas', fg: '#5C716A', bg: '#F7F5F0', minRatio: 4.5, type: 'normal-text' },
  { name: 'Ink Faint on Paper', fg: '#5C716A', bg: '#FFFDFC', minRatio: 4.5, type: 'normal-text' },
  { name: 'Amber Text on Paper', fg: '#9A4A00', bg: '#FFFDFC', minRatio: 4.5, type: 'normal-text' },
  { name: 'Crimson Danger on Paper', fg: '#DC2626', bg: '#FFFDFC', minRatio: 4.5, type: 'normal-text' },
  { name: 'White Text on Route Forest', fg: '#FFFFFF', bg: '#143D32', minRatio: 4.5, type: 'normal-text' },

  // UI Components & Graphical Objects (WCAG 2.2 SC 1.4.11): min 3.0:1
  { name: 'Control Border (Line Strong) on Canvas', fg: '#857F6B', bg: '#F7F5F0', minRatio: 3.0, type: 'ui-component' },
  { name: 'Control Border (Line Strong) on Paper', fg: '#857F6B', bg: '#FFFDFC', minRatio: 3.0, type: 'ui-component' },
  { name: 'Amber Status Indicator on Paper', fg: '#D97706', bg: '#FFFDFC', minRatio: 3.0, type: 'ui-component' },
];

console.log('--- WCAG 2.2 AA Contrast Compliance Audit ---');
let failures = 0;

for (const check of CHECKS) {
  const ratio = contrastRatio(check.fg, check.bg);
  const passed = ratio >= check.minRatio;
  const status = passed ? 'PASS' : 'FAIL';
  const ratioFormatted = ratio.toFixed(2) + ':1';
  console.log(`[${status}] ${check.name.padEnd(42)} ${ratioFormatted.padStart(8)} (min ${check.minRatio}:1)`);
  if (!passed) {
    failures++;
  }
}

console.log('----------------------------------------------');
if (failures === 0) {
  console.log(`All ${CHECKS.length} contrast checks PASSED WCAG 2.2 AA requirements.`);
  process.exit(0);
} else {
  console.error(`FAILED: ${failures} check(s) did not meet WCAG 2.2 AA contrast requirements.`);
  process.exit(1);
}
