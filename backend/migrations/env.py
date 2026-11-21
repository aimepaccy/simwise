from logging.config import fileConfig

from alembic import context

from app import models  # noqa: F401  (imported so every table is registered on Base.metadata)
from app.config import get_settings
from app.db import Base, make_engine

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Alembic compares the tables described in models.py with the real database to write migrations.
target_metadata = Base.metadata


def database_url() -> str:
    # A test can point Alembic at its own database; otherwise the app's setting is used.
    return config.get_main_option('sqlalchemy.url') or get_settings().database_url


def run_migrations_offline() -> None:
    context.configure(url=database_url(), target_metadata=target_metadata, literal_binds=True, render_as_batch=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = make_engine(database_url())
    with engine.connect() as connection:
        # Batch mode lets SQLite, which cannot change a column in place, rebuild a table instead.
        context.configure(connection=connection, target_metadata=target_metadata, render_as_batch=True)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
