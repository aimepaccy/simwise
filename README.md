# SimWise

Turns a simulation debrief into teaching for the whole cohort.

After a simulation session, the sim team records the debrief and adds the slides, documents and sim cards they used. SimWise drafts the teaching: what the scenario was about, the learning objectives, what went well, what to improve, and the key teaching points, each tied to the words it came from. A facilitator checks and edits the draft, then shares one link with students.

**Status:** early build. The screens run on invented sample data; the back end (transcription, file reading, AI drafting, database) is being built in phases. See `docs/plan.md`.

## Principles
- Team-level teaching only. Participants' names are removed before any AI step, and the output names no one.
- No patient data. Scenarios are fictional.
- A person publishes. AI output stays a draft until a facilitator checks it.
- Audio and uploaded files are deleted after they are read.
- Links in further reading come from real search APIs, never from the AI.
- Free tiers only.

## Run it locally
Needs Node 24 and Python 3.13.

```sh
# Front end
cd frontend
npm install
npm run dev          # http://localhost:5173

# Back end
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt   # macOS/Linux: .venv/bin/pip
cp .env.example .env                                # then add an API key
.venv/Scripts/python -m uvicorn app.main:app --reload
.venv/Scripts/python -m pytest
```

## Stack
React (Vite, TypeScript), Tailwind CSS, Motion · Python, FastAPI · Groq (Whisper and an open-weight LLM) behind an OpenAI-compatible provider layer.
