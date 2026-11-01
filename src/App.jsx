import { useEffect, useRef, useState } from 'react';
import { CHIP_VALUES, GLOSSARY, HAND_EXAMPLES, MODULES, WALKTHROUGH } from './courseData';
import {
  calculateOutsProbability,
  cardLabel,
  compareHands,
  createDeck,
  evaluateHand,
  parseCard,
  shuffleDeck,
} from './pokerEngine';

const STORAGE_KEY = 'poker-academy-progress-v1';
const SUIT_GLYPHS = { S: '♠', H: '♥', D: '♦', C: '♣' };
const SUIT_NAMES = { S: 'Spades', H: 'Hearts', D: 'Diamonds', C: 'Clubs' };
const RANK_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const RANK_NAMES = { 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace' };
const CARD_OPTIONS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].flatMap((rank) => ['S', 'H', 'D', 'C'].map((suit) => `${rank}${suit}`));
const DEFAULT_PROGRESS = {
  version: 1,
  completedModules: [],
  currentModule: 1,
  lastView: 'dashboard',
  quizHistory: [],
  walkthroughStep: 0,
  practiceGames: 0,
  practiceStats: { wins: 0, losses: 0, ties: 0 },
  settings: { reducedMotion: false },
};

function validView(view) {
  return ['dashboard', 'module', 'walkthrough', 'practice', 'assessment', 'settings'].includes(view);
}

function routeFromHash() {
  const match = /^#(dashboard|module(?:\/(\d+))?|walkthrough|practice|assessment|settings)$/.exec(window.location.hash);
  if (!match) return null;
  const moduleId = Number(match[2]);
  return {
    view: match[1].startsWith('module') ? 'module' : match[1],
    module: Number.isInteger(moduleId) && moduleId >= 1 && moduleId <= MODULES.length ? moduleId : null,
  };
}

function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { progress: DEFAULT_PROGRESS, message: '' };
    const saved = JSON.parse(raw);
    if (saved?.version !== 1 || !Array.isArray(saved.completedModules) || !Array.isArray(saved.quizHistory)) {
      return { progress: DEFAULT_PROGRESS, message: 'Saved progress was incompatible and has been safely reset.' };
    }
    if (!saved.quizHistory.every((entry) => entry && Number.isFinite(entry.percent) && entry.percent >= 0 && entry.percent <= 100)) {
      return { progress: DEFAULT_PROGRESS, message: 'Saved quiz data was invalid and has been safely reset.' };
    }
    return {
      progress: {
        ...DEFAULT_PROGRESS,
        ...saved,
        currentModule: Number.isInteger(saved.currentModule) && saved.currentModule >= 1 && saved.currentModule <= MODULES.length ? saved.currentModule : 1,
        lastView: validView(saved.lastView) ? saved.lastView : 'dashboard',
        walkthroughStep: Number.isInteger(saved.walkthroughStep) ? Math.min(WALKTHROUGH.length - 1, Math.max(0, saved.walkthroughStep)) : 0,
        practiceGames: Number.isInteger(saved.practiceGames) && saved.practiceGames >= 0 ? saved.practiceGames : 0,
        practiceStats: {
          wins: Number.isInteger(saved.practiceStats?.wins) && saved.practiceStats.wins >= 0 ? saved.practiceStats.wins : 0,
          losses: Number.isInteger(saved.practiceStats?.losses) && saved.practiceStats.losses >= 0 ? saved.practiceStats.losses : 0,
          ties: Number.isInteger(saved.practiceStats?.ties) && saved.practiceStats.ties >= 0 ? saved.practiceStats.ties : 0,
        },
        completedModules: [...new Set(saved.completedModules.filter((id) => Number.isInteger(id) && id >= 1 && id <= MODULES.length))],
        settings: { ...DEFAULT_PROGRESS.settings, ...saved.settings, reducedMotion: Boolean(saved.settings?.reducedMotion) },
      },
      message: '',
    };
  } catch {
    return { progress: DEFAULT_PROGRESS, message: 'Saved progress could not be read. You can continue with fresh progress.' };
  }
}

function cardFromCode(code) {
  const parsed = parseCard(code);
  return { ...parsed, code };
}

function findDrawOuts(codes) {
  const cards = codes.map(cardFromCode);
  if (cards.length < 5 || cards.length >= 7) return { count: null, type: 'Select two hole cards and three or four board cards.' };
  const suits = new Map();
  for (const card of cards) suits.set(card.suit, (suits.get(card.suit) ?? 0) + 1);
  const flush = [...suits.entries()].find(([, count]) => count === 4);
  if (flush) return { count: 13 - flush[1], type: `${13 - flush[1]} remaining ${SUIT_NAMES[flush[0]].toLowerCase()} complete a flush draw.` };
  const current = evaluateHand(cards);
  const used = new Set(codes);
  const improving = createDeck().filter((candidate) => {
    if (used.has(cardLabel(candidate))) return false;
    return evaluateHand([...cards, candidate]).category > current.category;
  });
  const straightCount = improving.filter((candidate) => {
    return current.category < 4 && evaluateHand([...cards, candidate]).category === 4;
  }).length;
  if (straightCount) return { count: straightCount, type: `${straightCount} unseen cards complete a straight.` };
  return { count: 0, type: 'No one-card flush or straight completion is detected. Consider other improvement outs carefully.' };
}

function face(card) {
  if (!card || card === '?') return '·';
  const value = card.rank > 10 ? ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A' })[card.rank] : card.rank;
  return `${value}${SUIT_GLYPHS[card.suit]}`;
}

function PlayingCard({ code, hidden = false, label }) {
  const red = /[HD]$/.test(code ?? '');
  return (
    <span className={`playing-card ${red ? 'red-suit' : ''} ${hidden ? 'hidden-card' : ''}`} aria-label={hidden ? 'Hidden card' : label || code || 'Playing card'}>
      {hidden ? '♠' : face(cardFromCode(code))}
    </span>
  );
}

function makePracticeGame() {
  const deck = shuffleDeck();
  const player = deck.splice(0, 2);
  const opponent = deck.splice(0, 2);
  const board = deck.splice(0, 5);
  return {
    deck,
    player,
    opponent,
    board,
    stage: 0,
    stacks: [990, 980],
    pot: 30,
    contributions: [10, 20],
    roundBets: [10, 20],
    currentBet: 20,
    decision: 'preflop',
    over: false,
    folded: false,
    winner: null,
    message: 'You are the small blind. Call 10, raise, or fold to begin.',
    result: '',
  };
}

function App() {
  const [loaded] = useState(readProgress);
  const [progress, setProgress] = useState(loaded.progress);
  const [notice, setNotice] = useState(loaded.message);
  const [initialRoute] = useState(routeFromHash);
  const [view, setView] = useState(initialRoute?.view ?? loaded.progress.lastView);
  const [currentModule, setCurrentModule] = useState(initialRoute?.module ?? loaded.progress.currentModule);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [walkthroughStep, setWalkthroughStep] = useState(loaded.progress.walkthroughStep);
  const [walkthroughMode, setWalkthroughMode] = useState('guided');
  const [walkthroughAnswer, setWalkthroughAnswer] = useState(null);
  const [cardQuiz, setCardQuiz] = useState(() => shuffleDeck()[0]);
  const [cardGuess, setCardGuess] = useState({ rank: '', suit: '' });
  const [activityFeedback, setActivityFeedback] = useState(null);
  const [cardFeedback, setCardFeedback] = useState(null);
  const [position, setPosition] = useState('Dealer / Button');
  const [chips, setChips] = useState({ White: 0, Red: 0, Green: 0, Black: 0 });
  const [roundIndex, setRoundIndex] = useState(0);
  const [betting, setBetting] = useState({ stack: 500, pot: 100, currentBet: 20, bet: 20, outcome: '' });
  const [scenarioChoice, setScenarioChoice] = useState('');
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [outs, setOuts] = useState(9);
  const [cardsToCome, setCardsToCome] = useState(2);
  const [useDetectedOuts, setUseDetectedOuts] = useState(true);
  const [outsHand, setOutsHand] = useState(['AS', 'KS']);
  const [outsBoard, setOutsBoard] = useState(['2S', '7D', '9S', 'QC']);
  const [teachingStep, setTeachingStep] = useState(0);
  const [players, setPlayers] = useState(6);
  const [remainingPlayers, setRemainingPlayers] = useState(6);
  const [blindsStarted, setBlindsStarted] = useState(false);
  const [blindLevel, setBlindLevel] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(20 * 60);
  const [practice, setPractice] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [assessmentAnswer, setAssessmentAnswer] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const importInput = useRef(null);
  const recordedPracticeCount = useRef(loaded.progress.practiceGames);
  const [positionDetail, setPositionDetail] = useState('');

  const module = MODULES[currentModule - 1];
  const completedCount = progress.completedModules.length;
  const progressPercent = Math.round((completedCount / MODULES.length) * 100);
  const quizAverage = progress.quizHistory.length
    ? Math.round(progress.quizHistory.reduce((total, result) => total + result.percent, 0) / progress.quizHistory.length)
    : 0;
  const achievements = [
    ['First lesson', completedCount > 0],
    ['Perfect check', progress.quizHistory.some((result) => result.percent === 100)],
    ['Strategy student', [10, 11, 12].every((id) => progress.completedModules.includes(id))],
    ['First practice hand', progress.practiceGames > 0],
    ['Course complete', completedCount === MODULES.length],
  ];
  const currentWalkthrough = WALKTHROUGH[walkthroughStep];
  const practiceShowdown = practice?.over && !practice.folded
    ? compareHands([...practice.player, ...practice.board], [...practice.opponent, ...practice.board])
    : null;

  const checkCardGuess = () => {
    if (!cardGuess.rank || !cardGuess.suit) {
      setActivityFeedback({ correct: false, text: 'Choose both a rank and a suit.' });
    } else if (Number(cardGuess.rank) === cardQuiz.rank && cardGuess.suit === cardQuiz.suit) {
      setActivityFeedback({ correct: true, text: `Correct: ${RANK_NAMES[cardQuiz.rank] ?? cardQuiz.rank} of ${SUIT_NAMES[cardQuiz.suit]}.` });
    } else {
      setActivityFeedback({ correct: false, text: `Not quite. The drawn card is ${face(cardQuiz)}. Try again or draw another card.` });
    }
  };

  const renderActivityFeedback = () => activityFeedback && (
    <p className={`feedback ${activityFeedback.correct ? 'correct' : 'incorrect'}`} role="status">{activityFeedback.text}</p>
  );

  useEffect(() => {
    try {
      const state = { ...progress, currentModule, lastView: view, walkthroughStep };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Could not save learning progress.', error);
      setNotice('Progress could not be saved in this browser. Check storage permissions or available space.');
    }
  }, [progress, currentModule, view, walkthroughStep]);

  useEffect(() => {
    if (!blindsStarted) return undefined;
    const timerId = window.setTimeout(() => {
      if (secondsRemaining <= 1) {
        setBlindLevel((level) => level + 1);
        setSecondsRemaining(20 * 60);
      } else {
        setSecondsRemaining((remaining) => remaining - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timerId);
  }, [blindsStarted, secondsRemaining]);

  useEffect(() => {
    if (!practice?.over || recordedPracticeCount.current >= progress.practiceGames) return;
    recordedPracticeCount.current = progress.practiceGames;
    setProgress((state) => ({
      ...state,
      practiceStats: {
        wins: state.practiceStats.wins + (practice.winner === 'player' ? 1 : 0),
        losses: state.practiceStats.losses + (practice.winner === 'opponent' ? 1 : 0),
        ties: state.practiceStats.ties + (practice.winner === 'tie' ? 1 : 0),
      },
    }));
  }, [practice, progress.practiceGames]);

  useEffect(() => {
    const handleHistory = () => {
      const route = routeFromHash();
      if (!route) {
        setView('dashboard');
        return;
      }
      setView(route.view);
      if (route.module) {
        setCurrentModule(route.module);
        setProgress((state) => ({ ...state, currentModule: route.module }));
      }
      setSelectedAnswer(null);
      setQuizFeedback(null);
      setActivityFeedback(null);
      setNotice('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', handleHistory);
    return () => window.removeEventListener('popstate', handleHistory);
  }, []);

  const navigate = (nextView, id = currentModule) => {
    const route = nextView === 'module' ? `#module/${id}` : `#${nextView}`;
    if (window.location.hash !== route) window.history.pushState({}, '', route);
    setView(nextView);
    setMenuOpen(false);
    setNotice('');
    if (nextView === 'module') {
      setCurrentModule(id);
      setProgress((state) => ({ ...state, currentModule: id }));
      setSelectedAnswer(null);
      setQuizFeedback(null);
      setActivityFeedback(null);
      setScenarioChoice('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recordQuiz = (correct, percent = correct ? 100 : 0) => {
    setProgress((state) => ({
      ...state,
      quizHistory: [...state.quizHistory, { module: currentModule, correct, percent, at: new Date().toISOString() }],
      completedModules: correct && !state.completedModules.includes(currentModule)
        ? [...state.completedModules, currentModule].sort((a, b) => a - b)
        : state.completedModules,
    }));
  };

  const submitModuleQuiz = () => {
    if (selectedAnswer === null) {
      setQuizFeedback({ correct: false, text: 'Choose an answer before checking it.' });
      return;
    }
    const correct = selectedAnswer === module.correct;
    setQuizFeedback({
      correct,
      text: correct
        ? 'Correct. ' + module.points[0]
        : `Not quite. The correct answer is “${module.choices[module.correct]}.” ${module.points[0]}`,
    });
    recordQuiz(correct);
  };

  const nextModule = () => navigate('module', Math.min(20, currentModule + 1));
  const previousModule = () => navigate('module', Math.max(1, currentModule - 1));
  const completeModule = () => {
    setProgress((state) => ({
      ...state,
      completedModules: state.completedModules.includes(currentModule)
        ? state.completedModules
        : [...state.completedModules, currentModule].sort((a, b) => a - b),
    }));
    setNotice(`Module ${currentModule} marked complete.`);
  };

  const nextUncompletedModule = () => MODULES.findIndex((_, index) => !progress.completedModules.includes(index + 1)) + 1 || MODULES.length;

  const answerWalkthrough = () => {
    if (walkthroughAnswer === null) return setNotice('Choose an action to continue.');
    if (walkthroughAnswer !== currentWalkthrough.answer) {
      setNotice('That is not the walkthrough action. Review the available actions and try again—there is no penalty.');
      return;
    }
    setNotice(currentWalkthrough.reason);
    if (walkthroughStep < WALKTHROUGH.length - 1) setWalkthroughStep((step) => step + 1);
    setWalkthroughAnswer(null);
  };

  const setPracticeDecision = (action, amount = 0) => {
    setPractice((state) => {
      if (!state || state.over) return state;
      const next = {
        ...state,
        stacks: [...state.stacks],
        contributions: [...state.contributions],
        roundBets: [...state.roundBets],
      };
      const user = 0;
      const opponent = 1;
      const toCall = Math.max(0, next.currentBet - next.roundBets[user]);
      const pay = (player, chipsToPay) => {
        const actual = Math.min(next.stacks[player], chipsToPay);
        next.stacks[player] -= actual;
        next.pot += actual;
        next.contributions[player] += actual;
        next.roundBets[player] += actual;
        return actual;
      };
      const label = ['Pre-Flop', 'Flop', 'Turn', 'River'][next.stage];
      if (action === 'Fold') {
        next.over = true;
        next.folded = true;
        next.winner = 'opponent';
        next.stacks[opponent] += next.pot;
        next.pot = 0;
        next.result = 'You folded; the computer opponent wins the pot.';
        next.message = 'Hand complete. Deal another hand to practice again.';
        return next;
      }
      if (action === 'Check' && toCall > 0) {
        next.message = 'You cannot check while a bet is outstanding. Call, raise, go all-in, or fold.';
        return next;
      }
      if (action === 'Call') {
        if (toCall === 0) {
          next.message = 'There is no outstanding bet to call. Check or bet instead.';
          return next;
        }
        const paid = pay(user, toCall);
        if (paid < toCall) {
          const unmatched = next.roundBets[opponent] - next.roundBets[user];
          next.stacks[opponent] += unmatched;
          next.pot -= unmatched;
          next.contributions[opponent] -= unmatched;
          next.roundBets[opponent] -= unmatched;
          next.message = `You called all-in for ${paid}; the opponent’s unmatched ${unmatched} was returned.`;
        } else {
          next.message = `You called ${paid}. The ${label} round is complete.`;
        }
      } else if (action === 'Check') {
        next.message = `You checked. The opponent checks behind; ${label} betting is complete.`;
      } else if (action === 'Bet') {
        if (toCall > 0) {
          next.message = 'You cannot open a bet while facing a wager. Call, raise, or fold.';
          return next;
        }
        const bet = Math.min(amount, next.stacks[user]);
        if (bet <= 0) {
          next.message = 'You have no chips left to bet.';
          return next;
        }
        pay(user, bet);
        next.currentBet = next.roundBets[user];
        const opponentResponse = Math.min(bet, next.stacks[opponent]);
        pay(opponent, opponentResponse);
        if (opponentResponse < bet) {
          const excess = bet - opponentResponse;
          next.stacks[user] += excess;
          next.pot -= excess;
          next.contributions[user] -= excess;
          next.roundBets[user] -= excess;
        }
        next.message = `You bet ${bet}; the opponent ${opponentResponse ? 'called' : 'folded'}.`;
      } else if (action === 'Raise') {
        if (toCall === 0) {
          next.message = 'There is no bet to raise. Use Bet to open the action.';
          return next;
        }
        const raiseBy = Math.max(20, amount);
        const total = Math.min(next.stacks[user], toCall + raiseBy);
        pay(user, total);
        next.currentBet = next.roundBets[user];
        const amountOwed = next.currentBet - next.roundBets[opponent];
        const opponentCall = Math.min(amountOwed, next.stacks[opponent]);
        pay(opponent, opponentCall);
        if (opponentCall < amountOwed) {
          const unmatched = next.roundBets[user] - next.roundBets[opponent];
          next.stacks[user] += unmatched;
          next.pot -= unmatched;
          next.contributions[user] -= unmatched;
          next.roundBets[user] -= unmatched;
          next.currentBet = next.roundBets[user];
          next.message = 'The opponent is all-in for a smaller amount; remaining community cards are dealt.';
        } else {
          next.message = `You raised by ${raiseBy}; the opponent called ${opponentCall}.`;
        }
      } else if (action === 'All-In') {
        const before = next.stacks[user];
        pay(user, before);
        next.currentBet = Math.max(next.currentBet, next.roundBets[user]);
        const owed = Math.max(0, next.roundBets[user] - next.roundBets[opponent]);
        const matched = pay(opponent, Math.min(owed, next.stacks[opponent]));
        if (next.roundBets[user] > next.roundBets[opponent]) {
          const unmatched = next.roundBets[user] - next.roundBets[opponent] - matched;
          if (unmatched > 0) {
            next.stacks[user] += unmatched;
            next.pot -= unmatched;
            next.contributions[user] -= unmatched;
            next.roundBets[user] -= unmatched;
          }
        } else if (next.roundBets[opponent] > next.roundBets[user]) {
          const unmatched = next.roundBets[opponent] - next.roundBets[user];
          next.stacks[opponent] += unmatched;
          next.pot -= unmatched;
          next.contributions[opponent] -= unmatched;
          next.roundBets[opponent] -= unmatched;
        }
        next.message = 'You moved all-in. Unmatched chips are returned; the opponent matches what they can.';
      }
      if (next.stacks[user] === 0 || next.stacks[opponent] === 0) {
        next.stage = 3;
        next.decision = 'showdown';
        next.over = true;
        const showdown = compareHands([...next.player, ...next.board], [...next.opponent, ...next.board]);
        if (showdown.result > 0) {
          next.stacks[user] += next.pot;
          next.winner = 'player';
          next.result = `You win at showdown with ${showdown.left.name} over ${showdown.right.name}.`;
        } else if (showdown.result < 0) {
          next.stacks[opponent] += next.pot;
          next.winner = 'opponent';
          next.result = `The opponent wins at showdown with ${showdown.right.name} over ${showdown.left.name}.`;
        } else {
          const half = Math.floor(next.pot / 2);
          next.stacks[user] += half;
          next.stacks[opponent] += next.pot - half;
          next.winner = 'tie';
          next.result = `Split pot: both players have ${showdown.left.name}.`;
        }
        next.pot = 0;
        next.message = 'All chips are committed; the remaining board is dealt and hands are compared.';
        return next;
      }
      if (next.stage < 3) {
        next.stage += 1;
        next.roundBets = [0, 0];
        next.currentBet = 0;
        next.decision = next.stage % 2 === 0 ? 'checked' : 'opponent-bet';
        if (next.decision === 'opponent-bet') {
          const bet = Math.min(20, next.stacks[opponent]);
          next.stacks[opponent] -= bet;
          next.pot += bet;
          next.contributions[opponent] += bet;
          next.roundBets[opponent] = bet;
          next.currentBet = bet;
          next.message = `On the ${['', 'Flop', 'Turn', 'River'][next.stage]}, the opponent bets ${bet}. Choose Call, Raise, All-In, or Fold.`;
        } else {
          next.message = `The opponent checks on the ${['', 'Flop', 'Turn', 'River'][next.stage]}. You may Check, Bet, All-In, or Fold.`;
        }
      } else {
        next.over = true;
        const showdown = compareHands([...next.player, ...next.board], [...next.opponent, ...next.board]);
        if (showdown.result > 0) {
          next.stacks[user] += next.pot;
          next.winner = 'player';
          next.result = `You win with ${showdown.left.name} over ${showdown.right.name}.`;
        } else if (showdown.result < 0) {
          next.stacks[opponent] += next.pot;
          next.winner = 'opponent';
          next.result = `The opponent wins with ${showdown.right.name} over ${showdown.left.name}.`;
        } else {
          const half = Math.floor(next.pot / 2);
          next.stacks[user] += half;
          next.stacks[opponent] += next.pot - half;
          next.winner = 'tie';
          next.result = `The hand is a tie: ${showdown.left.name}. The pot is split.`;
        }
        next.pot = 0;
        next.decision = 'showdown';
        next.message = 'River betting is complete. Compare the best five-card hands.';
      }
      return next;
    });
  };

  const startPractice = () => {
    setPractice(makePracticeGame());
    setProgress((state) => ({ ...state, practiceGames: state.practiceGames + 1 }));
    setNotice('');
  };

  const startAssessment = () => {
    setAssessment({ index: 0, answers: [], finished: false });
    setAssessmentAnswer(null);
    setAssessmentResult(null);
    navigate('assessment');
  };

  const submitAssessmentAnswer = () => {
    if (assessmentAnswer === null) {
      setNotice('Choose an answer before continuing.');
      return;
    }
    const question = MODULES[assessment.index];
    const answers = [...assessment.answers, assessmentAnswer === question.correct];
    const nextIndex = assessment.index + 1;
    setNotice('');
    setAssessmentAnswer(null);
    if (nextIndex === MODULES.length) {
      const correct = answers.filter(Boolean).length;
      const percent = Math.round((correct / MODULES.length) * 100);
      setAssessment({ ...assessment, answers, index: nextIndex, finished: true });
      setAssessmentResult({ answers, correct, percent });
      setProgress((state) => ({
        ...state,
        quizHistory: [...state.quizHistory, { module: 'final', correct, percent, at: new Date().toISOString() }],
      }));
      return;
    }
    setAssessment({ ...assessment, answers, index: nextIndex });
  };

  const resetProgress = () => {
    if (!window.confirm('Reset all learning progress, quiz history, and saved settings?')) return;
    setProgress(DEFAULT_PROGRESS);
    setCurrentModule(1);
    setWalkthroughStep(0);
    setPractice(null);
    recordedPracticeCount.current = 0;
    setNotice('Progress has been reset.');
    navigate('dashboard', 1);
  };

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify({ ...progress, currentModule, lastView: view, walkthroughStep }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'poker-academy-progress.json';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Progress export downloaded.');
  };

  const importProgress = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed.version !== 1 || !Array.isArray(parsed.completedModules) || !Array.isArray(parsed.quizHistory)) {
        throw new Error('The file is not a supported Poker Academy progress export.');
      }
      const validModules = parsed.completedModules.every((id) => Number.isInteger(id) && id >= 1 && id <= MODULES.length);
      const validHistory = parsed.quizHistory.every((entry) => entry && Number.isFinite(entry.percent) && entry.percent >= 0 && entry.percent <= 100);
      const validStats = !parsed.practiceStats || ['wins', 'losses', 'ties'].every((key) => Number.isInteger(parsed.practiceStats[key]) && parsed.practiceStats[key] >= 0);
      if (!validModules || !validHistory || !validStats) throw new Error('The progress file contains invalid values.');
      const imported = {
        ...DEFAULT_PROGRESS,
        ...parsed,
        currentModule: Number.isInteger(parsed.currentModule) && parsed.currentModule >= 1 && parsed.currentModule <= MODULES.length ? parsed.currentModule : 1,
        lastView: validView(parsed.lastView) ? parsed.lastView : 'dashboard',
        walkthroughStep: Number.isInteger(parsed.walkthroughStep) ? Math.min(WALKTHROUGH.length - 1, Math.max(0, parsed.walkthroughStep)) : 0,
        practiceGames: Number.isInteger(parsed.practiceGames) && parsed.practiceGames >= 0 ? parsed.practiceGames : 0,
        practiceStats: parsed.practiceStats ?? DEFAULT_PROGRESS.practiceStats,
        settings: { ...DEFAULT_PROGRESS.settings, ...parsed.settings, reducedMotion: Boolean(parsed.settings?.reducedMotion) },
        completedModules: [...new Set(parsed.completedModules)],
      };
      setProgress(imported);
      setCurrentModule(imported.currentModule);
      setWalkthroughStep(imported.walkthroughStep);
      recordedPracticeCount.current = imported.practiceGames;
      setNotice('Progress imported successfully.');
    } catch (error) {
      setNotice(`Import rejected: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };

  const renderModuleActivity = () => {
    switch (currentModule) {
      case 2:
        return (
          <div className="activity-box">
            <h4>Identify the card</h4>
            <div className="interactive-card"><PlayingCard code={cardLabel(cardQuiz)} /></div>
            <p>Choose the rank and suit, then check your answer.</p>
            <div className="form-grid">
              <label>Rank<select aria-label="Guess card rank" value={cardGuess.rank} onChange={(event) => { setCardGuess((guess) => ({ ...guess, rank: event.target.value })); setActivityFeedback(null); }}><option value="">Select rank</option>{RANK_OPTIONS.map((rank) => <option value={rank} key={rank}>{RANK_NAMES[rank] ?? rank}</option>)}</select></label>
              <label>Suit<select aria-label="Guess card suit" value={cardGuess.suit} onChange={(event) => { setCardGuess((guess) => ({ ...guess, suit: event.target.value })); setActivityFeedback(null); }}><option value="">Select suit</option>{Object.entries(SUIT_NAMES).map(([suit, name]) => <option key={suit} value={suit}>{name}</option>)}</select></label>
            </div>
            <div className="button-row">
              <button className="primary" onClick={checkCardGuess}>Check card</button>
              <button className="secondary" onClick={() => { setCardQuiz(shuffleDeck().find((card) => card.rank !== cardQuiz.rank || card.suit !== cardQuiz.suit)); setCardGuess({ rank: '', suit: '' }); setActivityFeedback(null); }}>Draw another card</button>
            </div>
            {renderActivityFeedback()}
          </div>
        );
      case 3: {
        const left = ['AS', 'KS', 'QS', 'JS', '10S', '2D', '3C'];
        const right = ['9H', '8H', '7H', '6H', '5H', 'AD', 'KC'];
        const comparison = compareHands(left.map(cardFromCode), right.map(cardFromCode));
        return (
          <div className="activity-box">
            <h4>Compare the best five cards</h4>
            <p>Player A: A♠ K♠ Q♠ J♠ 10♠ + 2♦ 3♣</p>
            <p>Player B: 9♥ 8♥ 7♥ 6♥ 5♥ + A♦ K♣</p>
            <p>Actual evaluator: Player A — {comparison.left.name}; Player B — {comparison.right.name}.</p>
            <div className="button-row">
              <button className="choice" onClick={() => setActivityFeedback({ correct: comparison.result > 0, text: comparison.result > 0 ? `Correct. ${comparison.left.name} beats ${comparison.right.name}.` : 'Player A does not win.' })}>Player A wins</button>
              <button className="choice" onClick={() => setActivityFeedback({ correct: comparison.result < 0, text: comparison.result < 0 ? 'Correct. Player B wins.' : 'Player B does not win.' })}>Player B wins</button>
            </div>
            {renderActivityFeedback()}
            <p className="muted">Rank order, strongest first: {HAND_EXAMPLES.map(([name]) => name).join(' → ')}.</p>
          </div>
        );
      }
      case 4: {
        const positions = [
          { key: 'Dealer / Button', name: 'Button (BTN)', description: 'Holds the dealer button; usually acts last after the flop.', group: 'Late' },
          { key: 'Small Blind', name: 'Small blind (SB)', description: 'First seat clockwise from the button; posts the small blind.', group: 'Blinds' },
          { key: 'Big Blind', name: 'Big blind (BB)', description: 'Second seat clockwise from the button; posts the big blind.', group: 'Blinds' },
          { key: 'Under the Gun', name: 'Under the Gun (UTG)', description: 'First seat to act pre-flop at a full table, after the blinds.', group: 'Early' },
          { key: 'Hijack (Middle)', name: 'Hijack (HJ)', description: 'Two seats before the button in this six-seat example.', group: 'Middle' },
          { key: 'Cutoff', name: 'Cutoff (CO)', description: 'The seat immediately before the button.', group: 'Late' },
        ];
        return (
          <div className="activity-box">
            <h4>Six-seat table positions</h4>
            <figure className="position-diagram">
              <svg viewBox="0 0 640 360" role="img" aria-labelledby="position-diagram-title position-diagram-description">
                <title id="position-diagram-title">Positions around a six-seat poker table</title>
                <desc id="position-diagram-description">Under the Gun is early position; Hijack is middle; Cutoff and Button are late; Small Blind and Big Blind are the blinds. The dealer button moves clockwise after each hand.</desc>
                <defs>
                  <marker id="position-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="position-arrowhead" />
                  </marker>
                </defs>
                <ellipse cx="320" cy="177" rx="222" ry="113" className="position-table-rim" />
                <ellipse cx="320" cy="177" rx="210" ry="101" className="position-table-felt" />
                <ellipse cx="320" cy="177" rx="176" ry="75" className="position-table-line" />
                <path d="M 213 122 Q 250 102 290 112" className="position-arrow" markerEnd="url(#position-arrowhead)" />
                <path d="M 330 111 Q 365 111 401 127" className="position-arrow" markerEnd="url(#position-arrowhead)" />
                <path d="M 429 148 Q 451 174 437 197" className="position-arrow" markerEnd="url(#position-arrowhead)" />
                <path d="M 427 218 Q 405 242 375 246" className="position-arrow" markerEnd="url(#position-arrowhead)" />
                <text x="320" y="168" textAnchor="middle" className="position-direction">CLOCKWISE</text>
                <text x="320" y="190" textAnchor="middle" className="position-caption">Button moves one seat each hand</text>
                <g className="position-seat seat-early">
                  <circle cx="320" cy="48" r="34" />
                  <text x="320" y="45" textAnchor="middle">UTG</text>
                  <text x="320" y="61" textAnchor="middle" className="position-seat-sub">EARLY</text>
                </g>
                <g className="position-seat seat-middle">
                  <circle cx="515" cy="105" r="35" />
                  <text x="515" y="102" textAnchor="middle">HJ</text>
                  <text x="515" y="118" textAnchor="middle" className="position-seat-sub">MIDDLE</text>
                </g>
                <g className="position-seat seat-late">
                  <circle cx="515" cy="249" r="35" />
                  <text x="515" y="246" textAnchor="middle">CO</text>
                  <text x="515" y="262" textAnchor="middle" className="position-seat-sub">LATE</text>
                </g>
                <g className="position-seat seat-late">
                  <circle cx="320" cy="306" r="35" />
                  <text x="320" y="303" textAnchor="middle">BTN</text>
                  <text x="320" y="319" textAnchor="middle" className="position-seat-sub">LATE</text>
                </g>
                <g className="position-seat seat-blind">
                  <circle cx="125" cy="249" r="35" />
                  <text x="125" y="246" textAnchor="middle">SB</text>
                  <text x="125" y="262" textAnchor="middle" className="position-seat-sub">BLIND</text>
                </g>
                <g className="position-seat seat-blind">
                  <circle cx="125" cy="105" r="35" />
                  <text x="125" y="102" textAnchor="middle">BB</text>
                  <text x="125" y="118" textAnchor="middle" className="position-seat-sub">BLIND</text>
                </g>
              </svg>
              <figcaption>At a full table, action starts pre-flop with UTG. After the flop, the first active player clockwise from the button acts first.</figcaption>
            </figure>
            <div className="position-legend" aria-label="Position groups">
              <span><i className="seat-early" /><strong>Early</strong><small>UTG acts first before the flop.</small></span>
              <span><i className="seat-middle" /><strong>Middle</strong><small>HJ is between early and late position.</small></span>
              <span><i className="seat-late" /><strong>Late</strong><small>CO and BTN act later and get more information.</small></span>
              <span><i className="seat-blind" /><strong>Blinds</strong><small>SB and BB post forced bets before the deal.</small></span>
            </div>
            <h4>Position names</h4>
            <div className="position-reference-wrap">
              <table className="position-reference">
                <thead><tr><th scope="col">Position</th><th scope="col">Who they are</th><th scope="col">Group</th></tr></thead>
                <tbody>{positions.map(({ key, name, description, group }) => (
                  <tr key={key} className={position === key ? 'position-row-selected' : ''}>
                    <th scope="row">{name}</th><td>{description}</td><td>{group}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <h4>Explore each position</h4>
            <div className="position-selector">
              {positions.map(({ key, name, description }) => (
                <button key={key} className={position === key ? 'position selected' : 'position'} onClick={() => { setPosition(key); setPositionDetail(`${name}: ${description}`); }}>{name}</button>
              ))}
            </div>
            <p role="status">{positionDetail || 'Select a position to highlight its role in the reference table.'}</p>
          </div>
        );
      }
      case 5: {
        const total = Object.entries(chips).reduce((sum, [color, count]) => sum + CHIP_VALUES[color] * count, 0);
        const updateChip = (color, amount) => setChips((counts) => ({ ...counts, [color]: Math.max(0, counts[color] + amount) }));
        return (
          <div className="activity-box">
            <h4>Chip-value calculator</h4>
            <p>White 1 · Red 5 · Green 25 · Black 100</p>
            <div className="chip-counter-list">
              {Object.entries(CHIP_VALUES).map(([color, value]) => (
                <div className="chip-counter" key={color}><span>{color} · {value}</span><button aria-label={`Remove ${color} chip`} onClick={() => updateChip(color, -1)}>−</button><strong>{chips[color]}</strong><button aria-label={`Add ${color} chip`} onClick={() => updateChip(color, 1)}>+</button></div>
              ))}
            </div>
            <div className="result-banner">Total: {total.toLocaleString()} chips</div>
            <button className="secondary" onClick={() => { setChips({ White: 0, Red: 0, Green: 0, Black: 10 }); setNotice('A recommended starting value of 1,000 chips is set.'); }}>Load 1,000-chip stack</button>
          </div>
        );
      }
      case 6: {
        const actionDetails = [
          ['Fold', 'Give up this hand instead of matching the wager.'],
          ['Check', 'Pass without betting, but only when no bet is owed.'],
          ['Bet', 'Make the first wager in a round; for example, bet 20 when no one has bet.'],
          ['Call', 'Match the outstanding wager; for example, call 20 to stay in.'],
          ['Raise', 'Match the wager and increase it; for example, raise a 20 bet to 40 total.'],
          ['All-In', 'Commit your remaining stack. In multi-player hands, unequal stacks can create side pots.'],
        ];
        const actionAnswer = (choice) => {
          setScenarioChoice(choice);
          const valid = ['Fold', 'Call', 'Raise', 'All-In'].includes(choice);
          setActivityFeedback({ correct: valid, text: valid ? `Correct: ${choice} is available while facing a 20-chip bet.` : `${choice} is not available while facing a 20-chip bet. Call, raise, fold, or go all-in.` });
        };
        return (
          <div className="activity-box">
            <h4>What each action means</h4>
            <div className="action-list">{actionDetails.map(([name, description]) => <article key={name}><strong>{name}</strong><p>{description}</p></article>)}</div>
            <h4>Action decision</h4>
            <p>You have 100 chips. The current bet is 20; no chips are committed by you this round.</p>
            <div className="button-row">{actionDetails.map(([action]) => <button key={action} className={scenarioChoice === action ? 'choice selected' : 'choice'} onClick={() => actionAnswer(action)}>{action}</button>)}</div>
            {renderActivityFeedback()}
          </div>
        );
      }
      case 7:
        return (
          <div className="activity-box">
            <h4>Reveal the betting rounds</h4>
            <div className="round-track">{['Pre-Flop', 'Flop', 'Turn', 'River'].map((round, index) => <button key={round} className={roundIndex === index ? 'round active' : 'round'} onClick={() => setRoundIndex(index)}>{round}</button>)}</div>
            <p>Stage: {['Pre-Flop: each player has two private hole cards.', 'Flop: three community cards are revealed.', 'Turn: the fourth community card is revealed.', 'River: the fifth community card is revealed.'][roundIndex]}</p>
            <div className="board-cards">{Array.from({ length: 5 }, (_, index) => <PlayingCard key={index} code={['2S', '7D', '9H', 'QC', 'AS'][index]} hidden={index >= [0, 3, 4, 5][roundIndex]} />)}</div>
            <div className="button-row"><button className="secondary" onClick={() => setRoundIndex((index) => Math.max(0, index - 1))}>Previous round</button><button className="primary" onClick={() => setRoundIndex((index) => Math.min(3, index + 1))}>Reveal next round</button></div>
          </div>
        );
      case 8: {
        const a = ['JS', '10S', 'JD', '8C', '3H', 'QS', '9S'].map(cardFromCode);
        const b = ['AD', 'QH', 'JD', '8C', '3H', 'QS', '9S'].map(cardFromCode);
        const result = compareHands(a, b);
        return (
          <div className="activity-box">
            <h4>Who wins this showdown?</h4>
            <p>Board: J♦ 8♣ 3♥ Q♠ 9♠</p><p>Player A: J♠ 10♠ · Player B: A♦ Q♥</p>
            <p>Evaluator: Player A {result.left.name}; Player B {result.right.name}.</p>
            <button className="primary" onClick={() => setActivityFeedback({ correct: result.result > 0, text: result.result > 0 ? 'Correct: Player A wins with a straight (Q-J-10-9-8).' : 'The evaluator says Player B wins.' })}>Compare hands</button>
            {renderActivityFeedback()}
          </div>
        );
      }
      case 9:
        return (
          <div className="activity-box">
            <h4>Bet and pot calculator</h4>
            <div className="form-grid">
              <label>Player stack <input type="number" min="0" value={betting.stack} onChange={(event) => setBetting((state) => ({ ...state, stack: Math.max(0, Number(event.target.value)) }))} /></label>
              <label>Pot <input type="number" min="0" value={betting.pot} onChange={(event) => setBetting((state) => ({ ...state, pot: Math.max(0, Number(event.target.value)) }))} /></label>
              <label>Bet to call <input type="number" min="0" value={betting.currentBet} onChange={(event) => setBetting((state) => ({ ...state, currentBet: Math.max(0, Number(event.target.value)) }))} /></label>
              <label>Your bet <input type="number" min="1" value={betting.bet} onChange={(event) => setBetting((state) => ({ ...state, bet: Math.max(1, Number(event.target.value)) }))} /></label>
            </div>
            <p>Outstanding to call: {Math.min(betting.stack, betting.currentBet)} chips</p>
            <div className="button-row">
              <button className="choice" onClick={() => setBetting((s) => ({ ...s, stack: s.stack - Math.min(s.stack, s.currentBet), pot: s.pot + Math.min(s.stack, s.currentBet), outcome: `Called ${Math.min(s.stack, s.currentBet)}.` }))}>Call</button>
              <button className="choice" onClick={() => setBetting((s) => {
                if (s.currentBet > 0) return { ...s, outcome: 'A bet cannot be opened while facing a wager; call or raise.' };
                const amount = Math.min(s.stack, s.bet);
                return { ...s, stack: s.stack - amount, pot: s.pot + amount, currentBet: amount, outcome: `Bet ${amount}; stacks and pot updated.` };
              })}>Bet</button>
              <button className="choice" onClick={() => setBetting((s) => ({ ...s, outcome: s.currentBet > 0 ? 'You folded and relinquished this hand.' : 'No bet is outstanding; you may check.' }))}>Fold / Check</button>
            </div>
            {betting.outcome && <p role="status">{betting.outcome}</p>}
          </div>
        );
      case 10: {
        const hands = [
          ['A-A', 'Strong'], ['A-K', 'Strong'], ['A-Q', 'Strong'], ['5-5', 'Speculative'], ['8-7 suited', 'Speculative'], ['7-2 offsuit', 'Weak'],
        ];
        return (
          <div className="activity-box"><h4>Classify a starting hand</h4><p>Choose a category for each example.</p><div className="choice-list">{hands.map(([hand, category]) => <div className="choice-line" key={hand}><strong>{hand}</strong>{['Strong', 'Speculative', 'Weak'].map((answer) => <button key={answer} className="choice" onClick={() => setActivityFeedback({ correct: answer === category, text: answer === category ? `${hand}: correct, ${category.toLowerCase()}.` : `${hand}: try again. The lesson classifies this as ${category.toLowerCase()}.` })}>{answer}</button>)}</div>)}</div>{renderActivityFeedback()}</div>
        );
      }
      case 11:
        return <ScenarioChoices title="Position advantage" prompt="You are first to act pre-flop with a weak offsuit hand. What is the sound beginner choice?" options={['Fold and wait for a better spot', 'Play every hand because it is free', 'Raise regardless of position']} correct={0} />;
      case 12:
        return <ScenarioChoices title="A bluffing decision" prompt="The board is coordinated and your opponent has shown strength. You hold only a weak draw. What is a cautious beginner choice?" options={['Consider folding rather than forcing a bluff', 'Bluff every time', 'Call any bet automatically']} correct={0} />;
      case 13:
        return <ScenarioChoices title="Spot the mistake" prompt="A player calls every bet hoping to hit a draw, ignores position, and acts before their turn. Name the issue." options={['Chasing without odds and ignoring turn order', 'Protecting cards', 'Using a dealer button']} correct={0} />;
      case 14:
        return (
          <div className="activity-box">
            <h4>Home tournament planner</h4>
            <label>Starting players (2–6) <input aria-label="Number of players" type="number" min="2" max="6" value={players} onChange={(event) => { const count = Math.min(6, Math.max(2, Number(event.target.value))); setPlayers(count); setRemainingPlayers(count); }} /></label>
            <p>Starting stacks: {players} × 1,000 chips · starting blinds: 10/20 · levels: every 20 minutes.</p>
            <p>Level {blindLevel + 1} blinds: {10 * (2 ** blindLevel)}/{20 * (2 ** blindLevel)} · next level in {String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:{String(secondsRemaining % 60).padStart(2, '0')}</p>
            <p>Players remaining: {remainingPlayers}</p>
            <button className="primary" onClick={() => setBlindsStarted((started) => !started)}>{blindsStarted ? 'Stop blind timer' : 'Start 20-minute blind timer'}</button>
            <button className="secondary" disabled={remainingPlayers <= 1} onClick={() => setRemainingPlayers((count) => Math.max(1, count - 1))}>Record player elimination</button>
            {remainingPlayers === 1 && <p role="status">Tournament winner: one player remains.</p>}
            {blindsStarted && <p role="status">Blind timer running. Increase the level every 20 minutes.</p>}
          </div>
        );
      case 15:
        return <ScenarioChoices title="Etiquette scenario" prompt="You are excited to call. What do you do?" options={['Wait for your turn and announce “call” clearly', 'Act while another player is thinking', 'Throw chips across the table']} correct={0} />;
      case 16: {
        const steps = ['Show and explain all ten hand rankings.', 'Deal a few practice hands face up.', 'Discuss decisions together without pressure.', 'Introduce chip values and blinds.', 'Play a slow heads-up game.'];
        return <div className="activity-box"><h4>Beginner teaching script</h4><p>Step {teachingStep + 1} of {steps.length}: {steps[teachingStep]}</p><div className="button-row"><button className="secondary" onClick={() => setTeachingStep((step) => Math.max(0, step - 1))}>Previous step</button><button className="primary" onClick={() => setTeachingStep((step) => Math.min(steps.length - 1, step + 1))}>Next teaching step</button><button className="choice" onClick={() => setTeachingStep(0)}>Restart script</button></div></div>;
      }
      case 17:
        return (
          <div className="activity-box">
            <h4>Flush-draw practice</h4><p>Your hand: A♠ K♠ · Flop: 2♠ 7♦ 9♠.</p>
            <p>Nine spades remain as flush outs. The opponent bets 50 into 100; calling costs 50 to contest a current 150-chip pot.</p>
            <div className="button-row">{['Call', 'Fold', 'Raise'].map((choice) => <button className="choice" key={choice} onClick={() => setActivityFeedback({ correct: choice === 'Call', text: choice === 'Call' ? 'Reasonable practice call: a nine-out draw is about 36% to complete by the river using the Rule of 4. This assumes clean outs and is an estimate, not a guarantee.' : `You chose ${choice}. Consider pot odds, opponent range, and your draw before deciding.` })}>{choice}</button>)}</div>
            {renderActivityFeedback()}
          </div>
        );
      case 18: {
        const selectedBoard = outsBoard.slice(0, 5 - cardsToCome);
        const selectedCards = [...outsHand, ...selectedBoard];
        const detected = findDrawOuts(selectedCards);
        const activeOuts = useDetectedOuts && detected.count !== null ? detected.count : outs;
        let probability = 0;
        try { probability = calculateOutsProbability(Number(activeOuts), Number(cardsToCome)); } catch (error) { setNotice(error.message); }
        const usedCards = new Set([...outsHand, ...outsBoard]);
        const cardSelect = (value, label, onChange, excluding) => (
          <label key={label}>{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
            {CARD_OPTIONS.map((code) => <option key={code} value={code} disabled={code !== value && excluding.has(code)}>{face(cardFromCode(code))}</option>)}
          </select></label>
        );
        return (
          <div className="activity-box">
            <h4>Outs calculator</h4>
            <div className="form-grid">
              {outsHand.map((code, index) => cardSelect(code, `Hole card ${index + 1}`, (value) => setOutsHand((hand) => hand.map((card, cardIndex) => cardIndex === index ? value : card)), usedCards))}
              {selectedBoard.map((code, index) => cardSelect(code, `Community card ${index + 1}`, (value) => setOutsBoard((board) => board.map((card, cardIndex) => cardIndex === index ? value : card)), usedCards))}
              <label>Cards to come <select value={cardsToCome} onChange={(event) => setCardsToCome(Number(event.target.value))}><option value="1">One (turn or river)</option><option value="2">Two (from the flop)</option></select></label>
              <label>Manual outs <input aria-label="Number of outs" type="number" min="0" max="47" value={outs} disabled={useDetectedOuts && detected.count !== null} onChange={(event) => setOuts(Math.min(47, Math.max(0, Number(event.target.value))))} /></label>
            </div>
            <p>Detected: {detected.type}</p>
            <div className="button-row"><button className="choice" onClick={() => setUseDetectedOuts(true)}>Use detected outs</button><button className="choice" onClick={() => setUseDetectedOuts(false)}>Enter outs manually</button></div>
            <div className="result-banner">Using {activeOuts} outs: estimated chance {(probability * 100).toFixed(1)}% · Rule of {cardsToCome === 1 ? 2 : 4}: about {activeOuts * (cardsToCome === 1 ? 2 : 4)}%</div>
            <p className="muted">The exact calculation assumes unseen cards are unknown and each out is clean. A card that helps an opponent may not be a clean out.</p>
          </div>
        );
      }
      case 19:
        return (
          <div className="activity-box">
            <h4>Search the poker glossary</h4>
            <label>Search terms <input type="search" value={glossaryQuery} onChange={(event) => setGlossaryQuery(event.target.value)} placeholder="Try “kicker” or “board”" /></label>
            <dl className="glossary-list">{GLOSSARY.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(glossaryQuery.toLowerCase())).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl>
          </div>
        );
      case 20:
        return (
          <div className="activity-box printable">
            <h4>First-game cheat sheet</h4>
            <p><strong>Rounds:</strong> Pre-Flop → Flop (3 cards) → Turn (1) → River (1) → Showdown.</p>
            <p><strong>Actions:</strong> Fold, check (only if no bet is owed), bet, call, raise, all-in.</p>
            <p><strong>Hand rankings:</strong> {HAND_EXAMPLES.map(([name]) => name).join(' → ')}.</p>
            <p><strong>Chips:</strong> White 1 · Red 5 · Green 25 · Black 100 · <strong>Stack:</strong> 1,000 · <strong>Blinds:</strong> 10/20.</p>
            <p><strong>Home game:</strong> 2–6 players, agree rules, protect cards, act in turn, announce actions clearly.</p>
            <button className="primary no-print" onClick={() => window.print()}>Print cheat sheet</button>
          </div>
        );
      default:
        return <div className="activity-box"><p>Use the lesson and quick check to practice the key idea.</p></div>;
    }
  };

  const showDashboard = (
    <main className="content">
      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow accent">Texas Hold’em · from zero to first game</p>
          <h2>Learn the game, build confidence, and play your first hand.</h2>
          <p>A step-by-step poker academy: learn the rules, practice decisions, and understand every chip.</p>
          <div className="cta-row">
            <button className="primary" onClick={() => navigate('module', nextUncompletedModule())}>Start Learning</button>
            <button className="secondary" onClick={() => navigate('practice')}>Play Practice Game</button>
          </div>
        </div>
        <div className="hero-stats">
          {[['Modules', '20'], ['Progress', `${progressPercent}%`], ['Level', completedCount >= 10 ? 'Learner' : 'Beginner']].map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
      </section>
      <section className="dashboard-grid panel">
        <div className="summary-card">
          <p className="eyebrow">Learning Journey</p><h3>Your progress</h3>
          <div className="progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${progressPercent}%` }} /></div>
          <ul className="summary-list">
            <li><strong>{MODULES.length}</strong> total modules</li>
            <li><strong>{completedCount}</strong> completed</li>
            <li><strong>{progress.practiceGames}</strong> practice hands · {progress.practiceStats.wins} wins / {progress.practiceStats.losses} losses / {progress.practiceStats.ties} ties</li>
            <li><strong>{quizAverage}%</strong> average quiz score</li>
          </ul>
          <button className="primary" onClick={() => navigate('module', nextUncompletedModule())}>Continue Learning</button>
          <p className="muted">Progress is stored on this device only; it may not transfer to another browser or device.</p>
        </div>
        <div className="module-card">
          <p className="eyebrow">Roadmap</p><h3>Learning modules</h3>
          <div className="section-list">{MODULES.map((item, index) => <button key={item.title} className="module-link" onClick={() => navigate('module', index + 1)}><span>{String(index + 1).padStart(2, '0')} · {item.part}</span><strong>{item.title}</strong><span>{progress.completedModules.includes(index + 1) ? '✓ Complete' : 'Open lesson'}</span></button>)}</div>
        </div>
      </section>
      <section className="panel achievements">
        <p className="eyebrow">Milestones</p><h3>Knowledge badges</h3>
        <div className="achievement-grid">{achievements.map(([name, earned]) => <div className={earned ? 'achievement earned' : 'achievement'} key={name}><span aria-hidden="true">{earned ? '✦' : '◇'}</span><strong>{name}</strong><small>{earned ? 'Earned' : 'Keep learning'}</small></div>)}</div>
      </section>
      <section className="panel dashboard-actions">
        <p className="eyebrow">Put it together</p><h3>Your First Game</h3>
        <p>Walk through the exact heads-up example, then try independent practice against a simple computer opponent.</p>
        <div className="button-row"><button className="primary" onClick={() => navigate('walkthrough')}>Open first-game walkthrough</button><button className="secondary" onClick={() => navigate('assessment')}>Start final assessment</button></div>
      </section>
    </main>
  );

  const canAdvanceModule = quizFeedback !== null && progress.completedModules.includes(currentModule);
  const showModule = (
    <main className="content">
      <section className="panel module-panel">
        <div className="module-header">
          <div><p className="eyebrow">{module.part} · Module {currentModule} of 20</p><h2>{module.title}</h2></div>
          <div className="module-controls"><button onClick={previousModule} disabled={currentModule === 1}>Previous</button><button onClick={nextModule} disabled={currentModule === MODULES.length || !canAdvanceModule}>Next</button></div>
        </div>
        <p className="module-intro">{module.intro}</p>
        <ul className="lesson-points">{module.points.map((point) => <li key={point}>{point}</li>)}</ul>
        {currentModule === 3 && <HandRankingList />}
        {renderModuleActivity()}
        <div className="quiz-box">
          <p className="eyebrow">Quick check</p><h3>{module.question}</h3>
          <div className="quick-choices">{module.choices.map((choice, index) => <button key={choice} className={selectedAnswer === index ? 'choice selected' : 'choice'} onClick={() => { setSelectedAnswer(index); setQuizFeedback(null); }}>{choice}</button>)}</div>
          <div className="button-row"><button className="primary" onClick={submitModuleQuiz}>Check answer</button><button className="secondary" onClick={() => { setSelectedAnswer(null); setQuizFeedback(null); }}>Try again</button></div>
          {quizFeedback && <p className={quizFeedback.correct ? 'feedback correct' : 'feedback incorrect'} role="status">{quizFeedback.text}</p>}
        </div>
        <div className="module-footer">
          <button className="secondary" onClick={completeModule}>{progress.completedModules.includes(currentModule) ? 'Module completed ✓' : 'Mark lesson complete'}</button>
          <span>{completedCount} of 20 lessons completed</span>
          {canAdvanceModule && currentModule < MODULES.length && <button className="primary" onClick={() => navigate('module', currentModule + 1)}>Next lesson →</button>}
        </div>
      </section>
    </main>
  );

  const showWalkthrough = (
    <main className="content">
      <section className="panel walkthrough">
        <div className="module-header">
          <div><p className="eyebrow">Your First Game · 1,000 chips each · 10/20 blinds</p><h2>Play through the example</h2></div>
          <div className="module-controls"><button onClick={() => { setWalkthroughStep(0); setWalkthroughAnswer(null); setNotice('Walkthrough restarted at the blinds.'); }}>Restart walkthrough</button></div>
        </div>
        <div className="button-row mode-buttons"><button className={walkthroughMode === 'guided' ? 'choice selected' : 'choice'} onClick={() => setWalkthroughMode('guided')}>Guided mode</button><button className={walkthroughMode === 'independent' ? 'choice selected' : 'choice'} onClick={() => setWalkthroughMode('independent')}>Independent mode</button><span>Step {walkthroughStep + 1} of {WALKTHROUGH.length}: {currentWalkthrough.name}</span></div>
        <div className="table-layout">
          <PlayerPanel name="Player A · Dealer / Small Blind" cards={['JS', '10S']} stack={currentWalkthrough.a} />
          <div className="table-center"><p className="eyebrow">{currentWalkthrough.name}</p><div className="pot-box">Pot: {currentWalkthrough.pot}</div><div className="board-cards">{Array.from({ length: 5 }, (_, index) => <PlayingCard key={index} code={currentWalkthrough.board[index] || '?'} hidden={!currentWalkthrough.board[index]} />)}</div><p className="muted">Community cards are revealed as you advance.</p></div>
          <PlayerPanel name="Player B · Big Blind" cards={['AD', 'QH']} stack={currentWalkthrough.b} hidden={walkthroughStep < 5} />
        </div>
        <div className="walkthrough-detail">
          <h3>{currentWalkthrough.question}</h3>
          {walkthroughMode === 'guided' ? <div className="button-row"><button className="primary" onClick={() => { setNotice(currentWalkthrough.reason); setWalkthroughStep((step) => Math.min(WALKTHROUGH.length - 1, step + 1)); }}>Explain &amp; advance</button><button className="secondary" onClick={() => { setNotice(currentWalkthrough.reason); }}>Review explanation</button><button className="choice" onClick={() => { setWalkthroughStep((step) => Math.max(0, step - 1)); setNotice('Previous step restored.'); }}>Previous step</button></div> : <><div className="quick-choices">{currentWalkthrough.options.map((option, index) => <button key={option} className={walkthroughAnswer === index ? 'choice selected' : 'choice'} onClick={() => setWalkthroughAnswer(index)}>{option}</button>)}</div><button className="primary" onClick={answerWalkthrough}>Submit decision</button></>}
          <div className="state-grid"><div><span>Player A chips</span><strong>{currentWalkthrough.a.toLocaleString()}</strong></div><div><span>Player B chips</span><strong>{currentWalkthrough.b.toLocaleString()}</strong></div><div><span>Pot</span><strong>{currentWalkthrough.pot}</strong></div></div>
          <p className="muted">Chip total: {(currentWalkthrough.a + currentWalkthrough.b + currentWalkthrough.pot).toLocaleString()} / 2,000</p>
          <div className="button-row"><button className="secondary" onClick={() => { setWalkthroughStep((step) => Math.max(0, step - 1)); setNotice('Previous step restored.'); }}>Previous step</button><button className="primary" disabled={walkthroughMode === 'independent' || walkthroughStep === WALKTHROUGH.length - 1} onClick={() => { setWalkthroughStep((step) => Math.min(WALKTHROUGH.length - 1, step + 1)); setNotice('Walkthrough advanced.'); }}>Next step</button></div>
        </div>
      </section>
    </main>
  );

  const showPractice = (
    <main className="content">
      <section className="panel">
        <p className="eyebrow">Independent Practice</p><h2>Heads-up practice table</h2>
        <p className="module-intro">Practice decisions with play chips only. This lightweight opponent follows a simple check/bet pattern; it is not strategic advice.</p>
        {(!practice || practice.over) && <div className="button-row"><button className="primary" onClick={startPractice}>{practice ? 'Deal a new hand' : 'Deal first hand'}</button></div>}
        {practice && <>
          <div className="table-layout practice-table">
            <PlayerPanel name="You" cards={practice.player.map(cardLabel)} stack={practice.stacks[0]} />
            <div className="table-center"><p className="eyebrow">{['Pre-Flop', 'Flop', 'Turn', 'River'][practice.stage] || 'Showdown'}</p><div className="pot-box">Pot: {practice.pot}</div><div className="board-cards">{practice.board.map((card, index) => <PlayingCard key={index} code={cardLabel(card)} hidden={index >= [0, 3, 4, 5][practice.stage]} />)}</div><p>{practice.message}</p></div>
            <PlayerPanel name="Computer Opponent" cards={practice.opponent.map(cardLabel)} stack={practice.stacks[1]} hidden={!practice.over} />
          </div>
          <div className="state-grid"><div><span>Your stack</span><strong>{practice.stacks[0]}</strong></div><div><span>Opponent</span><strong>{practice.stacks[1]}</strong></div><div><span>Current pot</span><strong>{practice.pot}</strong></div></div>
          {!practice.over && <div className="button-row practice-actions">
            <button className="choice" onClick={() => setPracticeDecision('Fold')}>Fold</button>
            <button className="choice" onClick={() => setPracticeDecision('Check')}>Check</button>
            <button className="choice" onClick={() => setPracticeDecision('Call')}>Call</button>
            <button className="choice" onClick={() => setPracticeDecision('Bet', 20)}>Bet 20</button>
            <button className="choice" onClick={() => setPracticeDecision('Raise', 20)}>Raise 20</button>
            <button className="choice" onClick={() => setPracticeDecision('All-In')}>All-In</button>
          </div>}
          {practice.result && <div className="result-banner" role="status"><p>{practice.result}</p>{practiceShowdown && <div className="showdown-summary"><p>Your best five: {practiceShowdown.left.name} — {practiceShowdown.left.cards.map(face).join(' ')}</p><p>Opponent best five: {practiceShowdown.right.name} — {practiceShowdown.right.cards.map(face).join(' ')}</p></div>}</div>}
        </>}
      </section>
    </main>
  );

  const showAssessment = (
    <main className="content">
      <section className="panel">
        <p className="eyebrow">Comprehensive assessment · passing score 80%</p><h2>Check your poker knowledge</h2>
        {!assessment && <button className="primary" onClick={startAssessment}>Start assessment</button>}
        {assessment && !assessment.finished && <div className="quiz-box">
          <p>Question {assessment.index + 1} of {MODULES.length} · {MODULES[assessment.index].part}</p>
          <h3>{MODULES[assessment.index].question}</h3>
          <div className="quick-choices">{MODULES[assessment.index].choices.map((choice, index) => <button key={choice} className={assessmentAnswer === index ? 'choice selected' : 'choice'} onClick={() => setAssessmentAnswer(index)}>{choice}</button>)}</div>
          <button className="primary" onClick={submitAssessmentAnswer}>{assessment.index === MODULES.length - 1 ? 'Finish assessment' : 'Submit & continue'}</button>
        </div>}
        {assessmentResult && <div className="result-banner"><h3>{assessmentResult.correct} / {MODULES.length} correct · {assessmentResult.percent}%</h3><p>Correct: {assessmentResult.correct} · Incorrect: {MODULES.length - assessmentResult.correct}</p><p>{assessmentResult.percent >= 80 ? 'Passed — well played.' : 'Not quite 80%; review the suggested modules and retake when ready.'}</p><p>Review: {assessmentResult.answers.map((correct, index) => !correct ? MODULES[index].title : null).filter(Boolean).join(', ') || 'No revision topics.'}</p><button className="primary" onClick={startAssessment}>Retake assessment</button></div>}
      </section>
    </main>
  );

  const showSettings = (
    <main className="content"><section className="panel"><p className="eyebrow">On this device</p><h2>Settings &amp; saved progress</h2>
      <p className="module-intro">Learning progress is saved only in this browser’s LocalStorage. It is not uploaded and does not automatically transfer to another browser or device.</p>
      <label className="toggle-row"><input type="checkbox" checked={progress.settings.reducedMotion} onChange={(event) => { const reducedMotion = event.target.checked; setProgress((state) => ({ ...state, settings: { ...state.settings, reducedMotion } })); document.documentElement.classList.toggle('reduce-motion', reducedMotion); }} /> Reduce decorative animations</label>
      <div className="button-row"><button className="secondary" onClick={exportProgress}>Export progress JSON</button><button className="secondary" onClick={() => importInput.current?.click()}>Import progress JSON</button><input ref={importInput} className="file-input" aria-label="Select progress JSON file" type="file" accept="application/json,.json" onChange={importProgress} /><button className="danger" onClick={resetProgress}>Reset all progress</button></div>
      <p>Completed lessons: {completedCount} · Quiz attempts: {progress.quizHistory.length} · Practice: {progress.practiceGames} hands, {progress.practiceStats.wins} wins, {progress.practiceStats.losses} losses, {progress.practiceStats.ties} ties</p>
    </section></main>
  );

  return (
    <div className={`app-shell ${progress.settings.reducedMotion ? 'reduce-motion' : ''}`}>
      <div className="roulette-bg" aria-hidden="true"><div className="roulette-wheel"><span className="wheel-pointer" /><div className="wheel-center" /></div></div>
      <header className="topbar">
        <button className="brand-wrap brand-button" onClick={() => navigate('dashboard')} aria-label="Poker Academy dashboard"><span className="brand-mark">♠</span><span><span className="eyebrow">Poker Academy</span><strong>Master the Game</strong></span></button>
        <button className="nav-toggle" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>Menu</button>
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <button onClick={() => navigate('dashboard')}>Dashboard</button>
          <button onClick={() => navigate('dashboard')}>Modules</button>
          <button onClick={() => navigate('walkthrough')}>First Game</button>
          <button onClick={() => navigate('practice')}>Practice</button>
          <button onClick={() => navigate('assessment')}>Assessment</button>
          <button onClick={() => navigate('settings')}>Settings</button>
        </nav>
      </header>
      {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      {view === 'dashboard' && showDashboard}
      {view === 'module' && showModule}
      {view === 'walkthrough' && showWalkthrough}
      {view === 'practice' && showPractice}
      {view === 'assessment' && showAssessment}
      {view === 'settings' && showSettings}
      <footer className="app-footer"><span>Practice with play chips only · no real-money gambling</span><button onClick={() => navigate('settings')}>Progress &amp; Settings</button></footer>
    </div>
  );
}

function ScenarioChoices({ title, prompt, options, correct }) {
  const [feedback, setFeedback] = useState(null);
  return (
    <div className="activity-box">
      <h4>{title}</h4>
      <p>{prompt}</p>
      <div className="quick-choices">{options.map((option, index) => <button key={option} className="choice" onClick={() => setFeedback({ correct: index === correct, text: index === correct ? `Correct. ${option}.` : 'Try again. Consider the lesson before choosing.' })}>{option}</button>)}</div>
      {feedback && <p className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`} role="status">{feedback.text}</p>}
    </div>
  );
}

function PlayerPanel({ name, cards, stack, hidden = false }) {
  return <div className="player-panel"><div className="player-header"><span>{name}</span></div><div className="hole-cards">{cards.map((code, index) => <PlayingCard key={`${code}-${index}`} code={code} hidden={hidden} />)}</div><div className="chip-stack">{Number(stack).toLocaleString()} chips</div></div>;
}

function HandRankingList() {
  return <div className="hand-ranking-list"><h3>All ten hand ranks, strongest first</h3>{HAND_EXAMPLES.map(([name, cards, definition], index) => <article className="hand-example" key={name}><span className="rank-number">{index + 1}</span><div><strong>{name}</strong><p>{cards} — {definition}</p></div></article>)}</div>;
}

export default App;
