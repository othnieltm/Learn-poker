import { useMemo, useState } from 'react';

const modules = [
  { id: 1, title: 'Introduction to Poker', section: 'Understanding Poker' },
  { id: 2, title: 'Understanding Playing Cards', section: 'Understanding Poker' },
  { id: 3, title: 'Poker Hand Rankings', section: 'Understanding Poker' },
  { id: 4, title: 'The Poker Table and Player Positions', section: 'How the Game Works' },
  { id: 5, title: 'Setting Up a Poker Game', section: 'How the Game Works' },
  { id: 6, title: 'Poker Actions', section: 'How the Game Works' },
  { id: 7, title: 'The Four Betting Rounds', section: 'Learning to Play' },
  { id: 8, title: 'Understanding the Showdown', section: 'Learning to Play' },
  { id: 9, title: 'Betting and Pot Management', section: 'Learning to Play' },
  { id: 10, title: 'Understanding Starting Hands', section: 'Learning to Play Better' },
  { id: 11, title: 'Poker Strategy Fundamentals', section: 'Learning to Play Better' },
  { id: 12, title: 'Bluffing and Reading Opponents', section: 'Learning to Play Better' },
  { id: 13, title: 'Common Beginner Mistakes', section: 'Learning to Play Better' },
  { id: 14, title: 'Organizing a Home Poker Game', section: 'Playing with Friends' },
  { id: 15, title: 'Poker Etiquette', section: 'Playing with Friends' },
  { id: 16, title: 'Teaching Someone Else to Play', section: 'Playing with Friends' },
  { id: 17, title: 'Guided Practice Hands', section: 'Practice and Reference' },
  { id: 18, title: 'Poker Mathematics', section: 'Practice and Reference' },
  { id: 19, title: 'Poker Glossary', section: 'Practice and Reference' },
  { id: 20, title: 'First-Game Cheat Sheet', section: 'Practice and Reference' },
];

const firstGameSteps = [
  {
    title: 'Posting the Blinds',
    stage: 'Blinds',
    chips: { a: 990, b: 980, pot: 30 },
    action: 'Player A posts 10. Player B posts 20.',
    explanation: 'The blinds force action and keep the pot alive before cards are seen.',
  },
  {
    title: 'Pre-Flop',
    stage: 'Pre-Flop',
    chips: { a: 960, b: 960, pot: 80 },
    action: 'Player A calls 10, Player B raises to 40, Player A calls.',
    explanation: 'Both players have invested to see the flop, and the pot grows to 80.',
  },
  {
    title: 'The Flop',
    stage: 'Flop',
    chips: { a: 920, b: 920, pot: 160 },
    board: ['J♦', '8♣', '3♥'],
    action: 'Player B bets 40. Player A calls.',
    explanation: 'Player A makes a pair of Jacks while Player B still has Ace-high.',
  },
  {
    title: 'The Turn',
    stage: 'Turn',
    chips: { a: 860, b: 860, pot: 280 },
    board: ['J♦', '8♣', '3♥', 'Q♠'],
    action: 'Player B bets 60. Player A calls.',
    explanation: 'Player B improves to a pair of Queens while Player A still has a pair of Jacks.',
  },
  {
    title: 'The River',
    stage: 'River',
    chips: { a: 760, b: 760, pot: 480 },
    board: ['J♦', '8♣', '3♥', 'Q♠', '9♠'],
    action: 'Player B checks. Player A bets 100. Player B calls.',
    explanation: 'Player A completes a straight: 8-9-10-J-Q.',
  },
  {
    title: 'Showdown',
    stage: 'Showdown',
    chips: { a: 1240, b: 760, pot: 480 },
    board: ['J♦', '8♣', '3♥', 'Q♠', '9♠'],
    action: 'Reveal hole cards and award the pot to Player A.',
    explanation: 'Player A wins with a straight beating Player B’s pair of Queens.',
  },
];

const handRanks = ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'One Pair', 'High Card'];
const actions = ['Fold', 'Check', 'Bet', 'Call', 'Raise', 'All-In'];

function App() {
  const [currentModule, setCurrentModule] = useState(1);
  const [firstGameStep, setFirstGameStep] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const progress = useMemo(() => {
    const completed = Math.min(currentModule, modules.length);
    const percent = Math.round((completed / modules.length) * 100);
    return { completed, percent };
  }, [currentModule]);

  const currentStep = firstGameSteps[firstGameStep];

  const nextFirstGameStep = () => setFirstGameStep((step) => Math.min(step + 1, firstGameSteps.length - 1));
  const prevFirstGameStep = () => setFirstGameStep((step) => Math.max(step - 1, 0));

  return (
    <div className="app-shell">
      <div className="roulette-bg" aria-hidden="true">
        <div className="roulette-wheel">
          <div className="wheel-center" />
        </div>
      </div>

      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">♠</div>
          <div>
            <p className="eyebrow">Poker Academy</p>
            <h1>Master the Game</h1>
          </div>
        </div>

        <button className="nav-toggle" onClick={() => setShowMenu((v) => !v)}>
          Menu
        </button>

        <nav className={`main-nav ${showMenu ? 'open' : ''}`}>
          <button onClick={() => setCurrentModule(1)}>Dashboard</button>
          <button onClick={() => setCurrentModule(4)}>Modules</button>
          <button onClick={() => setCurrentModule(20)}>Cheat Sheet</button>
          <button onClick={() => setCurrentModule(7)}>Practice</button>
        </nav>
      </header>

      <main className="content">
        <section className="hero panel">
          <div className="hero-copy">
            <p className="eyebrow accent">Texas Hold&apos;em from zero to first game</p>
            <h2>Learn the game, build confidence, and play your first hand.</h2>
            <p>
              This interactive course turns the PDF into an engaging beginner experience with clear lessons,
              quizzes, and a guided heads-up walkthrough.
            </p>
            <div className="cta-row">
              <button className="primary" onClick={() => setCurrentModule(1)}>Start Learning</button>
              <button className="secondary" onClick={() => setCurrentModule(7)}>Play Practice Game</button>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <span>Modules</span>
              <strong>20</strong>
            </div>
            <div className="stat-card">
              <span>Progress</span>
              <strong>{progress.percent}%</strong>
            </div>
            <div className="stat-card">
              <span>Level</span>
              <strong>Beginner</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-grid panel">
          <div className="summary-card">
            <p className="eyebrow">Learning Journey</p>
            <h3>Current status</h3>
            <div className="progress-bar"><span style={{ width: `${progress.percent}%` }} /></div>
            <ul className="summary-list">
              <li><strong>{modules.length}</strong> total modules</li>
              <li><strong>{progress.completed}</strong> completed</li>
              <li><strong>0</strong> practice games</li>
              <li><strong>0%</strong> quiz performance</li>
            </ul>
            <button className="primary" onClick={() => setCurrentModule(Math.min(currentModule + 1, modules.length))}>Continue Learning</button>
          </div>

          <div className="module-card">
            <p className="eyebrow">Roadmap</p>
            <h3>Major sections</h3>
            <div className="section-list">
              <div><span>Part I</span><strong>Understanding Poker</strong></div>
              <div><span>Part II</span><strong>How the Game Works</strong></div>
              <div><span>Part III</span><strong>Learning to Play</strong></div>
              <div><span>Part IV</span><strong>Learning to Play Better</strong></div>
              <div><span>Part V</span><strong>Playing with Friends</strong></div>
              <div><span>Part VI</span><strong>Practice and Reference</strong></div>
            </div>
          </div>
        </section>

        <section className="module-panel panel">
          <div className="module-header">
            <div>
              <p className="eyebrow">Module {currentModule}</p>
              <h3>{modules[currentModule - 1]?.title ?? 'Learning Dashboard'}</h3>
            </div>
            <div className="module-controls">
              <button onClick={() => setCurrentModule((m) => Math.max(1, m - 1))}>Previous</button>
              <button onClick={() => setCurrentModule((m) => Math.min(modules.length, m + 1))}>Next</button>
            </div>
          </div>

          <div className="tag-row">
            {handRanks.map((rank) => (<span key={rank} className="tag">{rank}</span>))}
          </div>

          <div className="content-block">
            <h4>What is Texas Hold&apos;em?</h4>
            <p>
              Texas Hold&apos;em is a community-card poker game where each player gets private cards and uses shared
              cards to make the best five-card hand. Players bet over multiple rounds while trying to win the pot.
            </p>
          </div>

          <div className="content-grid">
            <article className="info-box">
              <h4>Core actions</h4>
              <ul>
                {actions.map((action) => <li key={action}>{action}</li>)}
              </ul>
            </article>
            <article className="info-box">
              <h4>Betting rounds</h4>
              <ul>
                <li>Pre-Flop</li>
                <li>Flop</li>
                <li>Turn</li>
                <li>River</li>
              </ul>
            </article>
          </div>

          <div className="quiz-box">
            <h4>Quick quiz</h4>
            <p>Which hand ranks higher: a flush or a straight?</p>
            <div className="quick-choices">
              <button className="choice">Straight</button>
              <button className="choice">Flush</button>
            </div>
          </div>
        </section>

        <section className="panel walkthrough">
          <div className="module-header">
            <div>
              <p className="eyebrow">Your First Game</p>
              <h3>Heads-up walkthrough</h3>
            </div>
            <div className="module-controls">
              <button onClick={prevFirstGameStep}>Replay</button>
              <button onClick={nextFirstGameStep}>Next Step</button>
            </div>
          </div>

          <div className="table-layout">
            <div className="player-panel">
              <div className="player-header"><span>Player A</span> <span>Dealer / Small Blind</span></div>
              <div className="hole-cards">
                <div className="card">J♠</div>
                <div className="card">10♠</div>
              </div>
              <div className="chip-stack">1,000 chips</div>
            </div>

            <div className="table-center">
              <div className="pot-box">Pot: {currentStep.chips.pot}</div>
              <div className="board-cards">
                {(currentStep.board ?? ['?', '?', '?', '?', '?']).map((card, index) => (
                  <div key={`${card}-${index}`} className="card board-card">{card}</div>
                ))}
              </div>
            </div>

            <div className="player-panel">
              <div className="player-header"><span>Player B</span> <span>Big Blind</span></div>
              <div className="hole-cards">
                <div className="card">A♦</div>
                <div className="card">Q♥</div>
              </div>
              <div className="chip-stack">1,000 chips</div>
            </div>
          </div>

          <div className="walkthrough-detail">
            <h4>{currentStep.title}</h4>
            <p>{currentStep.action}</p>
            <p>{currentStep.explanation}</p>
            <div className="state-grid">
              <div><span>Player A</span><strong>{currentStep.chips.a}</strong></div>
              <div><span>Player B</span><strong>{currentStep.chips.b}</strong></div>
              <div><span>Pot</span><strong>{currentStep.chips.pot}</strong></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
