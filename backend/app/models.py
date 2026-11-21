import uuid
from datetime import UTC, date, datetime
from typing import Any, Literal

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

DebriefStatus = Literal['new', 'processing', 'draft', 'published']
DocumentKind = Literal['pptx', 'pdf', 'docx', 'photo']
Author = Literal['ai', 'facilitator']


def new_id() -> str:
    # Random ids instead of 1, 2, 3: an address like /debriefs/7 would tell anyone how many exist
    # and invite guessing the next one.
    return uuid.uuid4().hex


def now() -> datetime:
    return datetime.now(UTC)


class Debrief(Base):
    """One simulation session and its debrief. Participants' names are never stored, only how many took part."""

    __tablename__ = 'debriefs'

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    title: Mapped[str] = mapped_column(String(200))
    scenario: Mapped[str] = mapped_column(Text, default='')
    cohort: Mapped[str] = mapped_column(String(100), default='')
    held_on: Mapped[date | None] = mapped_column(Date)
    duration_min: Mapped[int | None] = mapped_column(Integer)
    participants: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default='new')
    # The debrief as text, after names were swapped for "Team member A, B...". The audio itself is not kept.
    transcript: Mapped[str | None] = mapped_column(Text)
    themes: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)

    documents: Mapped[list['Document']] = relationship(
        back_populates='debrief', cascade='all, delete-orphan', order_by='Document.created_at'
    )
    outputs: Mapped[list['TeachingOutput']] = relationship(
        back_populates='debrief', cascade='all, delete-orphan', order_by='TeachingOutput.version'
    )

    @property
    def latest_output(self) -> 'TeachingOutput | None':
        return self.outputs[-1] if self.outputs else None


class Document(Base):
    """Text read from one file (slides, PDF, Word, a photo of a sim card). The file itself is deleted after reading."""

    __tablename__ = 'documents'

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    debrief_id: Mapped[str] = mapped_column(ForeignKey('debriefs.id', ondelete='CASCADE'), index=True)
    name: Mapped[str] = mapped_column(String(255))
    kind: Mapped[str] = mapped_column(String(10))
    text: Mapped[str] = mapped_column(Text, default='')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    debrief: Mapped[Debrief] = relationship(back_populates='documents')


class TeachingOutput(Base):
    """
    One version of the teaching. The AI writes version 1; each facilitator edit adds a new version instead of
    overwriting, so it is always possible to see what the AI wrote and what a person changed.
    """

    __tablename__ = 'teaching_outputs'
    __table_args__ = (UniqueConstraint('debrief_id', 'version'),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    debrief_id: Mapped[str] = mapped_column(ForeignKey('debriefs.id', ondelete='CASCADE'), index=True)
    version: Mapped[int] = mapped_column(Integer)
    author: Mapped[str] = mapped_column(String(20))
    content: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    debrief: Mapped[Debrief] = relationship(back_populates='outputs')
