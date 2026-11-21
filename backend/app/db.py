from collections.abc import Iterator

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    """Every table class inherits from this, so SQLAlchemy (and Alembic) can find them all."""


def make_engine(url: str) -> Engine:
    if not url.startswith('sqlite'):
        return create_engine(url, pool_pre_ping=True)

    # SQLite is one file. FastAPI may use it from more than one thread, which is safe here because
    # each request gets its own session.
    engine = create_engine(url, connect_args={'check_same_thread': False})

    # SQLite ignores foreign keys unless asked, so a document could point at a deleted debrief.
    @event.listens_for(engine, 'connect')
    def _foreign_keys_on(connection, _record):
        connection.execute('PRAGMA foreign_keys = ON')

    return engine


engine = make_engine(get_settings().database_url)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """One database session per request, closed when the request ends, whatever happens."""
    with SessionLocal() as db:
        yield db
