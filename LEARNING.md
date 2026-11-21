# SimWise learning log

## 2026-11-21: planning, and keeping long sessions on track
- **Client-side vs server-side storage.** WardWise keeps packs in each student's browser (IndexedDB), so only that student sees them. SimWise's output is made by one group and read by another, so it must live on a server both can reach. This one requirement is what brings in a database, share links and, later, login.
- **Copy vs fork.** A git fork carries the whole history and every feature of the original. Copying the proven modules gives a clean start and keeps only what fits.
- **Hooks in Claude Code.** A hook is a command the tool runs by itself when an event happens. SimWise has a `SessionStart` hook with the `compact` matcher: after the conversation is summarised to save space, it feeds `PROGRESS.md` and `docs/plan.md` back in, so the state of the work survives the summary.
- You should be able to explain: why a share link forces a server database, and why state belongs in files rather than in an assistant's memory.

## 2026-11-21: front-end shell (built on auto, walkthrough to come)
- **Routing.** A router maps the address bar to a page: `/sessions/septic-shock` shows the review page for that session; `/s/<token>` shows the student page. The `:id` and `:token` parts are route parameters. SimWise uses React Router; WardWise needed none because it had one screen.
- **Scroll-driven animation.** `useInView` notices when something enters the screen (reveals, counters, scramble); `useScroll` turns scroll position into a number from 0 to 1 that can drive anything (the progress bar, the hero parallax).
- **Motion values and springs.** The tilting cards track the pointer as numbers that change many times a second without re-drawing React components; a spring smooths them so the card eases instead of snapping.
- **Accessibility with effects.** `prefers-reduced-motion` is a device setting; every effect checks it. Scrambled text hides from screen readers and gives them the real word instead.
- To explain later: why a share link is a "token", and why the student page lives outside the sim team's layout.

## 2026-11-21: phase 1 built on auto (walkthrough pending)
- The database layer exists: three tables, a first migration, and a CRUD API. The concepts are listed in `docs/glossary.md` (Phase 1) and will be walked through together, following one request from `/docs` to a row in `simwise.db`.
- A design idea worth being able to defend: the teaching is **versioned**, never overwritten, so anyone can see what the AI wrote and what a person changed. That is an audit trail, the same instinct as not erasing entries in a clinical record.
