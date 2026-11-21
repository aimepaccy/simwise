import type { DebriefSession } from '@/types'

// Invented sessions so the screens can be seen before the back end exists. Every scenario is fictional.
// Further reading links are plain searches on the real sites, never made-up article addresses.

const search = {
  pubmed: (q: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`,
  statpearls: (q: string) => `https://www.ncbi.nlm.nih.gov/books/?term=${encodeURIComponent(`statpearls ${q}`)}`,
  wikipedia: (q: string) => `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`,
}

export const sessions: DebriefSession[] = [
  {
    id: 'septic-shock',
    title: 'Septic shock in the emergency bay',
    scenario: 'A 58-year-old with fever, confusion and a blood pressure of 78/40 arrives by ambulance.',
    cohort: 'Year 5',
    date: '2026-11-18',
    durationMin: 32,
    participants: 5,
    status: 'published',
    shareToken: 'k7Qw2mXr9TzpL4vN',
    documents: [
      { name: 'Sepsis scenario slides.pptx', kind: 'pptx' },
      { name: 'Sim card: vitals timeline', kind: 'photo' },
    ],
    themes: ['Closed-loop communication', 'Early escalation', 'Role allocation'],
    output: {
      overview:
        'The team managed a patient in septic shock from arrival to handover to intensive care. The scenario tested recognition of shock, the first hour of sepsis care, and how a team shares tasks under time pressure. Fluids and antibiotics were given within the hour; the debrief focused on how the team communicated while doing it.',
      objectives: [
        'Recognise septic shock from the vital signs and clinical picture',
        'Deliver the first-hour sepsis bundle in the right order',
        'Use closed-loop communication for drug and fluid orders',
        'Escalate early to a senior and to intensive care',
      ],
      wentWell: [
        {
          text: 'A clear team leader was named in the first minute, and everyone knew who was doing what.',
          quote: 'Team member A said "I\'ll lead, B take airway, C get access" before we even had a full set of obs.',
          source: 'debrief',
        },
        {
          text: 'Blood cultures were taken before antibiotics, without delaying the antibiotics.',
          quote: 'We got cultures off with the first cannula so the antibiotics weren\'t held up.',
          source: 'debrief',
        },
      ],
      improve: [
        {
          text: 'Fluid orders were not always repeated back, so one bolus was nearly given twice.',
          quote: 'I heard "give another 500" and so did Team member D, and we both went for the bag.',
          source: 'debrief',
        },
        {
          text: 'The call to intensive care came late, after the second fluid bolus had failed to lift the pressure.',
          quote: 'Looking back, the lactate was 5 at ten minutes. That was the moment to call.',
          source: 'debrief',
        },
      ],
      teachingPoints: [
        {
          text: 'Closed-loop communication: the person giving an order names who it is for, the receiver repeats it back, and reports when it is done.',
          quote: 'Say the name, say the order, hear it back, hear "done".',
          source: 'debrief',
        },
        {
          text: 'A lactate above 4 mmol/L or hypotension after fluids means septic shock and is a trigger for senior and intensive care review.',
          quote: 'Lactate > 4 or MAP < 65 after fluids: escalate.',
          source: 'slides',
        },
        {
          text: 'Give antibiotics within one hour of recognising sepsis; take cultures first only if it does not delay them.',
          quote: 'Antibiotics within the hour. Cultures first if no delay.',
          source: 'slides',
        },
      ],
      reading: [
        { title: 'Septic shock', site: 'StatPearls', url: search.statpearls('septic shock') },
        { title: 'Closed-loop communication in resuscitation teams', site: 'PubMed', url: search.pubmed('closed-loop communication resuscitation') },
        { title: 'Surviving Sepsis Campaign', site: 'Wikipedia', url: search.wikipedia('Surviving Sepsis Campaign') },
      ],
    },
  },
  {
    id: 'paeds-anaphylaxis',
    title: 'Anaphylaxis in a child',
    scenario: 'A 6-year-old develops stridor and a rash minutes after eating at a birthday party.',
    cohort: 'Year 5',
    date: '2026-11-20',
    durationMin: 24,
    participants: 4,
    status: 'draft',
    documents: [
      { name: 'Paediatric doses chart.pdf', kind: 'pdf' },
      { name: 'Sim card: parent briefing', kind: 'photo' },
    ],
    themes: ['Drug dose calculation', 'Closed-loop communication', 'Family communication'],
    output: {
      overview:
        'The team treated a child with anaphylaxis while a worried parent was in the room. The scenario tested fast recognition, weight-based adrenaline dosing, and keeping the family informed.',
      objectives: [
        'Recognise anaphylaxis and give intramuscular adrenaline without delay',
        'Calculate weight-based doses and check them aloud',
        'Keep a parent informed during a resuscitation',
      ],
      wentWell: [
        {
          text: 'Adrenaline was given within two minutes of the stridor being noticed.',
          quote: 'As soon as I heard the stridor I said adrenaline, IM, now.',
          source: 'debrief',
        },
      ],
      improve: [
        {
          text: 'The dose was calculated by one person and not checked by a second.',
          quote: 'I did the maths in my head and nobody checked it.',
          source: 'debrief',
        },
      ],
      teachingPoints: [
        {
          text: 'Intramuscular adrenaline 1 mg/mL is the first drug in anaphylaxis; a second person checks every paediatric dose aloud.',
          quote: 'IM adrenaline first. Two people, one dose, said out loud.',
          source: 'document',
        },
      ],
      reading: [{ title: 'Anaphylaxis', site: 'StatPearls', url: search.statpearls('anaphylaxis') }],
    },
  },
  {
    id: 'pph',
    title: 'Postpartum haemorrhage',
    scenario: 'Heavy bleeding starts twenty minutes after a vaginal delivery.',
    cohort: 'Year 6',
    date: '2026-11-21',
    durationMin: 38,
    participants: 6,
    status: 'processing',
    documents: [
      { name: 'PPH drill slides.pptx', kind: 'pptx' },
      { name: 'Massive transfusion protocol.docx', kind: 'docx' },
    ],
    themes: [],
  },
  {
    id: 'asthma',
    title: 'Acute severe asthma',
    scenario: 'A 24-year-old cannot complete sentences and has a silent chest on arrival.',
    cohort: 'Year 6',
    date: '2026-11-11',
    durationMin: 27,
    participants: 4,
    status: 'published',
    shareToken: 'Hn3bVq8sRw1cYe6J',
    documents: [{ name: 'Asthma severity card', kind: 'photo' }],
    themes: ['Early escalation', 'Role allocation', 'Closed-loop communication'],
  },
  {
    id: 'hyperkalaemia',
    title: 'Hyperkalaemia with a broad-complex rhythm',
    scenario: 'A patient on dialysis feels weak; the monitor shows tall T waves and widening QRS.',
    cohort: 'Year 5',
    date: '2026-11-06',
    durationMin: 29,
    participants: 5,
    status: 'published',
    shareToken: 'Pz5tGd2kLm8wXa4F',
    documents: [{ name: 'ECG strips.pdf', kind: 'pdf' }],
    themes: ['Drug dose calculation', 'Situational awareness', 'Closed-loop communication'],
  },
  {
    id: 'opioid',
    title: 'Opioid toxicity on the ward',
    scenario: 'A post-operative patient is drowsy with a respiratory rate of 6.',
    cohort: 'Year 4',
    date: '2026-10-30',
    durationMin: 21,
    participants: 4,
    status: 'published',
    shareToken: 'Wc9rJs4nBv7hKe2Q',
    documents: [],
    themes: ['Situational awareness', 'Early escalation'],
  },
]

export function findSession(id: string) {
  return sessions.find((s) => s.id === id)
}

export function findByToken(token: string) {
  return sessions.find((s) => s.shareToken === token && s.status === 'published')
}

/** How many sessions each theme came up in, most common first. */
export function recurringThemes(list: DebriefSession[]) {
  const counts = new Map<string, number>()
  for (const s of list) for (const t of s.themes) counts.set(t, (counts.get(t) ?? 0) + 1)
  const withThemes = list.filter((s) => s.themes.length > 0).length
  return {
    total: withThemes,
    themes: [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  }
}
