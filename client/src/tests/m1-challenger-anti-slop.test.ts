import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const CLIENT_ROOT = path.resolve(process.cwd(), 'client');

test('Milestone 1 Motion & Anti-Slop Empirical Challenger Verification', async (t) => {
  const campusBgTsx = fs.readFileSync(
    path.join(CLIENT_ROOT, 'src/components/common/CampusBackground.tsx'),
    'utf-8'
  );
  const campusBgCss = fs.readFileSync(
    path.join(CLIENT_ROOT, 'src/components/common/CampusBackground.css'),
    'utf-8'
  );
  const customCursorTsx = fs.readFileSync(
    path.join(CLIENT_ROOT, 'src/components/common/CustomCursor.tsx'),
    'utf-8'
  );
  const cardTsx = fs.readFileSync(
    path.join(CLIENT_ROOT, 'src/components/ui/Card.tsx'),
    'utf-8'
  );

  await t.test('1. CampusBackground.tsx: NO animateMotion or ambient vehicle loops', () => {
    assert.strictEqual(
      campusBgTsx.includes('<animateMotion'),
      false,
      'CampusBackground.tsx must NOT contain <animateMotion>'
    );
    assert.strictEqual(
      campusBgTsx.includes('<mpath'),
      false,
      'CampusBackground.tsx must NOT contain <mpath>'
    );
    assert.strictEqual(
      campusBgTsx.includes('vehicle-group') || campusBgTsx.includes('driveVehicle'),
      false,
      'CampusBackground.tsx must NOT contain vehicle drive groups'
    );
    assert.strictEqual(
      campusBgTsx.includes('ambient-leaf') || campusBgTsx.includes('FloatingLeaf'),
      false,
      'CampusBackground.tsx must NOT contain floating leaf loops'
    );
  });

  await t.test('2. CampusBackground.tsx: Renders authentic static SVG canvas', () => {
    assert.ok(
      campusBgTsx.includes('viewBox="0 0 1000 1000"'),
      'Must contain static SVG coordinate system'
    );
    assert.ok(
      campusBgTsx.includes('mainArtery') && campusBgTsx.includes('secondaryRoute'),
      'Must contain arterial corridor routes'
    );
    assert.ok(
      campusBgTsx.includes('node-static-ring') && campusBgTsx.includes('node-core'),
      'Must render static node waypoints'
    );
  });

  await t.test('3. CampusBackground.css: NO infinite animations or keyframe drive loops', () => {
    assert.strictEqual(
      /@keyframes\s+driveVehicle/.test(campusBgCss),
      false,
      'CampusBackground.css must not contain driveVehicle keyframes'
    );
    assert.strictEqual(
      /@keyframes\s+rippleNode/.test(campusBgCss),
      false,
      'CampusBackground.css must not contain rippleNode keyframes'
    );
    assert.strictEqual(
      /@keyframes\s+drawRoute/.test(campusBgCss),
      false,
      'CampusBackground.css must not contain drawRoute keyframes'
    );
    assert.strictEqual(
      /animation:\s*[^;]*infinite/i.test(campusBgCss),
      false,
      'CampusBackground.css must not contain infinite animations'
    );
  });

  await t.test('4. CustomCursor.tsx: Zero mouse listeners, zero RAF, returns null', () => {
    // Strip block and line comments to check executable code
    const codeOnly = customCursorTsx.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

    assert.strictEqual(
      /addEventListener\s*\(/.test(codeOnly),
      false,
      'CustomCursor.tsx must NOT call addEventListener'
    );
    assert.strictEqual(
      /requestAnimationFrame\s*\(/.test(codeOnly),
      false,
      'CustomCursor.tsx must NOT call requestAnimationFrame'
    );
    assert.strictEqual(
      codeOnly.includes('mousemove'),
      false,
      'CustomCursor.tsx must NOT reference mousemove'
    );
    assert.ok(
      /return\s+null\s*;/.test(codeOnly),
      'CustomCursor.tsx must return null'
    );
  });

  await t.test('5. Card.tsx: Zero blanket hover lift in active class styles', () => {
    // Extract className strings and interactive styles
    const interactiveMatch = cardTsx.match(/const\s+interactiveStyles\s*=\s*interactive\s*\?\s*['"`]([^'"`]+)['"`]/);
    assert.ok(interactiveMatch, 'interactiveStyles definition must exist');
    const interactiveClasses = interactiveMatch[1];
    
    assert.strictEqual(
      interactiveClasses.includes(['hover:', '-translate-y'].join('')),
      false,
      'Card interactive styles must NOT contain hover lift'
    );
    assert.strictEqual(
      interactiveClasses.includes('hover:scale-'),
      false,
      'Card interactive styles must NOT contain hover:scale-'
    );
    assert.strictEqual(
      interactiveClasses.includes('hover:shadow-'),
      false,
      'Card interactive styles must NOT contain hover:shadow-'
    );
    assert.ok(
      interactiveClasses.includes('hover:border-line-strong'),
      'Card interactive styles must use quiet border feedback'
    );
  });
});
