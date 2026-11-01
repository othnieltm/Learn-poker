import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOutsProbability,
  cardLabel,
  compareHands,
  createDeck,
  evaluateHand,
  parseCard,
  shuffleDeck,
} from '../src/pokerEngine.js';

const cards = (codes) => codes.split(' ').map(parseCard);

test('standard deck contains 52 unique cards', () => {
  const deck = createDeck();
  assert.equal(deck.length, 52);
  assert.equal(new Set(deck.map(cardLabel)).size, 52);
});

test('shuffle preserves every card and deterministic shuffle works', () => {
  const deck = shuffleDeck(() => 0.5);
  assert.equal(deck.length, 52);
  assert.equal(new Set(deck.map(cardLabel)).size, 52);
});

test('evaluates every poker hand category in correct hierarchy', () => {
  const examples = [
    ['AS KS QS JS 10S', 9],
    ['9H 8H 7H 6H 5H', 8],
    ['KS KH KD KC 2S', 7],
    ['QS QH QD 8C 8H', 6],
    ['AD JD 8D 5D 2D', 5],
    ['9C 8D 7H 6S 5C', 4],
    ['7S 7H 7D KC 2H', 3],
    ['JS JD 4C 4H AS', 2],
    ['10S 10H AD 7C 3S', 1],
    ['AS JD 8C 5H 2S', 0],
  ];
  for (const [hand, category] of examples) assert.equal(evaluateHand(cards(hand)).category, category, hand);
});

test('Ace can be low in a five-high straight', () => {
  const hand = evaluateHand(cards('AS 2D 3H 4C 5S'));
  assert.equal(hand.name, 'Straight');
  assert.deepEqual(hand.score, [4, 5]);
});

test('compares kickers when both hands have the same pair', () => {
  const result = compareHands(cards('AS AH KD 8C 3S'), cards('AD AC QD 9C 4S'));
  assert.equal(result.left.name, 'One Pair');
  assert.equal(result.result, 1);
});

test('selects the best five-card combination from seven cards', () => {
  const hand = evaluateHand(cards('2C 3C 4C 5C 6C AS KD'));
  assert.equal(hand.name, 'Straight Flush');
  assert.deepEqual(hand.score, [8, 6]);
});

test('board-playing hands tie', () => {
  const board = cards('AS KS QS JS 10S');
  const result = compareHands([...board, ...cards('2D 3C')], [...board, ...cards('4D 5C')]);
  assert.equal(result.result, 0);
  assert.equal(result.left.name, 'Royal Flush');
});

test('same-category flushes compare their high cards', () => {
  const result = compareHands(cards('AS JS 8S 5S 2S'), cards('KS QS 9S 6S 3S'));
  assert.equal(result.result, 1);
});

test('rejects duplicate and malformed cards', () => {
  assert.throws(() => evaluateHand(cards('AS AS 3H 4C 5S')), /Duplicate card/);
  assert.throws(() => parseCard('1Z'), /Invalid card/);
});

test('outs calculation provides exact one and two-card probabilities', () => {
  assert.ok(Math.abs(calculateOutsProbability(9, 1) - 9 / 47) < 1e-10);
  assert.ok(Math.abs(calculateOutsProbability(9, 2) - (1 - (38 / 47) * (37 / 46))) < 1e-10);
  assert.throws(() => calculateOutsProbability(48, 2), /between 0 and 47/);
});
