# Environment and Ignore Rules

The backend currently has requirements and design references only. No backend database connection string, token-signing key, email, storage, or payment setting is consumed by this checkout.

## Files and consumers

| File | Consumer | Purpose |
| --- | --- | --- |
| `frontend/.env.local` | Next.js in `frontend/` | Local frontend development/build configuration; copy the adjacent `.env.local.example`. |
| Root `.env` | Docker Compose interpolation | Optional frontend container runtime values; copy root `.env.example`. Compose does not automatically make this a Next.js local env file. |
| Root `docker-compose.yml` | Docker Compose | PostgreSQL development settings and frontend container configuration. PostgreSQL values are currently set directly in this file. |
| CI secrets | Frontend workflow | Project-specific Stack Auth settings used by the existing build steps. No values are committed in examples. |

Both examples name the same three frontend settings:

| Variable | Visibility and use |
| --- | --- |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Browser-public Stack Auth project identifier. |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Browser-public publishable client key. |
| `STACK_SECRET_SERVER_KEY` | Private server-side key. Never rename it with a browser-public prefix or expose it in responses, logs, or client code. |

Populate values from your Stack Auth project. Local Next.js development is the documented startup path in [START_HERE](START_HERE.md). The existing frontend container build-time handoff needs verification before it is treated as supported onboarding; runtime environment alone is not proof that a Next.js build received its public settings.

PostgreSQL's current local database/user are `tenantflow_dev`/`tenantflow`; its development password is visible in Compose. These are development defaults, not production credentials. Changing an initialization password does not update an already initialized database volume.

## Ignore behavior

Root ignore rules cover local env files, private key files, Node dependencies, Next/build outputs, logs, temporary files, and relevant OS/editor artifacts. Example env files remain trackable.

From the repository root, inspect representative paths without creating them:

```powershell
git check-ignore -v .env .env.local frontend/.env.local frontend/node_modules/example frontend/.next/example
git check-ignore .env.example frontend/.env.local.example
```

The second command should print nothing and return exit code 1. An ignore rule does not untrack a file already in Git; inspect tracked files separately with `git ls-files`.

## Future backend configuration

Define settings alongside actual NestJS consumers, document their loading source and precedence, and validate required values at startup. Keep database host/container distinctions explicit. Separate credentials between environments and use deployment secret management when needed. Provider-owned credentials and sessions must not be duplicated by default.

Do not log real values, commit local env files, or copy credentials into requirements and PR descriptions. See [backend requirements](../init/BACKEND_REQUIREMENTS.md) for the unresolved identity and integration boundaries.
