export const SUITS = ['S', 'H', 'D', 'C'];
export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
export const HAND_NAMES = [
  'High Card',
  'One Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
  'Royal Flush',
];

export function createDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
}

export function shuffleDeck(random = Math.random) {
  const deck = createDeck();
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function parseCard(code) {
  const match = /^(10|[2-9JQKA])([SHDC])$/i.exec(code.trim());
  if (!match) throw new Error(`Invalid card: ${code}`);
  const rank = ({ J: 11, Q: 12, K: 13, A: 14 })[match[1].toUpperCase()] ?? Number(match[1]);
  return { rank, suit: match[2].toUpperCase() };
}

export function cardLabel(card) {
  return `${card.rank === 14 ? 'A' : card.rank === 13 ? 'K' : card.rank === 12 ? 'Q' : card.rank === 11 ? 'J' : card.rank}${card.suit}`;
}

export function validateCards(cards, min = 5, max = 7) {
  if (!Array.isArray(cards) || cards.length < min || cards.length > max) {
    throw new Error(`Provide between ${min} and ${max} cards.`);
  }
  const seen = new Set();
  for (const card of cards) {
    if (!card || !RANKS.includes(card.rank) || !SUITS.includes(card.suit)) throw new Error('Invalid card data.');
    const key = cardLabel(card);
    if (seen.has(key)) throw new Error(`Duplicate card: ${key}`);
    seen.add(key);
  }
}

function straightHigh(ranks) {
  const distinct = [...new Set(ranks)].sort((a, b) => b - a);
  if (distinct[0] === 14) distinct.push(1);
  for (let i = 0; i <= distinct.length - 5; i += 1) {
    if (distinct[i] - distinct[i + 4] === 4) return distinct[i];
  }
  return 0;
}

function rankFive(cards) {
  const ranks = cards.map(({ rank }) => rank).sort((a, b) => b - a);
  const counts = new Map();
  for (const rank of ranks) counts.set(rank, (counts.get(rank) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const flush = cards.every(({ suit }) => suit === cards[0].suit);
  const straight = straightHigh(ranks);
  if (flush && straight === 14) return [9, 14];
  if (flush && straight) return [8, straight];
  if (groups[0][1] === 4) return [7, groups[0][0], groups[1][0]];
  if (groups[0][1] === 3 && groups[1][1] === 2) return [6, groups[0][0], groups[1][0]];
  if (flush) return [5, ...ranks];
  if (straight) return [4, straight];
  if (groups[0][1] === 3) return [3, groups[0][0], ...groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a)];
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = [groups[0][0], groups[1][0]].sort((a, b) => b - a);
    return [2, ...pairs, groups[2][0]];
  }
  if (groups[0][1] === 2) return [1, groups[0][0], ...groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a)];
  return [0, ...ranks];
}

function combinations(cards, size) {
  const result = [];
  function choose(start, selected) {
    if (selected.length === size) {
      result.push(selected);
      return;
    }
    for (let i = start; i <= cards.length - (size - selected.length); i += 1) {
      choose(i + 1, [...selected, cards[i]]);
    }
  }
  choose(0, []);
  return result;
}

function compareScores(left, right) {
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
}

export function evaluateHand(cards) {
  validateCards(cards);
  let best = null;
  for (const hand of combinations(cards, 5)) {
    const score = rankFive(hand);
    if (!best || compareScores(score, best.score) > 0) best = { score, cards: hand };
  }
  return { category: best.score[0], name: HAND_NAMES[best.score[0]], score: best.score, cards: best.cards };
}

export function compareHands(leftCards, rightCards) {
  const left = evaluateHand(leftCards);
  const right = evaluateHand(rightCards);
  return { result: compareScores(left.score, right.score), left, right };
}

export function makeRandomHand(random = Math.random) {
  const deck = shuffleDeck(random);
  return { player: deck.slice(0, 2), opponent: deck.slice(2, 4), board: deck.slice(4, 9) };
}

export function calculateOutsProbability(outs, cardsToCome = 2) {
  if (!Number.isInteger(outs) || outs < 0 || outs > 47) throw new Error('Outs must be between 0 and 47.');
  if (![1, 2].includes(cardsToCome)) throw new Error('Cards to come must be 1 or 2.');
  return 1 - ((47 - outs) / 47) * (cardsToCome === 2 ? (46 - outs) / 46 : 1);
}
