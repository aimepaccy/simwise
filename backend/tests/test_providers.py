"""The provider layer (what is sent to the LLM, and how failures are worded) and the token pacer.
Moved here from WardWise's test_generate.py and test_long_sessions.py, which tested them alongside pack writing."""

import json

import httpx2
import openai
import pytest

from app import pacing, providers
from app.config import get_settings
from app.schemas import Strict

# Kept before the stand-in replaces it, so a few tests can check what the real function sends.
REAL_WRITE_JSON = providers.write_json


class Form(Strict):
    text: str


# The real write_json, talking to a fake OpenAI client, to check what SimWise actually sends.
class FakeOpenAI:
    sent: dict = {}
    error: Exception | None = None

    def __init__(self, **options):
        self.chat = self
        self.completions = self

    def create(self, **kwargs):
        FakeOpenAI.sent = kwargs
        if FakeOpenAI.error:
            raise FakeOpenAI.error
        message = type('Message', (), {'content': json.dumps({'text': 'ok'})})
        choice = type('Choice', (), {'message': message, 'finish_reason': 'stop'})
        return type('Response', (), {'choices': [choice], 'usage': type('Usage', (), {'total_tokens': 99})})


def real_write_json(monkeypatch, effort='low', error=None):
    monkeypatch.setenv('LLM_API_KEY', 'test-key')
    monkeypatch.setenv('LLM_REASONING_EFFORT', effort)
    get_settings.cache_clear()
    monkeypatch.setattr(providers.openai, 'OpenAI', FakeOpenAI)
    FakeOpenAI.error = error
    try:
        return REAL_WRITE_JSON('Instructions', '<material>x</material>', Form, 1000)
    finally:
        get_settings.cache_clear()


def bad_request(code):
    response = httpx2.Response(400, request=httpx2.Request('POST', 'https://ai.example/v1'))
    return openai.BadRequestError('Bad request', response=response, body={'code': code})


def test_write_json_sends_a_strict_form(monkeypatch):
    answer, used = real_write_json(monkeypatch)
    sent = FakeOpenAI.sent
    assert sent['response_format']['type'] == 'json_schema'
    assert sent['response_format']['json_schema']['strict'] is True
    assert sent['temperature'] == 0.3
    assert sent['reasoning_effort'] == 'low'
    assert sent['messages'][1] == {'role': 'user', 'content': '<material>x</material>'}
    assert used == 99


def test_write_json_leaves_out_reasoning_effort_when_empty(monkeypatch):
    real_write_json(monkeypatch, effort='')
    assert 'reasoning_effort' not in FakeOpenAI.sent


def test_only_a_broken_form_counts_as_invalid_output(monkeypatch):
    with pytest.raises(providers.InvalidOutput):
        real_write_json(monkeypatch, error=bad_request('json_validate_failed'))
    with pytest.raises(providers.ProviderError) as refused:
        real_write_json(monkeypatch, error=bad_request('model_not_supported'))
    assert not isinstance(refused.value, providers.InvalidOutput)
    assert 'model settings' in str(refused.value)


class Clock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now

    def sleep(self, seconds):
        self.now += seconds


def test_the_pacer_waits_until_the_minute_has_room():
    clock = Clock()
    window = pacing.TokenWindow(8000, clock=clock, sleep=clock.sleep)
    heard = []
    window.reserve(6000)
    clock.now += 10
    window.reserve(5000, on_wait=heard.append)
    # The first call leaves the window 60 s after it was sent: 50 s from the second call.
    assert clock.now == 1060.0
    assert heard[0] == 50 and heard[-1] == 0


def test_the_pacer_lets_calls_through_while_there_is_room():
    clock = Clock()
    window = pacing.TokenWindow(8000, clock=clock, sleep=clock.sleep)
    window.reserve(3000)
    window.reserve(3000)
    assert clock.now == 1000.0


def test_a_call_bigger_than_the_allowance_goes_alone():
    clock = Clock()
    window = pacing.TokenWindow(8000, clock=clock, sleep=clock.sleep)
    window.reserve(100)
    window.reserve(20_000)
    assert clock.now == 1060.0


def test_the_daily_limit_has_its_own_message():
    response = httpx2.Response(429, request=httpx2.Request('POST', 'https://ai.example/v1'))
    error = openai.RateLimitError('Rate limit reached on tokens per day (TPD): Limit 200000', response=response, body=None)
    message = str(providers._translate(error, 'writing'))
    assert "today's AI allowance" in message and 'free' not in message
