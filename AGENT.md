# Agent Instructions

Apply these repository conventions within the current task instructions. The user's explicit direction takes precedence over repository defaults.

## Git and publication authority

- Git access is read-only for the agent. Do not run `git add`, `git commit`, `git push`, `git pull`, `git fetch`, or any command that changes the index, working tree, branches, refs, history, repository configuration, or remote state.
- Do not bypass this restriction through direct `.git` edits, credential helpers, GitHub connectors/APIs, or other tools that perform equivalent repository mutations or publication.
- Make requested file edits, then provide suggested commands, commit messages, and PR text in the response for the user to execute or publish. Leave staging, committing, synchronization, branch changes, and publication to the user.
- Requests to implement changes, finish a cleanup step, validate CI, or prepare a PR do not authorize Git mutations or publication. Do not perform these actions automatically or routinely ask to perform them; provide text instead.

## Communication

- Lead with the result or intended action. Use plain language, short paragraphs, and concise explanations; use lists when they make parallel information easier to scan.
- Before tool-based work, give a brief update describing the scope. During longer work, report meaningful findings, decisions, and remaining uncertainty.
- Make reasonable implementation and editorial choices within the authorized scope. Ask for clarification when a missing answer would materially change product behavior or risk losing useful information.
- Make the final response self-contained: explain what changed, why it matters, what was actually checked, and any unfinished work or material limitation. Link relevant local files using clickable Markdown links.
- Clearly distinguish planned behavior, existing scaffolding, and verified working features. Never describe an intended command, skipped check, placeholder test, or unexecuted workflow as successful validation.
- State commit, push, PR, and deployment status accurately. Do not imply that a Git or publishing action happened without evidence.

## Repository context and scope

- The developer owns every line of backend implementation. Keep agent work to instructions, documentation, reviews and feedback unless the user explicitly changes that agreement. Do not scaffold, generate, patch or auto-fix backend source, tests, migrations, dependency manifests, or runtime/build configuration. Suitable read-only checks are allowed; leave installs, builds, generated artifacts and auto-fixes as commands for the developer to execute.
- The planned NestJS application belongs at the repository root (`package.json`, `src/`, `test/`, `nest-cli.json`), alongside the independent `frontend/` project. See the [setup guide](docs/setup/NESTJS_BACKEND_SETUP.md) and [engineering conventions](docs/architecture/BACKEND_CONVENTIONS.md). These paths are proposed, not implemented.
- Preserve the existing Next.js/Stack Auth frontend, its assets/license, root TypeScript model references, and PostgreSQL data/volume configuration unless the task explicitly changes them.
- Backend retirement is complete and its temporary plan has been removed. Use the [documentation index](docs/README.md) for document ownership and [validation and follow-ups](docs/planning/VALIDATION.md) for retained evidence and open manual/design work. Do not recreate the retired tracker.
- Use the [SRS](docs/requirements/TenantFlow-SRS.md) for product rules and release boundaries, [backend requirements](docs/requirements/BACKEND_REQUIREMENTS.md) for backend design candidates/open decisions, and [roadmap](docs/planning/ROADMAP.md) for implementation sequencing. Version documents express release intent; historical dates are not current delivery commitments.
- Resolve conflicting documentation against the canonical requirements. Preserve useful displaced ideas in the future backlog or design notes, record the reconciliation, and keep genuinely unresolved implementation decisions explicit.
- Extract useful framework-independent requirements before deleting a mixed document. Remove stale references and broken links together with retired files; inspect tracked files even when ignore rules hide them.

## Verification and handoff

- Check the working tree and applicable instructions before editing; preserve unrelated user changes and continue on the intended branch.
- Run checks appropriate to the change. For documentation edits, review scope consistency, local links/anchors, reference accuracy, and whitespace; do not install application dependencies solely to test prose.
- For configuration or code changes, check affected behavior and required build/test workflows where available. Record missing tools, credentials, dependencies, or external access as unverified checks with concrete next actions.
- Keep requirements, design candidates, and implemented database behavior distinct. Do not treat schema comments or tutorial examples as approved constraints or executable migrations.
- Leave each batch concrete and reviewable. Identify the next implementation/review checkpoint in the roadmap and keep outstanding validation visible in the follow-up register. Update the owning document rather than adding duplicate status summaries.

## Suggested commit messages

Whenever you complete repository changes, including code, configuration, or documentation, include one suitable suggested commit message in your final response.

- Keep the entire message to **20 words or fewer**, including the prefix.
- Use a conventional prefix matching the change, such as `docs:`, `chore:`, `fix:`, `test:` or `refactor:`.
- Describe the completed batch accurately. Do not claim pending work is done.
- Present the suggestion on a single line in a code block. A suggested message is not a claim that a commit was created.
