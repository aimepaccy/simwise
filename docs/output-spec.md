# Teaching output: draft spec

Status: **draft for Rugimbana to approve** (written 2026-11-21). This is the target for phase 3: what the AI must produce from one debrief, and the rules the code checks before a facilitator sees it.

## Who reads it
Students in the cohort, as a group, after the session. Many were not in the scenario team; they watched, or ran a different scenario. So the output must make sense to someone who was not in the room.

## Sections

| Section | What it holds | Size |
|---|---|---|
| Overview | What the scenario was, what it tested, and what the debrief focused on | 1 short paragraph (60 to 120 words) |
| Learning objectives | What the session was designed to teach, from the slides or sim card when present, otherwise inferred from the debrief | 3 to 5 bullet points |
| What went well | Team behaviours or decisions worth repeating | 2 to 4 points |
| What to improve | Gaps the debrief named, framed as what to do next time | 2 to 4 points |
| Key teaching points | The clinical and teamwork knowledge to take away | 3 to 6 points |
| Further reading | Real links from search APIs, never written by the AI | 2 to 4 links |

Every point in the last three sections carries a **quote** (the exact words it came from) and a **source** (debrief, slides, sim card or document).

## Shape (what the back end returns)

```json
{
  "overview": "string",
  "objectives": ["string"],
  "wentWell": [{ "text": "string", "quote": "string", "source": "debrief" }],
  "improve": [{ "text": "string", "quote": "string", "source": "debrief" }],
  "teachingPoints": [{ "text": "string", "quote": "string", "source": "slides" }],
  "searchTerms": ["string"]
}
```

`searchTerms` goes to the further reading APIs; the links themselves come back from those APIs (the WardWise rule). The same shape is in `frontend/src/types.ts` as `TeachingOutput`.

## Rules the code checks (not just the prompt)
1. **No names.** Participants' first names are swapped for "Team member A, B..." before the AI call. After the call, the output is searched for every original name; a hit blocks the draft and is flagged to the facilitator.
2. **Team-level language.** Points describe what "the team" did. A quote may say "Team member A"; the point text should not single anyone out ("the leader was named early", not "A led well").
3. **Quotes are real.** Each quote must be found in the transcript or the documents (the WardWise `check` approach, tolerant of small spacing and punctuation differences). A point whose quote is not found is dropped or sent back.
4. **Improvement is framed forwards.** "Repeat fluid orders back" rather than "the team failed to...". Debriefs are psychologically safe; the output should be too.
5. **Clinical facts come from the material.** Doses and thresholds in teaching points must come from the slides, documents or what the facilitator said, not from the AI's general knowledge. If a number is not in the material, it is left out.
6. **Labelled.** The student page says "AI-assisted, checked by the facilitator".

## Worked example
The sepsis session in `frontend/src/data/sample.ts` is written to this spec. Open `/s/k7Qw2mXr9TzpL4vN` in the running app to see it as a student would.

## Questions for Rugimbana
1. Are the sections right for your sim lab, or does the sim head use a debrief framework (for example PEARLS, or the "plus/delta" format) that the output should follow?
2. Should the learning objectives come only from the sim team's material, rather than being inferred when there are no slides?
3. Is "Team member A" the right replacement, or would the sim team prefer roles ("the team leader", "the airway doctor") where the debrief makes them clear?
