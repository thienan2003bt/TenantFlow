# Verification coverage

This page explains the evidence behind the current backend, not the project's task queue.
Commands and browser instructions live in the [backend guide](../../backend/README.md).

## Current evidence

The full review on 25 November 2026 passed typecheck, lint, formatting, 231 tests,
39 application HTTP checks, seven hook checks, Nest build and compiled blocklist smoke.
All 13 isolated PostgreSQL cases passed and their disposable container/storage were removed.
These results describe the reviewed code, not every environment where it may be run.

The developer separately reported passing earlier manual isolated-schema checks.
Keep that report distinct from automated evidence.

## Automated checks

npm.cmd run check covers input/email/password rules, Unicode safeguards, blocklist behavior,
registration orchestration, duplicates, safe errors and the HTTP request pipeline.
It verifies CORS, native CSRF, body limits, parser errors and socket-IP throttling.
It also verifies copied blocklist assets and compiled loading outside the source working directory.

Regression coverage includes unknown inherited-method fields and browser-readable Retry-After.
Compiled-runtime checks passed, and pinned password-list/additions/license hashes matched their metadata.

## Database tests

npm.cmd run test:db uses a guarded, disposable PostgreSQL 17 instance.
It verifies migration apply/revert/reapply, defaults, real password hashes, duplicate credential preservation,
rollback and overlapping unique-email transactions.

Protected HTTP cases cover new/duplicate input, validation, CSRF/throttle denial,
and a safe 503 with rollback after a synthetic server-reported connection failure.
That synthetic failure is not a physical network-outage simulation.

## Coverage limits

The localhost check page was opened in a real browser: origin http://localhost:3000, secure context true.
Its credentialed health request returned 200 and Service is healthy!.
The six-request browser registration sequence has not been executed by the agent.
Node HTTP tests do not replace that registration acceptance check.

Hosted backend CI, production operation and the unimplemented login/session lifecycle are not covered here.
Some standalone schema constraints have manual evidence rather than dedicated automated cases.
Stack Auth frontend screens do not establish that the Nest endpoint works.

## Historical context

The frontend/Compose foundation has a separately recorded successful
[CI run](https://github.com/thienan2003bt/TenantFlow/actions/runs/39048634979).
It checked frontend build/image and PostgreSQL readiness, not TenantFlow account/session behavior.
Detailed work history remains in Git and the chat rather than being appended here.
