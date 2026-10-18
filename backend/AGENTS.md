# Backend guidance and review instructions

These instructions apply to `backend/` and to guidance about this application. Read the repository's [AGENT.md](../AGENT.md) as well.

## Developer ownership

The developer writes backend behavior, source and tests. Default to instructions, reviews and feedback. Only edit code or configuration when the user explicitly authorizes that scope. A review request does not authorize automatically fixing the findings. The current quote-style and enum-alias configuration request authorizes those changes and their verification, not unrelated application behavior changes.

Keep the application in `backend/`, use the installed local Nest CLI, and retain the selected ESM/Vitest conventions. Prefer the CLI's colocated feature structure and `--format` when adding features; the developer runs generators unless explicitly asking the agent to do so.

## Research before giving instructions

1. Inspect the relevant files, installed versions, module registration, scripts and existing checks first. Distinguish what exists from what is proposed or verified.
2. Before recommending Nest APIs, commands or architecture, confirm their usage against the official NestJS documentation for the installed release. Check official TypeScript, Node.js, Vite/Vitest, Prettier or library documentation when the behavior belongs to those tools.
3. Check relevant maintainer issues/discussions or developer forums for compatibility problems, unclear behavior and workarounds. Treat community reports as supporting context; confirm technical conclusions using primary documentation, installed source or a reproducible check. Do not present a forum suggestion as an official recommendation.
4. Link the sources supporting version-sensitive instructions, explain how they apply to the installed versions, and distinguish documented behavior from local verification. Reuse already verified sources within the same task when still applicable.
5. If a claim cannot be verified, state that limitation and the check still needed. Do not invent a command, package option or successful result. Routine choices within the user's scope do not require another permission question.

## How to present implementation instructions

Begin with the intended result and prerequisites. For each step, explain:

- **Objective:** the behavior or boundary this step establishes.
- **Action:** the precise files/components and changes the developer should make; explain why they belong there.
- **Command:** the exact command, working directory and required configuration, when a command is needed.
- **Check:** expected successful output/HTTP behavior, relevant failure cases, and what evidence establishes completion.

Keep steps small and ordered. Clearly separate generator-created files/registrations from behavior the developer writes. Avoid unrelated future infrastructure in the current milestone. Use the existing scripts and report which checks were actually run rather than calling a proposed check complete.

For reviews, lead with actionable findings ordered by severity, including file/line references, observed impact, evidence and a correction the developer can implement. Distinguish correctness/security findings from optional structure or style preferences. If tests pass but miss relevant behavior, explain that coverage limit.

## Current formatting and import conventions

- Use double quotes for import/export specifiers. Prettier owns formatting; use `npm.cmd run format` and `npm.cmd run format:check` from `backend/`.
- Source enum imports use `@enums/environment.enum.ts`, backed by the ordered `paths` mapping in `tsconfig.json`. Do not simplify that mapping without proving type-check, Nest build/watch, compiled Node startup and Vitest behavior together.
- Build through the Nest CLI. Plain `tsc` does not perform Nest's alias rewrite. Do not disable TypeScript diagnostics or change the module system to hide an unresolved alias.
- Keep the backend port configurable, with `14400` as the documented local choice. Treat listener host and CORS policy as explicit decisions; a port number does not enforce access control.

Sources to consult include [Nest CLI](https://docs.nestjs.com/cli/usages), [configuration](https://docs.nestjs.com/techniques/configuration), [testing](https://docs.nestjs.com/fundamentals/testing), [TypeScript module resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths), and [Prettier options](https://prettier.io/docs/options#quotes). These links are starting points, not substitutes for verifying the affected behavior.
