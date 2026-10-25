# TenantFlow documentation

The NestJS backend has a minimal HTTP/configuration foundation and TypeORM runtime/CLI wiring. Auth and domain persistence remain unfinished. Use the validation register for evidence and the roadmap for the next checkpoint.

## Where to start

- Run the existing frontend or PostgreSQL: [Start Here](setup/START_HERE.md).
- Continue backend implementation: [commands and configuration](../backend/README.md) and [Backend Conventions](architecture/BACKEND_CONVENTIONS.md).
- Check product behavior and MVP scope: [Software Requirements Specification](requirements/TenantFlow-SRS.md).
- Choose the next milestone: [Implementation Roadmap](planning/ROADMAP.md).
- Work on the first session-auth slice: [temporary development plan](SESSION_AUTH_DEVELOPMENT_PLAN.md).

## Document ownership

| Location | Document | Owns |
| --- | --- | --- |
| `requirements/` | [SRS](requirements/TenantFlow-SRS.md) | Product rules, tenant boundaries, required behavior, MVP versus future scope |
| `requirements/` | [Backend Requirements](requirements/BACKEND_REQUIREMENTS.md) | Backend constraints, accepted auth contract, model candidates and unresolved design choices |
| `docs/` (temporary) | [Session Auth Development Plan](SESSION_AUTH_DEVELOPMENT_PLAN.md) | Active slice checklist and remaining Step 1 proposals; retire after preserving decisions/evidence |
| `architecture/` | [Backend Conventions](architecture/BACKEND_CONVENTIONS.md) | Responsibilities, Nest request lifecycle diagram, security/data conventions, review agreement |
| `architecture/decisions/` | [ADR 0001: Backend Stack and Session Auth](architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) | Accepted TypeORM/session/supporting-stack decision, alternatives, consequences and unverified implementation details |
| `setup/` | [Start Here](setup/START_HERE.md) | Commands for the existing checkout and onboarding order |
| `backend/` | [Backend README](../backend/README.md) | Current commands, environment loading, formatting, aliases and runtime limitations |
| `setup/` | [Environment and Ignore Rules](setup/ENV_AND_GITIGNORE_SETUP.md) | Actual environment consumers, secret handling, build/runtime boundaries |
| `setup/` | [PostgreSQL Setup](setup/POSTGRESQL_SETUP.md) | Development database operation and persistent data |
| `planning/` | [Implementation Roadmap](planning/ROADMAP.md) | Current milestone status and sequencing |
| `planning/` | [Validation and Follow-ups](planning/VALIDATION.md) | Retained verification evidence, limits, outstanding manual checks |
| `planning/releases/1.0.0/` | [Version Plan](planning/releases/1.0.0/VERSION-PLANNING.md) | Release grouping and historical schedule |
| `planning/releases/1.0.0/` | [Future Roadmap](planning/releases/1.0.0/FUTURE-ROADMAP.md) | Enhancements beyond the canonical MVP |

The root [README](../README.md) owns the project overview. Root [schemas](../schemas.ts) and [enums](../enum.ts) are provisional vocabulary, not runtime contracts or migrations. [Frontend documentation](../frontend/README.md) stays beside that application; shared images stay in `assets/images/`.

## Keeping documents manageable

1. Update the owning document, then link to it from related guides. Avoid another setup-complete summary or duplicate source of milestone status.
2. Follow SRS product rules when documents conflict. Keep proposals, accepted decisions, existing files and verified behavior distinct. Remove superseded instructions and duplicate drafts as decisions change; retain useful evidence in the validation register and rationale in decision records.
3. Use descriptive filenames matching the existing uppercase guide names. Keep `README.md` as the index and link new documents here. Use relative links and repair incoming links whenever a file moves.
4. Record significant accepted technical decisions under `architecture/decisions/`: date, status, context, choice, alternatives, consequences and affected requirements. Keep current implementation state in the owning runtime/planning documents.
5. Keep completion evidence short: command/check, commit or environment, observed result, and remaining limitation. Keep secrets and account details out of documentation.
6. Remove completed temporary plans after preserving useful decisions and unfinished follow-ups in their owning documents. Git history retains the detailed change narrative.

Backend guidance follows [backend agent instructions](../backend/AGENTS.md). Keep review feedback in the conversation; use the backend README for runtime instructions.
