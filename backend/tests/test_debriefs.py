from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import sessionmaker

from app.db import get_db, make_engine
from app.main import app
from app.models import Debrief, Document, TeachingOutput

BACKEND = Path(__file__).resolve().parent.parent

CONTENT = {
    'overview': 'The team managed septic shock.',
    'objectives': ['Recognise septic shock'],
    'wentWell': [{'text': 'A leader was named early.', 'quote': 'I will lead.', 'source': 'debrief'}],
    'improve': [{'text': 'Repeat fluid orders back.', 'quote': 'We both went for the bag.', 'source': 'debrief'}],
    'teachingPoints': [{'text': 'Antibiotics within the hour.', 'quote': 'Antibiotics within the hour.', 'source': 'slides'}],
    'searchTerms': ['septic shock'],
}


def alembic_config(url: str) -> Config:
    config = Config(str(BACKEND / 'alembic.ini'))
    config.set_main_option('script_location', str(BACKEND / 'migrations'))
    config.set_main_option('sqlalchemy.url', url)
    return config


@pytest.fixture
def db(tmp_path):
    """A fresh database for each test, built by the real migrations, never the developer's own file."""
    url = f'sqlite:///{(tmp_path / "test.db").as_posix()}'
    command.upgrade(alembic_config(url), 'head')
    engine = make_engine(url)
    Session = sessionmaker(bind=engine, expire_on_commit=False)

    def test_db():
        with Session() as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    yield Session
    app.dependency_overrides.pop(get_db, None)
    engine.dispose()


@pytest.fixture
def client(db):
    return TestClient(app)


def make(client, **fields):
    response = client.post('/api/debriefs', json={'title': 'Septic shock', **fields})
    assert response.status_code == 201, response.text
    return response.json()


def test_migrations_match_the_models(tmp_path):
    url = f'sqlite:///{(tmp_path / "check.db").as_posix()}'
    config = alembic_config(url)
    command.upgrade(config, 'head')
    # Fails if models.py describes a table or column that no migration creates (a forgotten migration).
    command.check(config)


def test_create_returns_the_new_debrief_in_camel_case(client):
    body = make(client, cohort='Year 5', heldOn='2026-11-18', durationMin=32, participants=5)
    assert len(body['id']) == 32
    assert body['heldOn'] == '2026-11-18'
    assert body['durationMin'] == 32
    assert body['status'] == 'new'
    assert body['output'] is None
    assert body['versions'] == 0
    assert body['documents'] == []


@pytest.mark.parametrize(
    'fields',
    [
        {'title': ''},
        {'participants': 99},
        {'durationMin': -1},
        {'status': 'published'},
        # Participants' names are never stored, so the API refuses them rather than quietly dropping them.
        {'participantNames': ['Keza', 'Uwase']},
    ],
)
def test_create_refuses_bad_or_unknown_fields(client, fields):
    response = client.post('/api/debriefs', json={'title': 'Septic shock', **fields})
    assert response.status_code == 422


def test_list_is_newest_first_with_document_counts(client, db):
    older = make(client, title='Older', heldOn='2026-11-01')
    newer = make(client, title='Newer', heldOn='2026-11-20')
    undated = make(client, title='Undated')
    with db() as session:
        session.add_all(
            [
                Document(debrief_id=newer['id'], name='slides.pptx', kind='pptx', text='Lactate > 4'),
                Document(debrief_id=newer['id'], name='card.jpg', kind='photo', text='BP 78/40'),
            ]
        )
        session.commit()

    listed = client.get('/api/debriefs').json()
    assert [d['title'] for d in listed] == ['Newer', 'Older', 'Undated']
    assert [d['documentCount'] for d in listed] == [2, 0, 0]
    assert {older['id'], undated['id']} <= {d['id'] for d in listed}


def test_unknown_id_is_404(client):
    assert client.get('/api/debriefs/nope').status_code == 404
    assert client.patch('/api/debriefs/nope', json={'cohort': 'Year 6'}).status_code == 404
    assert client.delete('/api/debriefs/nope').status_code == 404


def test_patch_changes_only_the_fields_sent(client):
    created = make(client, cohort='Year 5', scenario='Fever and low blood pressure')
    updated = client.patch(f'/api/debriefs/{created["id"]}', json={'cohort': 'Year 6'}).json()
    assert updated['cohort'] == 'Year 6'
    assert updated['scenario'] == 'Fever and low blood pressure'
    assert updated['title'] == 'Septic shock'


def test_patch_cannot_remove_the_title_or_set_the_status(client):
    created = make(client)
    assert client.patch(f'/api/debriefs/{created["id"]}', json={'title': None}).status_code == 422
    assert client.patch(f'/api/debriefs/{created["id"]}', json={'status': 'published'}).status_code == 422


def test_editing_needs_a_draft_first(client):
    created = make(client)
    response = client.put(f'/api/debriefs/{created["id"]}/output', json=CONTENT)
    assert response.status_code == 409


def test_an_edit_adds_a_version_and_keeps_what_the_ai_wrote(client, db):
    created = make(client)
    with db() as session:
        session.add(TeachingOutput(debrief_id=created['id'], version=1, author='ai', content=CONTENT))
        session.commit()

    edited = {**CONTENT, 'overview': 'The team managed septic shock and handed over to intensive care.'}
    body = client.put(f'/api/debriefs/{created["id"]}/output', json=edited).json()
    assert body['versions'] == 2
    assert body['output']['version'] == 2
    assert body['output']['author'] == 'facilitator'
    assert body['output']['content']['overview'].endswith('intensive care.')

    with db() as session:
        first = session.scalar(select(TeachingOutput).where(TeachingOutput.version == 1))
        assert first.author == 'ai'
        assert first.content['overview'] == 'The team managed septic shock.'


def test_an_edit_is_validated_like_ai_output(client, db):
    created = make(client)
    with db() as session:
        session.add(TeachingOutput(debrief_id=created['id'], version=1, author='ai', content=CONTENT))
        session.commit()
    no_quote = {**CONTENT, 'wentWell': [{'text': 'Good leadership.', 'quote': '', 'source': 'debrief'}]}
    assert client.put(f'/api/debriefs/{created["id"]}/output', json=no_quote).status_code == 422


def test_delete_removes_documents_and_every_version(client, db):
    created = make(client)
    with db() as session:
        session.add(Document(debrief_id=created['id'], name='slides.pptx', kind='pptx', text='...'))
        session.add(TeachingOutput(debrief_id=created['id'], version=1, author='ai', content=CONTENT))
        session.commit()

    assert client.delete(f'/api/debriefs/{created["id"]}').status_code == 204
    with db() as session:
        for table in (Debrief, Document, TeachingOutput):
            assert session.scalar(select(func.count()).select_from(table)) == 0


def test_seed_data_is_valid_and_loads(client, db):
    from app.schemas import TeachingContent
    from app.seed import sample_debriefs

    debriefs = sample_debriefs()
    for debrief in debriefs:
        for output in debrief.outputs:
            TeachingContent.model_validate(output.content)
    with db() as session:
        session.add_all(debriefs)
        session.commit()
    listed = client.get('/api/debriefs').json()
    assert len(listed) == 3
    sepsis = client.get(f'/api/debriefs/{listed[1]["id"]}').json()
    assert sepsis['output']['author'] == 'ai'
    assert sepsis['hasTranscript'] is True


def test_an_empty_database_setting_means_the_local_file(monkeypatch):
    from app.config import DEFAULT_DATABASE, Settings

    monkeypatch.setenv('DATABASE_URL', '')
    assert Settings().database_url == DEFAULT_DATABASE
    assert DEFAULT_DATABASE.endswith('backend/simwise.db')
