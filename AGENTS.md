# SimWise (teaching output from simulation debriefs)

**Read first:** `../_hub/PROFILE.md` and `../_hub/CONVENTIONS.md`. Then `PROGRESS.md` in this folder. The rules below add to those files. The phase plan is in `docs/plan.md`.

## Goal
SimWise is a web app for a simulation lab. After a sim session, the sim team records the debrief and adds the session's material (slides, PDFs, Word files, photos of sim cards). SimWise turns them into team-level teaching output: what the scenario was about, the learning objectives, what went well, what to improve, key teaching points, further reading, and a chat grounded in the session. A facilitator reviews and edits the draft, then publishes it as a share link that students open (for example from Canvas).

Inputs come from the sim team; the output goes to students as a group, never to one student.

It is a sibling of WardWise (`../wardwise`). Proven parts were copied from WardWise on 2026-11-21 rather than forked, so SimWise has its own history.

Two aims:
1. A working, clean and vibrant MVP the sim lab can actually use. The head of the sim lab has agreed to try it once it is ready.
2. Rugimbana can explain every layer to a software developer, especially the parts that are new compared with WardWise (server database, share links, file parsing, hosting, later authentication).

## Learning mode
**Walkthrough, new concepts only** (agreed 2026-11-21). Work that repeats WardWise (React, FastAPI, Groq, the provider layer) is built with a short note. New concepts get the full WardWise walkthrough: preview, build, walkthrough, engineer version, at most one explain-back question, close (quality review, `LEARNING.md`, `PROGRESS.md`, commit and push).

The AI may run a whole phase on its own, then stops for the walkthrough before the next phase. Introduce one or two AI-tool features per phase when they fit, with a verdict.

## Rules
- **No patient data, ever.** Sim scenarios are fictional. Slides or cards must not contain real patient images or details.
- **Debriefs are psychologically safe spaces.** Output speaks about "the team", never a named student. Participants' names are swapped for "Team member A, B..." in code before any AI call, and checked again in the output. Audio and uploaded files are deleted after processing; only text is stored.
- **Consent:** the record screen reminds the facilitator to tell participants they are being recorded.
- **A human publishes.** AI output is a draft until a facilitator reviews it and presses Publish. Published output is labelled AI-assisted.
- **Before real use on the internet:** at least a shared team passcode in front of the sim team side. Share links are long random tokens that can be switched off.
- **Vendor independent.** AI calls go through the OpenAI-compatible provider layer, chosen in `.env`. The database is also a setting: SQLite locally, Postgres (Supabase free tier) when hosted.
- **The AI never writes links or references.** Links come only from real APIs (PubMed/StatPearls and similar), as in WardWise.
- **Structured output.** AI responses are JSON validated against a schema, and every teaching point is tied to a quote from the debrief or the documents.
- **Budget: zero.** Free tiers only. Anything that costs money needs a yes, with the cost stated.
- Public repo (decided 2026-11-21). Nothing secret, no personal contact details, no mention of Rugimbana's university or the sim lab's institution unless he asks.
- Writing rules from `CONVENTIONS.md` apply to the README, app text and commit messages.

## Stack
- **Front end:** React (Vite, TypeScript), Tailwind CSS, shadcn/ui-style components, Motion. Teal and coral, light and dark themes.
- **Back end:** Python 3.13, FastAPI.
- **AI:** Groq free tier (Whisper for speech-to-text, an open-weight LLM), behind the provider layer.
- **Storage:** server database (SQLite locally, Supabase Postgres hosted). No audio or files kept.
- **Hosting:** free tier, chosen in phase 7.

## Layout
```
frontend/   React app
backend/    FastAPI app, .env (not in git), .env.example
docs/       plan.md, output-spec.md, glossary.md
```

## Environment
- Node 24 for the front end. Python 3.13 in `backend/.venv`.
- Run: `cd backend; .venv/Scripts/alembic upgrade head; .venv/Scripts/python -m uvicorn app.main:app --reload` and `cd frontend; npm run dev`.
- Database: SQLAlchemy models in `backend/app/models.py`; every change to them needs a migration (`.venv/Scripts/alembic revision --autogenerate -m "what changed"`, then read the generated file before `alembic upgrade head`). A test fails if a migration is missing. Invented sample data: `.venv/Scripts/python -m app.seed`.
