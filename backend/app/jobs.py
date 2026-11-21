"""Background jobs: answer at once with a job number, do the slow work afterwards.

Jobs and their results live only in this server's memory, and only until the browser
collects them (or 30 minutes after the job finishes, if it never does).
"""

import logging
import secrets
import shutil
import tempfile
import threading
import time
from collections import Counter
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path

from app import deidentify, extract, providers
from app.schemas import AudioKind, JobState, Materials

# A result waits this long for the browser after the job finishes. A job still running is given up only
# after an hour, far past the longest a long recording takes to transcribe, even with others queued for the allowance.
RESULT_TTL_SECONDS = 30 * 60
MAX_RUN_SECONDS = 60 * 60
# Every job's uploads live under this one folder, so leftovers can be found and removed.
JOBS_ROOT = Path(tempfile.gettempdir()) / 'simwise-jobs'

log = logging.getLogger('simwise.jobs')


@dataclass
class PhotoInput:
    path: Path
    name: str


@dataclass
class JobInput:
    folder: Path
    audio: Path | None = None
    audio_kind: AudioKind | None = None
    photos: list[PhotoInput] = field(default_factory=list)


@dataclass
class Job:
    state: JobState
    created: float = field(default_factory=time.monotonic)
    finished: float | None = None


_jobs: dict[str, Job] = {}
# Jobs run on worker threads, so reads and writes to the shared dictionary take turns.
_lock = threading.Lock()


def new_folder() -> Path:
    JOBS_ROOT.mkdir(exist_ok=True)
    return Path(tempfile.mkdtemp(dir=JOBS_ROOT))


def sweep_folders(older_than_seconds: float = 0) -> None:
    """Delete job folders left behind, for example by a crash or a restart in the middle of a job."""
    if not JOBS_ROOT.exists():
        return
    cutoff = time.time() - older_than_seconds
    for folder in JOBS_ROOT.iterdir():
        if folder.stat().st_mtime <= cutoff:
            shutil.rmtree(folder, ignore_errors=True)


def create() -> str:
    _forget_old()
    job_id = secrets.token_hex(16)
    with _lock:
        _jobs[job_id] = Job(JobState(status='queued', step='Waiting to start'))
    return job_id


def get(job_id: str) -> JobState | None:
    _forget_old()
    with _lock:
        job = _jobs.get(job_id)
        if job is None:
            return None
        # A finished job is handed over once and then forgotten.
        if job.state.status in ('done', 'failed'):
            del _jobs[job_id]
        return job.state.model_copy()


def _update(job_id: str, **changes) -> None:
    with _lock:
        job = _jobs.get(job_id)
        if job:
            job.state = job.state.model_copy(update=changes)
            if job.state.status in ('done', 'failed') and job.finished is None:
                job.finished = time.monotonic()


def _forget_old() -> None:
    now = time.monotonic()

    def expired(job: Job) -> bool:
        if job.finished is not None:
            return job.finished < now - RESULT_TTL_SECONDS
        return job.created < now - MAX_RUN_SECONDS

    with _lock:
        for job_id in [job_id for job_id, job in _jobs.items() if expired(job)]:
            del _jobs[job_id]
    sweep_folders(older_than_seconds=RESULT_TTL_SECONDS)


def active() -> int:
    """Jobs waiting to start or still working, across everyone."""
    with _lock:
        return sum(1 for job in _jobs.values() if job.state.status in ('queued', 'working'))


def _read_photos(photos: list[PhotoInput], warnings: list[str], on_step: Callable[[str], None] = lambda step: None) -> str | None:
    pages = []
    for number, photo in enumerate(photos, start=1):
        # The free tier lets about one photo through every 20 seconds, so five take over a minute: show progress.
        if len(photos) > 1:
            on_step(f'Reading the sim cards and slides (photo {number} of {len(photos)})')
        try:
            jpeg = extract.photo_for_reading(photo.path)
        except extract.UnreadableFile:
            warnings.append(f'{photo.name} could not be read as a photo.')
            continue
        # A busy or unreachable service still fails the job; a turned-down photo only warns.
        try:
            text = providers.read_handwriting(jpeg)
        except providers.PhotoCutShort:
            warnings.append(f'{photo.name} has too much text to read at once. Try photographing half the page at a time.')
            continue
        except providers.UnreadablePhoto:
            warnings.append(f'SimWise could not read {photo.name}. Try a clearer photo.')
            continue
        if text:
            pages.append(text)
        else:
            warnings.append(f'SimWise found no text in {photo.name}.')
    return '\n\n'.join(pages) if pages else None


def run(job_id: str, work: JobInput) -> None:
    started = time.monotonic()
    try:
        warnings: list[str] = []
        notes = None
        if work.photos:
            _update(job_id, status='working', step='Reading the sim cards and slides')
            notes = _read_photos(work.photos, warnings, on_step=lambda step: _update(job_id, step=step))

        transcript = None
        if work.audio is not None and work.audio_kind is not None:
            _update(job_id, status='working', step='Transcribing the recording')
            transcript = providers.transcribe(work.audio, work.audio_kind)
            if not transcript:
                warnings.append('No speech was heard in the recording.')

        # Before the text goes back to the browser, so the names the check finds are not shown, saved or
        # written up. (The audio and photos have already been to the transcription and reading services.)
        removed: Counter = Counter()
        if transcript or notes:
            _update(job_id, status='working', step=deidentify.LABEL)
            transcript, notes, removed, checked = deidentify.clean(transcript, notes)
            if not checked:
                warnings.append('SimWise could not check this session for names. Check the text below before you share it.')

        materials = Materials(transcript=transcript, notes=notes, warnings=warnings, removed=deidentify.summary(removed))
        _update(job_id, status='done', step='Done', materials=materials)
    except Exception as error:
        _fail(job_id, error, 'Something went wrong while reading the session material.')
    finally:
        shutil.rmtree(work.folder, ignore_errors=True)
        log.info('Job %s finished in %.1f s', job_id, time.monotonic() - started)


def _fail(job_id: str, error: Exception, fallback: str) -> None:
    if isinstance(error, providers.ProviderError):
        # For the operator: what kind of failure, never the user's material.
        # The error code is safe to log; the response body is not (it can echo the user's material).
        cause = error.__cause__
        while isinstance(cause, providers.ProviderError) and cause.__cause__ is not None:
            cause = cause.__cause__
        status = getattr(cause, 'status_code', '-')
        code = getattr(cause, 'code', '-')
        # A model the provider no longer offers needs the operator, not a retry, so it is logged as an error.
        level = logging.ERROR if isinstance(error, providers.ModelUnavailable) else logging.WARNING
        log.log(level, 'Job %s: provider failed (%s, status %s, code %s)', job_id, type(cause).__name__, status, code)
        _update(job_id, status='failed', step='Failed', error=str(error))
    else:
        log.error('Job %s failed', job_id, exc_info=error)
        _update(job_id, status='failed', step='Failed', error=fallback)
