# Environment and Ignore Rules

The backend currently has requirements and design references only. No backend database connection string, token-signing key, email, storage, or payment setting is consumed by this checkout.

## Files and consumers

| File | Consumer | Purpose |
| --- | --- | --- |
| `frontend/.env.local` | Next.js in `frontend/` | Local frontend development/build configuration; copy the adjacent `.env.local.example`. |
| Root `.env` | Docker Compose interpolation and build-secret source | Frontend public build arguments, private build secret and runtime values; copy root `.env.example`. Compose does not automatically make this a Next.js local env file. |
| Root `docker-compose.yml` | Docker Compose | PostgreSQL development settings and frontend container configuration. PostgreSQL values are currently set directly in this file. |
| CI secrets | Frontend workflow | Project-specific Stack Auth settings used by the existing build steps. No values are committed in examples. |

Both examples name the same three frontend settings:

| Variable | Visibility and use |
| --- | --- |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Browser-public Stack Auth project identifier. |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Browser-public publishable client key. |
| `STACK_SECRET_SERVER_KEY` | Private server-side key. Never rename it with a browser-public prefix or expose it in responses, logs, or client code. |

Populate values from your Stack Auth project. Local and container startup commands are in [START_HERE](START_HERE.md). A build with fake credentials verifies compilation/configuration only; it does not verify real authentication or project membership.

## Container build and runtime contract

- The two `NEXT_PUBLIC_` values are declared Docker build arguments and supplied by Compose or CI. Next.js embeds public settings during the build, so rebuild when changing them; runtime values must identify the same project.
- `STACK_SECRET_SERVER_KEY` is supplied to the build using the `stack_secret_server_key` BuildKit secret, exposed only to the build command as an environment variable. It is not a Docker build argument or Dockerfile `ENV` instruction. Compose sources it from the root environment; CI passes it through the step's environment and `--secret`.
- The running server still needs `STACK_SECRET_SERVER_KEY`; Compose passes it as a runtime environment variable. Build secrets do not configure the running container.
- `frontend/.dockerignore` excludes local env files, keys, dependencies and generated output while keeping empty example templates. Do not copy local credentials into the build context.
- Use BuildKit/buildx and Compose with environment-sourced build-secret support. A standalone Compose CLI without a working Docker engine/buildx can render configuration but cannot validate the image or database runtime.

This follows the [Next.js 15 build-time environment contract](https://nextjs.org/docs/15/app/guides/environment-variables#bundling-environment-variables-for-the-browser), [Docker BuildKit secret handling](https://docs.docker.com/build/building/secrets/), and [Compose build-secret specification](https://docs.docker.com/reference/compose-file/build/#secrets). Local rendering/artifact checks and corrected hosted image build/start/HTTP smoke passed. Real authenticated-flow validation remains open; see the [final evidence](../../BACKEND_CLEANUP_PLAN.md#10-step-7-pr-handoff).

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
