import test from 'node:test';
import assert from 'node:assert/strict';
import { CHIP_VALUES, GLOSSARY, HAND_EXAMPLES, MODULES, WALKTHROUGH } from '../src/courseData.js';

test('course has twenty distinct, question-ready modules', () => {
  assert.equal(MODULES.length, 20);
  assert.equal(new Set(MODULES.map(({ title }) => title)).size, 20);
  for (const [index, module] of MODULES.entries()) {
    assert.ok(module.title, `module ${index + 1} has a title`);
    assert.ok(module.intro.length > 30, `${module.title} has an introduction`);
    assert.ok(module.points.length >= 2, `${module.title} has lesson points`);
    assert.equal(module.choices[module.correct] !== undefined, true, `${module.title} has a valid quiz key`);
  }
});

test('hand examples are presented in the correct strongest-to-weakest order', () => {
  assert.deepEqual(HAND_EXAMPLES.map(([name]) => name), [
    'Royal Flush',
    'Straight Flush',
    'Four of a Kind',
    'Full House',
    'Flush',
    'Straight',
    'Three of a Kind',
    'Two Pair',
    'One Pair',
    'High Card',
  ]);
  assert.equal(HAND_EXAMPLES.length, 10);
});

test('chip values and required glossary terms are present', () => {
  assert.deepEqual(CHIP_VALUES, { White: 1, Red: 5, Green: 25, Black: 100 });
  const terms = new Set(GLOSSARY.map(([term]) => term));
  for (const term of ['Board', 'Burn Card', 'Draw', 'Muck', 'Nuts', 'Pot', 'Hole Cards', 'Flop', 'Turn', 'River', 'Showdown', 'Blinds', 'Kicker', 'All-In']) {
    assert.ok(terms.has(term), `glossary contains ${term}`);
  }
});

test('guided first-game states match the example and conserve 2,000 chips', () => {
  assert.deepEqual(WALKTHROUGH.map(({ a, b, pot }) => [a, b, pot]), [
    [990, 980, 30],
    [960, 960, 80],
    [920, 920, 160],
    [860, 860, 280],
    [760, 760, 480],
    [1240, 760, 0],
  ]);
  assert.ok(WALKTHROUGH.every(({ a, b, pot }) => a + b + pot === 2000));
  assert.deepEqual(WALKTHROUGH[2].board, ['JD', '8C', '3H']);
  assert.deepEqual(WALKTHROUGH[3].board, ['JD', '8C', '3H', 'QS']);
  assert.deepEqual(WALKTHROUGH[4].board, ['JD', '8C', '3H', 'QS', '9S']);
});
