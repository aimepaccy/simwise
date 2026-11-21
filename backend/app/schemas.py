from typing import Literal

from pydantic import BaseModel, ConfigDict

AudioKind = Literal['webm', 'ogg', 'mp4', 'wav', 'mp3', 'flac']
PhotoKind = Literal['jpeg', 'png', 'webp']


class Health(BaseModel):
    status: Literal['ok']


class AudioReceipt(BaseModel):
    name: str
    kind: AudioKind
    size_bytes: int


class PhotoReceipt(BaseModel):
    name: str
    kind: PhotoKind
    size_bytes: int


class SessionReceipt(BaseModel):
    audio: AudioReceipt | None
    photos: list[PhotoReceipt]


class Materials(BaseModel):
    transcript: str | None
    # Handwritten notes as SimWise read them from photos, in the order the photos were added.
    notes: str | None = None
    warnings: list[str]
    # What was taken out before the text left the server, for the user: ["2 names", "1 number"].
    removed: list[str] = []


JobStatus = Literal['queued', 'working', 'done', 'failed']


class JobCreated(BaseModel):
    job_id: str
    receipt: SessionReceipt


# The form the AI fills in. `extra='forbid'` makes the JSON schema say "no other fields", which strict
# structured output requires. Counts are maximums only: thin material should give fewer items, not invented ones.
class Strict(BaseModel):
    model_config = ConfigDict(extra='forbid')


class JobState(BaseModel):
    status: JobStatus
    step: str
    materials: Materials | None = None
    error: str | None = None


class ReadingLink(BaseModel):
    title: str
    url: str
    # A short line under the title, such as the journal and year, or the channel.
    detail: str = ''


class ReadingSource(BaseModel):
    key: str
    name: str
    # One line on what the source is, shown under its name.
    about: str
    # 'results' lists what the service found; 'search' is one link to the service's own search page.
    kind: Literal['results', 'search']
    # 'off' means the source is not set up on this server (for example, no YouTube key).
    status: Literal['ok', 'failed', 'off']
    links: list[ReadingLink] = []
    note: str | None = None


class Reading(BaseModel):
    term: str
    sources: list[ReadingSource]


class Limits(BaseModel):
    max_audio_mb: int
    max_photos: int
    max_photo_mb: int
    # Whether this server asks for an access code (a hosted copy does), so the page can ask for it first.
    access_required: bool


# Debriefs (phase 1). The API speaks camelCase JSON, like the front end's types; Python keeps snake_case.

from datetime import date, datetime  # noqa: E402

from pydantic import Field  # noqa: E402
from pydantic.alias_generators import to_camel  # noqa: E402


class Camel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra='forbid')


SourceKind = Literal['debrief', 'slides', 'sim card', 'document']


class Point(Camel):
    text: str = Field(min_length=1, max_length=1000)
    quote: str = Field(min_length=1, max_length=1000)
    source: SourceKind


class TeachingContent(Camel):
    overview: str = Field(min_length=1, max_length=3000)
    objectives: list[str] = Field(max_length=10)
    went_well: list[Point] = Field(max_length=10)
    improve: list[Point] = Field(max_length=10)
    teaching_points: list[Point] = Field(max_length=12)
    search_terms: list[str] = Field(default=[], max_length=8)


class DebriefCreate(Camel):
    title: str = Field(min_length=1, max_length=200)
    scenario: str = Field(default='', max_length=2000)
    cohort: str = Field(default='', max_length=100)
    held_on: date | None = None
    duration_min: int | None = Field(default=None, ge=0, le=600)
    participants: int = Field(default=0, ge=0, le=50)


class DebriefUpdate(Camel):
    """Every field optional: only the ones sent are changed. Status is not here; SimWise sets it."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    scenario: str | None = Field(default=None, max_length=2000)
    cohort: str | None = Field(default=None, max_length=100)
    held_on: date | None = None
    duration_min: int | None = Field(default=None, ge=0, le=600)
    participants: int | None = Field(default=None, ge=0, le=50)


class DocumentOut(Camel):
    id: str
    name: str
    kind: Literal['pptx', 'pdf', 'docx', 'photo']
    characters: int
    created_at: datetime


class OutputOut(Camel):
    version: int
    author: Literal['ai', 'facilitator']
    created_at: datetime
    content: TeachingContent


class DebriefSummary(Camel):
    id: str
    title: str
    cohort: str
    held_on: date | None
    duration_min: int | None
    participants: int
    status: Literal['new', 'processing', 'draft', 'published']
    themes: list[str]
    document_count: int
    created_at: datetime


class DebriefDetail(DebriefSummary):
    scenario: str
    has_transcript: bool
    documents: list[DocumentOut]
    output: OutputOut | None
    versions: int
