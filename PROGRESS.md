# SimWise progress

## Status
Phase 0 (setup) done, and phase 1 (database) built, both on auto on 2026-11-21 while Rugimbana was away. Phase 1's walkthrough is pending. Checklist in `docs/plan.md`.

- **Phase 1 (database), built, not yet walked through:** SQLAlchemy models (`app/models.py`) for three tables: `debriefs`, `documents` (text read from files; files themselves not kept) and `teaching_outputs` (versioned: the AI writes version 1, each facilitator edit adds a version, nothing is overwritten). Participants' names are never stored, only a count. Database connection in `app/db.py`, chosen by `DATABASE_URL` (empty means `backend/simwise.db`). First Alembic migration in `migrations/versions/`. API in `app/debriefs.py`: `GET/POST /api/debriefs`, `GET/PATCH/DELETE /api/debriefs/{id}`, `PUT /api/debriefs/{id}/output` (save an edit). camelCase JSON to match the front end. Seed script `app/seed.py` (3 invented debriefs). 17 new tests, including one that fails if a model change has no migration. Live run checked: migrate, seed, list, patch, `/docs`.
- **Back-end wording adapted** (subagent): transcription hint, vision prompt (now reads sim cards, charts and slides, not handwriting), name check (keeps sim roles such as "team leader", removes every real person's name, and removes when unsure), busy and progress messages. 3 new tests.

- **Back end** (`backend/`): the reusable core copied from WardWise by a subagent: settings, provider layer (LLM, Whisper, vision), pacer, background jobs, access code and rate limits, de-identification, further reading (PubMed/StatPearls, Wikipedia, YouTube). Routes: `/api/health`, `/api/limits`, `/api/access`, `/api/sessions` (audio and photos), `/api/reading`, `/api/jobs/{id}`. Pack, quiz, ask and highlights code was left out for redesign. 117 tests pass.
- **Front end** (`frontend/`): its own look, not WardWise's. Teal and coral, Plus Jakarta Sans headings, light and dark. Routes: `/` dashboard, `/new` new debrief form, `/sessions/:id` review and publish, `/s/:token` student page. All on invented sample data (`src/data/sample.ts`); nothing talks to the back end yet. Effects in `src/components/fx/`: scroll reveals, hero parallax and a reading-progress bar (`Reveal.tsx`), pointer-tilt cards with a following light and press-in on tap (`Surface.tsx`), scramble-decode text (`ScrambleText.tsx`). All switch off under "reduce motion". Type check and build pass; screenshots checked at desktop width (all pages, reduced motion) and the dashboard at phone width.
- **Docs:** `docs/output-spec.md` (draft, has three questions for Rugimbana).

## Next
1. **Waiting for Rugimbana** (see "Needs Rugimbana" below).
2. Phase 1 walkthrough (plan below), then phase 2 (inputs).

## Needs Rugimbana
- Click through the screens (`cd frontend; npm run dev`) and say what feels off.
- Answer the three questions at the end of `docs/output-spec.md` (debrief framework, where objectives come from, "Team member A" vs roles).
- Phase 1 walkthrough. Defaults chosen on auto that are worth questioning together: SQLAlchemy and Alembic (industry standard) rather than SQLModel; random string ids; teaching stored as one JSON column per version rather than a table per section; a new status `new` (created, nothing uploaded); share links left for phase 4 so they arrive as a second migration.

## Phase 1 walkthrough plan
Follow one request end to end: the sim team creates a debrief (`POST /api/debriefs` from `/docs`). Order: what a database is and why SimWise needs one (WardWise did not) → `models.py` (tables, keys, relationships) → the migration file (what it does to the database) → `db.py` (engine, session, one per request) → `debriefs.py` (CRUD, status codes, why an edit is a new version) → `test_debriefs.py` (a throwaway database per test). Then open `simwise.db` in a viewer to see the rows. Terms are in `docs/glossary.md`.

## For phase 3 (from the wording review)
- Names are replaced with `[name]`; AGENTS.md promises "Team member A, B...". Consistent labels per person matter for teaching ("Team member A led, B took airway"), so phase 3 should map each name the facilitator types to its own letter before the AI call.
- Renames due: `read_handwriting` to `read_photo`, `NO_HANDWRITING` to `NO_TEXT`, `READ_NOTES` to `READ_PHOTO`, the `notes` field in `Materials` and `deidentify.clean`, and the `fake_read_handwriting` fixture.

## Back-end wording
Adapted on 2026-11-21 (see Status). Still open: the renames listed under "For phase 3", `/api/sessions` accepting only audio and photos (phase 2), and `ncbi.py`'s unused `find_for_answer` and `abstracts` (likely useful for the phase 5 chat).

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
- 2026-11-21: Teaching output is versioned (each facilitator edit is a new row), so what the AI wrote and what a person changed stay visible. Useful for trust and for improving prompts later.
- 2026-11-21: Participants' names are never stored; the API refuses a names field outright.
- 2026-11-21: Routing with React Router (WardWise had a single screen; SimWise has real pages and a public link).
