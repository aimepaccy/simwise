# SimWise glossary

Terms in the order SimWise meets them. Each has the plain meaning first, then where it lives in SimWise. WardWise's glossary (`../wardwise/docs/glossary.md`) covers the terms the two apps share (API, endpoint, JSON, schema, provider layer).

## Phase 1: database

- **Database:** a program that keeps data safely on disk and lets many requests read and change it without trampling each other. SimWise: SQLite on the laptop, Postgres when hosted.
- **SQLite / Postgres:** two databases that speak the same language (SQL). SQLite is a single file with no server, ideal for development. Postgres is a server, built for many users at once. SimWise switches between them with one setting, `DATABASE_URL`.
- **Table, row, column:** a table is like a spreadsheet tab (`debriefs`), a row is one record (one debrief), a column is one field (`title`). SimWise has three tables: `debriefs`, `documents`, `teaching_outputs`.
- **Primary key:** the column that identifies a row uniquely, like a hospital number. SimWise uses random 32-character ids, so addresses do not reveal how many debriefs exist.
- **Foreign key:** a column that points at another table's primary key. `documents.debrief_id` says which debrief a document belongs to; the database refuses one that points nowhere.
- **One-to-many relationship:** one debrief has many documents and many versions of its teaching.
- **Cascade delete:** deleting the parent deletes its children too, so no orphan documents are left behind.
- **Index:** a lookup table the database keeps so it can find rows fast without reading every one, like the index of a textbook. SimWise indexes `debrief_id` in the child tables.
- **Unique constraint:** a rule the database enforces. SimWise: one debrief cannot have two "version 3"s.
- **ORM (object-relational mapper):** a library that lets code use Python classes and objects instead of writing SQL by hand. SimWise uses **SQLAlchemy**: `Debrief` in `models.py` is both a Python class and the description of the `debriefs` table.
- **Session (database session):** one conversation with the database: read, change, then **commit** (save everything at once) or roll back. Not the same as a sim session. SimWise opens one per request (`get_db` in `db.py`).
- **Migration:** a saved, numbered script that changes the database's structure (adds a table, a column). Like a change log you can replay, so every copy of the database reaches the same shape. SimWise uses **Alembic**; the scripts are in `backend/migrations/versions/`.
- **Autogenerate:** Alembic compares the models with the database and drafts the migration. A person still reads it before running it.
- **Seed data:** invented records loaded so the app has something to show. `app/seed.py`.
- **CRUD:** create, read, update, delete: the four basic things an API does with stored records. HTTP verbs map onto them: POST, GET, PATCH (change some fields) or PUT (replace), DELETE.
- **Status codes used here:** 201 created, 204 done with nothing to return, 404 not found, 409 conflict (the request makes no sense in the current state, such as editing a draft that does not exist), 422 the request's content is invalid.
- **Dependency injection:** FastAPI hands each route what it needs (here, a database session) instead of the route making its own. That is how tests swap in a throwaway database (`app.dependency_overrides`).
- **camelCase vs snake_case:** `heldOn` vs `held_on`. JavaScript uses the first, Python the second; the API's schemas translate between them.
