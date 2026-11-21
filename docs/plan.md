# SimWise build plan

Agreed with Rugimbana on 2026-11-21. Tick items as they are done; `PROGRESS.md` holds the detail.

**Walkthrough** marks a phase with new concepts: the AI builds it, then stops to explain before the next phase.

## Phase 0: setup (auto)
- [x] Project files (AGENTS.md, CLAUDE.md, README, PROGRESS, LEARNING, this plan)
- [x] Post-compaction hook (`.claude/settings.json`)
- [x] Back-end core copied from WardWise, tests green
- [x] Front-end shell: teal and coral theme, pages with sample data
- [x] Draft output spec (`docs/output-spec.md`) for Rugimbana to approve
- [ ] Git repo, public GitHub repo, listed in `_hub/projects.txt`

## Phase 1: back end and database (walkthrough)
- [ ] Database as a setting (SQLite locally, Postgres hosted), ORM models: debrief session, document, draft, published output, share link
- [ ] Migrations
- [ ] Sessions API (create, list, read, update)
- Concepts: database, table, row, primary key, foreign key, ORM, migration

## Phase 2: inputs (walkthrough)
- [ ] Record in the browser or upload audio; transcription job
- [ ] Upload PPTX, PDF, DOCX; text extraction
- [ ] Photos of sim cards read by the vision model
- Concepts: file parsing, MIME types, why files are deleted after reading

## Phase 3: AI pipeline
- [ ] Participant names swapped for "Team member A, B..." before any AI call; final name check on the output
- [ ] Teaching output written as validated JSON, every point tied to a quote; long debriefs split and condensed (WardWise method)
- Concepts: de-identification limits, grounding

## Phase 4: review, edit, publish (walkthrough)
- [ ] Facilitator edits any section, then publishes
- [ ] Share link: long random token, can be switched off; copy button for Canvas
- Concepts: unguessable tokens, revocation, public vs private routes

## Phase 5: student page
- [ ] Published output, labelled AI-assisted
- [ ] Further reading from real APIs only
- [ ] Ask-the-debrief chat grounded in the session

## Phase 6: dashboard
- [ ] Session cards (processing, draft, published), stats, recurring themes across sessions

## Phase 7: hosting and passcode gate (walkthrough)
- [ ] Free hosting for front end, API and database
- [ ] Team passcode in front of the sim team side (needed before real use)
- Concepts: deployment, environment secrets, cold starts

## Phase 8: accounts (later, walkthrough)
- [ ] Real accounts for the sim team, roles, cohorts (Supabase Auth)
- Concepts: authentication vs authorization, sessions and tokens
