export const MODULES = [
  {
    title: 'Introduction to Poker', part: 'Understanding Poker',
    intro: 'Texas Hold’em is a community-card game. Each player receives two private hole cards and combines them with five shared cards to make the best five-card hand.',
    points: ['Win by showing the best hand at showdown or by making every other player fold.', 'The pot is the chips wagered during the hand.', 'Poker mixes chance with decisions made using incomplete information.'],
    question: 'How can a player win the pot without showing the best hand?', choices: ['Make every opponent fold', 'Have the most chips before the deal', 'Receive the dealer button'], correct: 0,
  },
  {
    title: 'Understanding Playing Cards', part: 'Understanding Poker',
    intro: 'A standard deck has 52 cards: four suits with thirteen ranks each. Suits are equal in poker; ranks determine card strength.',
    points: ['A standard deck has 52 cards, with thirteen ranks in each of four suits.', 'Ranks go from 2 through 10, Jack, Queen, King, and Ace; suits do not outrank each other.', 'The Ace is usually high, but it can be low in A-2-3-4-5.'],
    question: 'Which Ace-low sequence is a straight?', choices: ['A-2-3-4-5', 'A-K-Q-J-10 only', 'A-3-4-5-6'], correct: 0,
  },
  {
    title: 'Poker Hand Rankings', part: 'Understanding Poker',
    intro: 'Compare five-card hands from the top category down. If both hands share a category, compare the ranked cards and then kickers.',
    points: ['Royal Flush → Straight Flush → Four of a Kind → Full House → Flush.', 'Straight → Three of a Kind → Two Pair → One Pair → High Card.', 'A kicker is an unpaired card used to break a tie between otherwise similar hands.'],
    question: 'Which hand ranks higher?', choices: ['Straight', 'Flush', 'They are equal'], correct: 1,
  },
  {
    title: 'The Poker Table and Player Positions', part: 'How the Game Works',
    intro: 'The dealer button marks the nominal dealer and moves clockwise after each hand. In heads-up play, the button posts the small blind and acts first before the flop.',
    points: ['Small Blind and Big Blind are forced bets posted before cards are dealt; the button moves clockwise each hand.', 'Under the Gun acts first pre-flop at a full table. Heads-up, the button posts the small blind and acts first pre-flop.', 'After the flop, the first active player clockwise from the button acts first; acting later lets you see earlier choices.'],
    question: 'In heads-up play, who acts first before the flop?', choices: ['The dealer/button (small blind)', 'The big blind', 'The player with the stronger cards'], correct: 0,
  },
  {
    title: 'Setting Up a Poker Game', part: 'How the Game Works',
    intro: 'Set up the supplied 200-chip home-game kit with a table or poker mat, chips, a dealer button, Small Blind and Big Blind markers, cards, and a chip rack.',
    points: ['White = 1; Red = 5; Green = 25; Black = 100.', 'A recommended starting stack is 1,000 chips in value.', 'Agree on blinds and rules before dealing.'],
    question: 'What is the value of 2 black, 4 green, and 5 red chips?', choices: ['325', '3250', '225'], correct: 0,
  },
  {
    title: 'Poker Actions', part: 'How the Game Works',
    intro: 'Choose an action based on whether a bet is outstanding. Players act in turn; betting continues until all remaining players have matched the wager or folded.',
    points: ['Fold gives up the hand; check passes when no bet is owed.', 'Bet opens wagering; call matches an outstanding bet; raise increases it.', 'All-in commits a player’s remaining chips. Unequal all-ins can create side pots.'],
    question: 'There is a 20-chip bet to you. Which action cannot be taken without changing the action first?', choices: ['Call', 'Raise', 'Check'], correct: 2,
  },
  {
    title: 'The Four Betting Rounds', part: 'Learning to Play',
    intro: 'A hand has four betting rounds. The flop reveals three community cards, then one card on the turn and one on the river.',
    points: ['Pre-flop begins after each player receives two hole cards; the small blind acts first in heads-up play.', 'The flop reveals three cards; turn and river each reveal one. The first active player clockwise from the button acts first after the flop.', 'A round ends when every remaining player has matched the wager or folded; after river betting, remaining players reach showdown.'],
    question: 'How many community cards are revealed on the flop?', choices: ['Three', 'One', 'Two'], correct: 0,
  },
  {
    title: 'Understanding the Showdown', part: 'Learning to Play',
    intro: 'At showdown, each player makes the strongest five-card hand from any combination of their two hole cards and the five-card board.',
    points: ['A player may use both, one, or none of their hole cards.', 'The best five-card combination wins; equal best hands split the pot.', 'The board can itself be the best five-card hand for everyone.'],
    question: 'How many cards are in the hand compared at showdown?', choices: ['Five', 'Seven', 'Two'], correct: 0,
  },
  {
    title: 'Betting and Pot Management', part: 'Learning to Play',
    intro: 'Keep separate track of chips behind, chips committed this round, and the total pot. A call is only the amount needed to match the current wager.',
    points: ['The pot is the total of chips committed by all players.', 'A player cannot wager more chips than they have; an all-in may be short.', 'When stacks differ, side pots prevent players from winning chips they did not match.'],
    question: 'A player has 35 chips left and faces a 50-chip wager. What is the most they can commit?', choices: ['35 chips (all-in)', '50 chips', '85 chips'], correct: 0,
  },
  {
    title: 'Understanding Starting Hands', part: 'Learning to Play Better',
    intro: 'Starting-hand strength is a useful beginner guide, but position, number of players, and action before you also matter.',
    points: ['Premium pairs include A-A, K-K, and Q-Q.', 'A-K and A-Q are strong high-card hands.', 'Lower pairs and suited connectors such as 8-7 suited are speculative; avoid playing every weak hand.'],
    question: 'Which is a premium pair from the lesson?', choices: ['Q-Q', '7-2 offsuit', '9-3 offsuit'], correct: 0,
  },
  {
    title: 'Poker Strategy Fundamentals', part: 'Learning to Play Better',
    intro: 'A tight-aggressive beginner approach selects fewer starting hands and bets or raises decisively when choosing to play.',
    points: ['Acting last gives information about earlier decisions.', 'Good starting-hand selection avoids difficult situations with weak cards.', 'Strategy is contextual; no starting hand guarantees a win.'],
    question: 'Why is acting later in a betting round useful?', choices: ['You see earlier players’ actions first', 'You receive an extra hole card', 'The pot is automatically yours'], correct: 0,
  },
  {
    title: 'Bluffing and Reading Opponents', part: 'Learning to Play Better',
    intro: 'A bluff is a bet intended to make a better hand fold. Betting patterns are clues, not proof, about an opponent’s hand.',
    points: ['A bluff can work when the story your betting tells is credible.', 'Bluffing too often wastes chips and becomes easy to exploit.', 'Betting patterns and basic physical tells are clues, not proof of an opponent’s hand.'],
    question: 'What is the main purpose of a bluff?', choices: ['Make a better hand fold', 'Guarantee a winning hand', 'Reveal your hole cards'], correct: 0,
  },
  {
    title: 'Common Beginner Mistakes', part: 'Learning to Play Better',
    intro: 'Slow down, act in turn, choose starting hands carefully, and consider the price of draws instead of chasing every possible card.',
    points: ['Limping means entering pre-flop by calling only the big blind.', 'Chasing a draw without considering odds can be costly.', 'Ignoring position or acting out of turn causes avoidable errors.'],
    question: 'Which is a common beginner mistake?', choices: ['Playing too many weak hands', 'Protecting hole cards', 'Acting in turn'], correct: 0,
  },
  {
    title: 'Organizing a Home Poker Game', part: 'Playing with Friends',
    intro: 'A simple home tournament can use two to six players, equal starting stacks, and blinds that rise on a schedule everyone agrees to.',
    points: ['Use 1,000-chip starting stacks and 10/20 starting blinds.', 'Increase blinds every 20 minutes in the suggested format.', 'Players are eliminated when they lose their chips; the last player remaining wins the tournament.'],
    question: 'What starting blind level is recommended?', choices: ['10/20', '1/2', '100/200'], correct: 0,
  },
  {
    title: 'Poker Etiquette', part: 'Playing with Friends',
    intro: 'Clear, respectful table habits make a home game fair and easier for beginners to follow.',
    points: ['Announce actions clearly and act in turn.', 'Protect your hole cards and avoid splashing chips into the pot.', 'Respect players and keep the game friendly.'],
    question: 'What does “splashing the pot” mean?', choices: ['Tossing chips messily into the pot', 'Checking when allowed', 'Shuffling before dealing'], correct: 0,
  },
  {
    title: 'Teaching Someone Else to Play', part: 'Playing with Friends',
    intro: 'Teach in small steps and let a new player see decisions openly before introducing a normal pace.',
    points: ['Start with hand rankings.', 'Deal practice hands face up and discuss decisions together.', 'Introduce chips, then play a slow heads-up game.'],
    question: 'What is a useful first teaching step?', choices: ['Show the hand rankings', 'Begin with a fast tournament', 'Hide the community cards'], correct: 0,
  },
  {
    title: 'Guided Practice Hands', part: 'Practice and Reference',
    intro: 'Practice scenario: you hold A♠ K♠ on a 2♠ 7♦ 9♠ flop. An opponent bets 50 into a pot of 100.',
    points: ['You have a flush draw: four spades are known, so nine spades remain as outs.', 'Calling 50 to contest a current 150-chip pot needs about 25% equity.', 'With two cards to come, the Rule of 4 estimates roughly 36% to hit at least one of nine outs; with one card to come the Rule of 2 estimates 18%.'],
    question: 'How many spades remain as flush outs?', choices: ['9', '4', '13'], correct: 0,
  },
  {
    title: 'Poker Mathematics', part: 'Practice and Reference',
    intro: 'An out is an unseen card that can improve your hand. The Rule of 2 and 4 provides a quick approximation, not an exact guarantee.',
    points: ['Multiply outs by 2 with one card to come.', 'Multiply outs by 4 on the flop with two cards to come.', 'The exact chance depends on unseen cards and whether an out also helps an opponent.'],
    question: 'With 9 outs and two cards to come, what is the Rule of 4 estimate?', choices: ['About 36%', 'About 18%', 'About 9%'], correct: 0,
  },
  {
    title: 'Poker Glossary', part: 'Practice and Reference',
    intro: 'Use the glossary to look up common table language. Search by term or part of a definition.',
    points: ['Board: the shared community cards.', 'Hole cards: private cards dealt to each player.', 'Kicker: an unpaired card used to break a hand tie.'],
    question: 'What are a player’s private cards called?', choices: ['Hole cards', 'The board', 'Burn cards'], correct: 0,
  },
  {
    title: 'First-Game Cheat Sheet', part: 'Practice and Reference',
    intro: 'Print this quick-reference lesson for a friendly first game. Agree on house rules before you start.',
    points: ['Rounds: Pre-Flop → Flop → Turn → River → Showdown.', 'Hand ranking, strongest to weakest: Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.', 'Chip values: White 1, Red 5, Green 25, Black 100; suggested stack 1,000; starting blinds 10/20.'],
    question: 'What is the first community-card stage?', choices: ['Flop', 'Turn', 'River'], correct: 0,
  },
];

export const GLOSSARY = [
  ['All-In', 'Betting all of your remaining chips.'],
  ['Blinds', 'Forced bets posted before cards are dealt.'],
  ['Board', 'The shared community cards.'],
  ['Burn Card', 'A card set aside before dealing community cards.'],
  ['Draw', 'A hand that needs another card to improve, such as a flush draw.'],
  ['Flop', 'The first three community cards.'],
  ['Hole Cards', 'The private cards dealt to each player.'],
  ['Kicker', 'An unpaired card used to compare otherwise tied hands.'],
  ['Muck', 'To fold or discard a hand without showing it.'],
  ['Nuts', 'The strongest possible hand at a particular moment.'],
  ['Pot', 'All chips wagered during the hand.'],
  ['Showdown', 'The stage where remaining hands are compared.'],
  ['Turn', 'The fourth community card.'],
  ['River', 'The fifth and final community card.'],
];

export const HAND_EXAMPLES = [
  ['Royal Flush', 'A♠ K♠ Q♠ J♠ 10♠', 'Ace-high straight flush.'],
  ['Straight Flush', '9♥ 8♥ 7♥ 6♥ 5♥', 'Five consecutive cards of one suit.'],
  ['Four of a Kind', 'K♠ K♥ K♦ K♣ 4♠', 'Four cards of the same rank.'],
  ['Full House', 'Q♠ Q♥ Q♦ 8♣ 8♥', 'Three of a kind plus a pair.'],
  ['Flush', 'A♦ J♦ 8♦ 5♦ 2♦', 'Five cards of one suit, not consecutive.'],
  ['Straight', '9♣ 8♦ 7♥ 6♠ 5♣', 'Five consecutive ranks, mixed suits.'],
  ['Three of a Kind', '7♠ 7♥ 7♦ K♣ 2♥', 'Three cards of the same rank.'],
  ['Two Pair', 'J♠ J♦ 4♣ 4♥ A♠', 'Two different pairs.'],
  ['One Pair', '10♠ 10♥ A♦ 7♣ 3♠', 'Two cards of the same rank.'],
  ['High Card', 'A♠ J♦ 8♣ 5♥ 2♠', 'No pair or other ranked combination.'],
];

export const CHIP_VALUES = { White: 1, Red: 5, Green: 25, Black: 100 };

export const WALKTHROUGH = [
  {
    name: 'Posting the Blinds', board: [], a: 990, b: 980, pot: 30,
    question: 'Player A is the dealer and small blind. What happens before the deal?',
    options: ['A posts 10 and B posts 20', 'Both players check', 'B posts 10 and A posts 20'],
    answer: 0, reason: 'In this heads-up hand, the dealer posts the small blind (10) and the other player posts the big blind (20).',
  },
  {
    name: 'Pre-Flop', board: [], a: 960, b: 960, pot: 80,
    question: 'Player A faces 10 more to match the big blind. What is the action?',
    options: ['Call 10', 'Fold', 'Raise to 100'],
    answer: 0, reason: 'Player A calls 10. Player B then raises to 40 total, and Player A calls 20 more. Each has 40 committed, making the pot 80.',
  },
  {
    name: 'The Flop', board: ['JD', '8C', '3H'], a: 920, b: 920, pot: 160,
    question: 'Player B bets 40. Player A has a pair of Jacks. What should Player A do in this example?',
    options: ['Call 40', 'Check', 'Fold automatically'],
    answer: 0, reason: 'Player A calls 40. Checking is not available while facing a bet. Player A has a pair of Jacks; Player B has Ace-high.',
  },
  {
    name: 'The Turn', board: ['JD', '8C', '3H', 'QS'], a: 860, b: 860, pot: 280,
    question: 'Player B bets 60 and now has a pair of Queens. What action does Player A take in the walkthrough?',
    options: ['Call 60', 'Check', 'Raise all-in'],
    answer: 0, reason: 'Player A calls 60. The pot reaches 280, and Player A’s pair of Jacks is behind Player B’s pair of Queens at this point.',
  },
  {
    name: 'The River', board: ['JD', '8C', '3H', 'QS', '9S'], a: 760, b: 760, pot: 480,
    question: 'Player B checks; Player A has made an 8-9-10-J-Q straight. What does the example do?',
    options: ['Bet 100 and get called', 'Fold the straight', 'Check and end the hand'],
    answer: 0, reason: 'Player A bets 100 and Player B calls. The pot is 480. The 8-9-10-J-Q straight beats a pair of Queens.',
  },
  {
    name: 'Showdown', board: ['JD', '8C', '3H', 'QS', '9S'], a: 1240, b: 760, pot: 0,
    question: 'Which hand wins at showdown?',
    options: ['Player A’s straight', 'Player B’s pair of Queens', 'The board is always a tie'],
    answer: 0, reason: 'A straight outranks one pair, so Player A receives the 480-chip pot. Final stacks are 1,240 and 760: 2,000 total.',
  },
];
