"""
Fills an empty database with invented debriefs, so the API has something to show while it is being built.
Run from backend/:  .venv/Scripts/python -m app.seed
Every scenario is fictional. It does nothing if the database already has debriefs.
"""

from datetime import date

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models import Debrief, Document, TeachingOutput

SEPSIS_TEACHING = {
    'overview': (
        'The team managed a patient in septic shock from arrival to handover to intensive care. The scenario tested '
        'recognition of shock, the first hour of sepsis care, and how a team shares tasks under time pressure. Fluids '
        'and antibiotics were given within the hour; the debrief focused on how the team communicated while doing it.'
    ),
    'objectives': [
        'Recognise septic shock from the vital signs and clinical picture',
        'Deliver the first-hour sepsis bundle in the right order',
        'Use closed-loop communication for drug and fluid orders',
        'Escalate early to a senior and to intensive care',
    ],
    'wentWell': [
        {
            'text': 'A clear team leader was named in the first minute, and everyone knew who was doing what.',
            'quote': 'Team member A said "I\'ll lead, B take airway, C get access" before we even had a full set of obs.',
            'source': 'debrief',
        },
    ],
    'improve': [
        {
            'text': 'Fluid orders were not always repeated back, so one bolus was nearly given twice.',
            'quote': 'I heard "give another 500" and so did Team member D, and we both went for the bag.',
            'source': 'debrief',
        },
    ],
    'teachingPoints': [
        {
            'text': 'Closed-loop communication: the person giving an order names who it is for, the receiver repeats it '
            'back, and reports when it is done.',
            'quote': 'Say the name, say the order, hear it back, hear "done".',
            'source': 'debrief',
        },
        {
            'text': 'A lactate above 4 mmol/L or hypotension after fluids means septic shock and is a trigger for senior '
            'and intensive care review.',
            'quote': 'Lactate > 4 or MAP < 65 after fluids: escalate.',
            'source': 'slides',
        },
    ],
    'searchTerms': ['septic shock', 'closed-loop communication resuscitation'],
}


def sample_debriefs() -> list[Debrief]:
    sepsis = Debrief(
        title='Septic shock in the emergency bay',
        scenario='A 58-year-old with fever, confusion and a blood pressure of 78/40 arrives by ambulance.',
        cohort='Year 5',
        held_on=date(2026, 11, 18),
        duration_min=32,
        participants=5,
        status='draft',
        transcript='(Invented sample: no real debrief.)',
        themes=['Closed-loop communication', 'Early escalation', 'Role allocation'],
        documents=[
            Document(name='Sepsis scenario slides.pptx', kind='pptx', text='Lactate > 4 or MAP < 65 after fluids: escalate.'),
            Document(name='Sim card: vitals timeline', kind='photo', text='0 min: BP 78/40, HR 124, RR 28, T 39.2'),
        ],
        outputs=[TeachingOutput(version=1, author='ai', content=SEPSIS_TEACHING)],
    )
    pph = Debrief(
        title='Postpartum haemorrhage',
        scenario='Heavy bleeding starts twenty minutes after a vaginal delivery.',
        cohort='Year 6',
        held_on=date(2026, 11, 21),
        duration_min=38,
        participants=6,
        status='processing',
        documents=[Document(name='PPH drill slides.pptx', kind='pptx', text='')],
    )
    opioid = Debrief(
        title='Opioid toxicity on the ward',
        scenario='A post-operative patient is drowsy with a respiratory rate of 6.',
        cohort='Year 4',
        held_on=date(2026, 10, 30),
        participants=4,
    )
    return [sepsis, pph, opioid]


def main() -> None:
    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Debrief)):
            print('The database already has debriefs; nothing added.')
            return
        db.add_all(sample_debriefs())
        db.commit()
        print('Added 3 invented debriefs.')


if __name__ == '__main__':
    main()
