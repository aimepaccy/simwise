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
