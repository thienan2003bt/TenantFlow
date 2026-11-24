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

- The developer owns new backend feature implementation and learning checkpoints. Preference updated on 24 November 2026: when the agent identifies a concrete fix within the current task, apply it directly and run the necessary verification rather than handing back repair instructions. Use the tool approval flow only when required by the environment; do not ask for redundant conversational permission. This authorizes identified fixes, not unrelated feature scaffolding, dependency installation, migration/database operations or Git/publication mutations. Continue guiding new feature implementation unless the user asks the agent to implement it.

- Strengthen the backend gradually through small, verifiable checkpoints tied to specific requirements. For each guidance batch, state the current objective, give the smallest useful next steps and define evidence of completion. Do not require every milestone or production criterion at once; keep the working plan in the chat and update accepted requirements only when their contract changes. Include correctness and security controls needed by the behavior introduced now, and distinguish a completed checkpoint from a completed feature or milestone.

- Develop the minimum workable end-to-end feature first, then polish it through later increments. Prefer the smallest implementation that demonstrates the agreed behavior; keep necessary validation, security and data-integrity controls with that behavior. Defer optional abstractions, broad automation, optimization and production-only infrastructure instead of making them prerequisites for the first local feature. Keep detailed deferred work in the chat and give one immediate checkpoint at a time. This preference applies throughout TenantFlow.

- The NestJS application belongs inside `backend/`, alongside the independent `frontend/` project. Keep its package/lockfile, source, tests and configuration there. Use [backend commands and configuration](backend/README.md) and [engineering conventions](docs/architecture/BACKEND_CONVENTIONS.md). Give review findings in the conversation; do not create a separate review document unless requested. The completed setup walkthrough has been removed.

- Prefer instructions for the developer to run the local Nest CLI generators: module first, then controller and service. Keep the default colocated feature structure under `backend/src/<feature>/` and explain automatic registration versus behavior the developer must implement. Do not impose extra `modules/`, `controllers/` or `services/` folders by default, and do not run generators on the developer's behalf.

- Follow [backend guidance instructions](backend/AGENTS.md) for research and reviews: verify usage against official documentation and relevant maintainer/developer discussions, then present each step's objective, action, command/working directory and expected check. State verification limits explicitly.

- Preserve the existing Next.js/Stack Auth frontend, its assets/license, root TypeScript model references, and PostgreSQL data/volume configuration unless the task explicitly changes them.

- Backend retirement is complete and its temporary plan has been removed. Use the [documentation index](docs/README.md) for document ownership and [verification coverage](docs/planning/VALIDATION.md) for current evidence and its limits. Do not recreate the retired tracker.

- Use the [SRS](docs/requirements/TenantFlow-SRS.md) for product rules and release boundaries, [backend requirements](docs/requirements/BACKEND_REQUIREMENTS.md) for backend design candidates/open decisions, and [roadmap](docs/planning/ROADMAP.md) for implementation sequencing. Version documents express release intent; historical dates are not current delivery commitments.

- Resolve conflicting documentation against the canonical requirements. Preserve accepted product rules when consolidating documents. Keep detailed work plans and review discussion in the chat.

- Extract useful framework-independent requirements before deleting a mixed document. Remove stale references and broken links together with retired files; inspect tracked files even when ignore rules hide them.

- Preserve the developer's explicit TypeScript variable annotations and add readable annotations for variables in new/edited TypeScript code. Do not remove them merely because inference is possible. Use braced, multiline if branches; never put an if body on the condition's line. See backend instructions for enforcement.

## Verification and handoff

- Check the working tree and applicable instructions before editing; preserve unrelated user changes and continue on the intended branch.

- Run checks appropriate to the change. For documentation edits, review scope consistency, local links/anchors, reference accuracy, and whitespace; do not install application dependencies solely to test prose.

- For configuration or code changes, check affected behavior and required build/test workflows where available. Record missing tools, credentials, dependencies, or external access as unverified checks with concrete next actions.

- Keep requirements, design candidates, and implemented database behavior distinct. Do not treat schema comments or tutorial examples as approved constraints or executable migrations.

- Leave each batch concrete and reviewable. Update the current explanation in its owning document. Keep detailed implementation plans in the chat and executable cases in tests; do not append work diaries or new-case backlogs to documentation.

## Documentation

- Each related document has a hard maximum of 300 lines, 120 words per line and 200 words per statement.

- A statement is a prose paragraph, list item or table entry. Prefer short paragraphs and useful examples.

- Write for a human reader with a specific question. Keep each document's purpose clear and avoid duplicated guidance.

- Documentation is not an agent backlog. Keep changing plans/reviews in the chat and new cases in tests.

- Replace outdated explanations instead of appending chronological work logs or speculative case inventories.

- A validation page summarizes current evidence and its limits; it does not accumulate task IDs and historical runs.

## Suggested commit messages

Whenever you complete repository changes, including code, configuration, or documentation, include one suitable suggested commit message in your final response.

- Keep the entire message to **20 words or fewer**, including the prefix.

- Use a conventional prefix matching the change, such as `docs:`, `chore:`, `fix:`, `test:` or `refactor:`.

- Describe the completed batch accurately. Do not claim pending work is done.

- Present the suggestion on a single line in a code block. A suggested message is not a claim that a commit was created.
