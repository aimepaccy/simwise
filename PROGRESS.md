# SimWise progress

## Status
Phase 0 (setup) done on auto on 2026-11-21 while Rugimbana was away. Checklist in `docs/plan.md`.

- **Back end** (`backend/`): the reusable core copied from WardWise by a subagent: settings, provider layer (LLM, Whisper, vision), pacer, background jobs, access code and rate limits, de-identification, further reading (PubMed/StatPearls, Wikipedia, YouTube). Routes: `/api/health`, `/api/limits`, `/api/access`, `/api/sessions` (audio and photos), `/api/reading`, `/api/jobs/{id}`. Pack, quiz, ask and highlights code was left out for redesign. 117 tests pass.
- **Front end** (`frontend/`): its own look, not WardWise's. Teal and coral, Plus Jakarta Sans headings, light and dark. Routes: `/` dashboard, `/new` new debrief form, `/sessions/:id` review and publish, `/s/:token` student page. All on invented sample data (`src/data/sample.ts`); nothing talks to the back end yet. Effects in `src/components/fx/`: scroll reveals, hero parallax and a reading-progress bar (`Reveal.tsx`), pointer-tilt cards with a following light and press-in on tap (`Surface.tsx`), scramble-decode text (`ScrambleText.tsx`). All switch off under "reduce motion". Type check and build pass; screenshots checked at desktop width (all pages, reduced motion) and the dashboard at phone width.
- **Docs:** `docs/output-spec.md` (draft, has three questions for Rugimbana).

## Next
1. Rugimbana: click through the screens (`cd frontend; npm run dev`) and answer the three questions in `docs/output-spec.md`.
2. Phase 1 (database) with a full walkthrough.
3. Before phase 2 and 3, adapt the WardWise wording left in the copied back end (list below).

## Back-end wording to adapt (from the copy, 2026-11-21)
- `providers.py`: transcription hint says "teaching session on a hospital ward"; photo prompt asks for "a medical student's handwritten notes" (SimWise reads printed sim cards and slides).
- `deidentify.py`: name-check prompt describes a ward teaching session; the `KEEP` list and phone pattern are ward-oriented. SimWise needs rules for sim roles ("team leader", "confederate") and the facilitator's list of names.
- User-facing text: "SimWise is busy with other students' work" (`guard.py`), "Reading your handwritten notes" (`jobs.py`).
- `/api/sessions` accepts only audio and photos; `test_slides_and_typed_notes_are_not_accepted` must change in phase 2.
- `ncbi.py` keeps `find_for_answer` and `abstracts` (unused now, likely useful for the phase 5 chat).

## Not yet checked
- Review and new-debrief pages at phone width (layouts are responsive, but no screenshot yet).
- The front-end bundle is 512 kB (Vite warns above 500 kB); split it by route later if load time matters.

## Blockers
None.

## Decisions
- 2026-11-21: Sibling of WardWise. Proven parts copied, not a git fork, so SimWise has a clean history and can drop what it does not need.
- 2026-11-21: Demo MVP first, built to be usable by the sim lab soon (the head of the sim lab agreed to try it). Free tier only.
- 2026-11-21: Students get output through a share link (works on Canvas); no student login.
- 2026-11-21: Team-level output only. Names are stripped in code before the AI sees anything; audio deleted after transcription.
- 2026-11-21: A facilitator reviews and edits the draft, then publishes.
- 2026-11-21: Output for the MVP: core debrief summary, further reading, ask-the-debrief chat (no flashcards or quiz yet).
- 2026-11-21: Login comes after a working sim team side. Condition agreed: a shared team passcode before any real use on the internet.
- 2026-11-21: Dashboard is the sim team home. Look: teal and coral, and deliberately not like WardWise (Rugimbana's call), with scroll transitions, touchable cards and scramble text.
- 2026-11-21: Learning mode: walkthrough for new concepts only.
- 2026-11-21: Public repo.
- 2026-11-21: Server database is a setting: SQLite locally, Supabase Postgres when hosted (share links need content on a server; WardWise kept everything in the browser).
- 2026-11-21: Routing with React Router (WardWise had a single screen; SimWise has real pages and a public link).
