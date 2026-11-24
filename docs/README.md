# TenantFlow documentation

Choose a document by the question you need answered.

## Run and test

- [Backend guide](../backend/README.md): configure the API, run tests and check registration in a browser.

- [Start Here](setup/START_HERE.md): run the existing frontend and development PostgreSQL service.

- [Environment guide](setup/ENV_AND_GITIGNORE_SETUP.md): understand environment files and their consumers.

- [Migration guide](../backend/src/database/migrations/README.md): review and apply schema changes safely.

## Understand the system

- [SRS](requirements/TenantFlow-SRS.md): product rules and release boundaries.

- [Backend requirements](requirements/BACKEND_REQUIREMENTS.md): authentication and persistence contracts.

- [Backend conventions](architecture/BACKEND_CONVENTIONS.md): responsibility placement and coding conventions.

- [ADR 0001](architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md): why the stack was selected.

- [Auth overview](SESSION_AUTH_DEVELOPMENT_PLAN.md): how the current auth components fit together.

## Understand status

- [Roadmap](planning/ROADMAP.md): high-level delivery sequence.

- [Coverage summary](planning/VALIDATION.md): verified behavior and verification limits.

- [Release scope](planning/releases/1.0.0/VERSION-PLANNING.md): release intent, not implementation evidence.

## Maintain these pages

Each document should answer one reader question and link to the owner of other details.
Keep current explanations, not chronological work logs or accumulating proposed-case lists.
Implementation plans and review discussion belong in the chat; executable cases belong in tests.

Limits: 300 lines per document, 120 words per line and 200 words per statement.
A statement is a prose paragraph, list item or table entry.
Preserve accepted requirements when simplifying; remove duplication and stale links.
