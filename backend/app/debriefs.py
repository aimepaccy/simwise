from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import Debrief, Document, TeachingOutput
from app.schemas import (
    DebriefCreate,
    DebriefDetail,
    DebriefSummary,
    DebriefUpdate,
    DocumentOut,
    OutputOut,
    TeachingContent,
)

router = APIRouter(prefix='/api/debriefs', tags=['debriefs'])
Db = Annotated[Session, Depends(get_db)]


def find(db: Session, debrief_id: str) -> Debrief:
    debrief = db.get(Debrief, debrief_id, options=[selectinload(Debrief.documents), selectinload(Debrief.outputs)])
    if debrief is None:
        raise HTTPException(404, 'No debrief with that id.')
    return debrief


def summary(debrief: Debrief, document_count: int) -> DebriefSummary:
    return DebriefSummary(
        id=debrief.id,
        title=debrief.title,
        cohort=debrief.cohort,
        held_on=debrief.held_on,
        duration_min=debrief.duration_min,
        participants=debrief.participants,
        status=debrief.status,
        themes=debrief.themes,
        document_count=document_count,
        created_at=debrief.created_at,
    )


def detail(debrief: Debrief) -> DebriefDetail:
    latest = debrief.latest_output
    return DebriefDetail(
        **summary(debrief, len(debrief.documents)).model_dump(),
        scenario=debrief.scenario,
        has_transcript=bool(debrief.transcript),
        documents=[
            DocumentOut(id=d.id, name=d.name, kind=d.kind, characters=len(d.text), created_at=d.created_at)
            for d in debrief.documents
        ],
        output=OutputOut(
            version=latest.version,
            author=latest.author,
            created_at=latest.created_at,
            content=TeachingContent.model_validate(latest.content),
        )
        if latest
        else None,
        versions=len(debrief.outputs),
    )


@router.get('')
def list_debriefs(db: Db) -> list[DebriefSummary]:
    # One query for all the debriefs and their document counts, rather than one extra query per debrief.
    counts = (
        select(Document.debrief_id, func.count(Document.id).label('n')).group_by(Document.debrief_id).subquery()
    )
    rows = db.execute(
        select(Debrief, func.coalesce(counts.c.n, 0))
        .outerjoin(counts, counts.c.debrief_id == Debrief.id)
        .order_by(Debrief.held_on.desc().nulls_last(), Debrief.created_at.desc())
    ).all()
    return [summary(debrief, n) for debrief, n in rows]


@router.post('', status_code=201)
def create_debrief(body: DebriefCreate, db: Db) -> DebriefDetail:
    debrief = Debrief(**body.model_dump())
    db.add(debrief)
    db.commit()
    return detail(find(db, debrief.id))


@router.get('/{debrief_id}')
def read_debrief(debrief_id: str, db: Db) -> DebriefDetail:
    return detail(find(db, debrief_id))


@router.patch('/{debrief_id}')
def update_debrief(debrief_id: str, body: DebriefUpdate, db: Db) -> DebriefDetail:
    debrief = find(db, debrief_id)
    # exclude_unset: a field left out of the request stays as it is; only fields that were sent change.
    changes = body.model_dump(exclude_unset=True)
    if 'title' in changes and changes['title'] is None:
        raise HTTPException(422, 'A debrief needs a title.')
    for field, value in changes.items():
        setattr(debrief, field, value)
    db.commit()
    return detail(find(db, debrief_id))


@router.put('/{debrief_id}/output')
def save_edit(debrief_id: str, body: TeachingContent, db: Db) -> DebriefDetail:
    """A facilitator's edit. It is saved as a new version; earlier versions, including the AI's, are kept."""
    debrief = find(db, debrief_id)
    latest = debrief.latest_output
    if latest is None:
        raise HTTPException(409, 'There is no draft to edit yet.')
    debrief.outputs.append(
        TeachingOutput(version=latest.version + 1, author='facilitator', content=body.model_dump(by_alias=True))
    )
    db.commit()
    return detail(find(db, debrief_id))


@router.delete('/{debrief_id}', status_code=204)
def delete_debrief(debrief_id: str, db: Db) -> None:
    # Its documents and every version of its teaching go with it (cascade in models.py).
    db.delete(find(db, debrief_id))
    db.commit()
