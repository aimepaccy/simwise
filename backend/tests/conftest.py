import os

import pytest

# Tests use fixed settings, whatever is in the developer's own .env.
os.environ['ALLOWED_ORIGINS'] = 'http://localhost:5173'
os.environ['MAX_REQUEST_MB'] = '110'
# No real key, so no test can ever reach the AI provider.
os.environ['LLM_API_KEY'] = ''
os.environ['TRANSCRIBE_API_KEY'] = ''
# The whole suite comes from one address, so the guard's limits are off here; test_guard.py tests them alone.
os.environ['ACCESS_CODE'] = ''
os.environ['JOBS_PER_HOUR'] = '0'
os.environ['READING_PER_HOUR'] = '0'
os.environ['MAX_ACTIVE_JOBS'] = '0'

FAKE_TRANSCRIPT = 'Wheeze is a sign of narrowed airways.'


@pytest.fixture(autouse=True)
def private_jobs_folder(monkeypatch, tmp_path):
    """Each test gets its own folder for uploads, so tests never touch the real one."""
    from app import jobs

    monkeypatch.setattr(jobs, 'JOBS_ROOT', tmp_path / 'simwise-jobs')


@pytest.fixture(autouse=True)
def fake_transcribe(monkeypatch):
    """Stands in for the real provider: records each call and returns a fixed transcript."""
    from app import providers

    calls = []

    def transcribe(audio, kind):
        calls.append({'kind': kind, 'name': audio.name, 'bytes': audio.read_bytes()})
        return FAKE_TRANSCRIPT

    monkeypatch.setattr(providers, 'transcribe', transcribe)
    return calls


FAKE_HANDWRITING = 'Silent chest = life threatening'


@pytest.fixture(autouse=True)
def fake_read_handwriting(monkeypatch):
    """Stands in for the vision model: records each photo it is sent and returns fixed text."""
    from app import providers

    calls = []

    def read_handwriting(jpeg):
        calls.append(jpeg)
        return FAKE_HANDWRITING

    monkeypatch.setattr(providers, 'read_handwriting', read_handwriting)
    return calls


# A valid answer for each form, so a stand-in call that is not given one still succeeds.
DEFAULT_ANSWERS = {
    'Identifiers': lambda: {'items': []},
}


@pytest.fixture(autouse=True)
def no_waiting(monkeypatch):
    """Tests never wait for the provider's allowance: there is no provider."""
    from app import pacing

    monkeypatch.setattr(pacing, 'reserve', lambda *args, **kwargs: None)


@pytest.fixture(autouse=True)
def fake_writer(monkeypatch):
    """Stands in for the LLM: records each call and answers from a queue (a valid answer for the form by default)."""
    import json

    from app import providers

    calls = []
    answers = []

    def write_json(instructions, material, form, max_tokens, *, model=None, on_wait=None):
        calls.append({'instructions': instructions, 'material': material, 'form': form.__name__, 'model': model})
        answer = answers.pop(0) if answers else json.dumps(DEFAULT_ANSWERS[form.__name__]())
        if isinstance(answer, Exception):
            raise answer
        return answer, 1234

    monkeypatch.setattr(providers, 'write_json', write_json)
    return {'calls': calls, 'answers': answers}
