# Master the Game

A browser-only Texas Hold'em learning app built with React and Vite. Learning progress is stored in the browser's LocalStorage; there is no account, backend, or real-money play.

## Run locally

```sh
npm install
npm run dev
```

## Build and test

```sh
npm test
npm run build
npm run preview
```

The poker-engine test suite uses Node's built-in test runner and does not require an additional testing dependency.

## Deploy to Vercel

- Framework preset: **Vite**
- Root directory: the folder containing this README and `package.json`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: leave the default (`npm install`)

The build script invokes Vite's JavaScript CLI through Node instead of relying on the executable bit of `node_modules/.bin/vite`.

## Learning and practice

The dashboard links to 20 lessons and individual module checks. The app also includes a chip calculator, position selector, searchable glossary, hand evaluation examples, a first-game walkthrough, outs calculator, printable cheat sheet, a final assessment, and a heads-up play-chip practice table.

Progress exports are JSON files. Import accepts the current versioned format and validates the module and quiz data before applying it. Progress can be cleared from Settings after confirmation.

## Notes

The computer opponent uses intentionally simple actions for beginner practice; it is not intended to model expert play. The walkthrough follows the supplied example's fixed cards and chip totals. Probability tools explain estimates and do not guarantee poker outcomes.
