# Backend implementation review

Reviewed 18 October 2026. This review covers the developer's bootstrap, configuration validator, environment enum, controller/service, tests and tooling. Application behavior findings remain for the developer to address; the agent changed quote formatting and enum-alias configuration only.

[Backend commands and configuration](../../backend/README.md) · [Engineering conventions](BACKEND_CONVENTIONS.md) · [Validation register](../planning/VALIDATION.md)

## Findings

| ID / priority | Location | Finding and evidence | Objective, correction and completion check |
| --- | --- | --- | --- |
| R-01 / medium | [main.ts](../../backend/src/main.ts), line 20 | `app.listen(PORT)` omits the host. Node binds to unspecified network interfaces rather than the loopback-only listener in the earlier local setup target. Logging `localhost` does not change the listener. | Decide the local exposure policy. For local-only development, explicitly bind to `127.0.0.1`. Verify the bound address and confirm the documented health request still returns 200. Deployment binding can be a separate explicit choice. |
| R-02 / medium | [env.validation.ts](../../backend/src/config/env.validation.ts), lines 16-19 and 25-30 | `@IsNumber()` with minimum/maximum bounds accepts fractions. A direct call with synthetic `PORT='14400.5'` returned the number `14400.5` without a validation error. Implicit conversion also accepted `1e4` as 10000. | Require an integer port, such as with `@IsInt()`, as well as the existing range. Decide whether only decimal-digit environment strings are accepted before conversion. Add cases for a valid port, fractional/out-of-range/nonnumeric/empty/missing values and invalid `NODE_ENV`. Invalid settings must fail during configuration validation, before listening. |
| R-03 / medium | [app.e2e-spec.ts](../../backend/test/app.e2e-spec.ts), lines 19-23; [controller unit test](../../backend/src/app.controller.spec.ts) | Both existing tests pass, but only assert the original Hello World route/method. Neither tests `/health-check`, configuration failure or listener/CORS setup. The e2e test initializes `AppModule` without executing `main.ts`. | Add an HTTP regression for `/health-check` and validator tests using synthetic inputs. Check actual bootstrap separately, or share bootstrap setup with HTTP tests when it becomes substantial. Keep real env files out of test assumptions. A green Hello World test does not certify these behaviors. |
| R-04 / medium | [backend environment example](../../backend/.env.example) | The example is empty (0 bytes), while `NODE_ENV` and `PORT` are required by the current validator. Copying it alone cannot produce a working local configuration. | Populate the example with safe `NODE_ENV=development` and `PORT=14400` values. Verify a local copy starts successfully, and document how process variables override the file. No real secrets belong in the example. |
| R-05 / low | [app.service.ts](../../backend/src/app.service.ts), lines 9-10 | `/health-check` returns 200 with `Service is healthy!` and `text/html; charset=utf-8`. This meets the HTTP-200 objective but differs from the earlier guide's `{ "status": "ok" }` JSON contract. Both compiled and watch-mode requests reproduced it. | Choose the intended public contract. If retaining the earlier JSON contract, return a deliberately typed object and update the controller's return type. Assert status, body and content type in the HTTP regression. This liveness response does not certify database readiness. |
| R-06 / low | [main.ts](../../backend/src/main.ts), lines 13-14 | `app.enableCors()` currently permits arbitrary origins. A request with `Origin: https://untrusted.invalid` received `Access-Control-Allow-Origin: *`. | Keep the scope deliberate: omit CORS until browser API calls need it, or configure the actual frontend-origin allowlist. Check allowed and disallowed origins. CORS is a browser response policy, not authentication or network isolation. |
| R-07 / low | [main.ts](../../backend/src/main.ts), line 11 | `getOrThrow<number>("PORT") ?? 3000` has an unreachable fallback: `getOrThrow` throws when the value is absent. Its generic does not perform conversion. | Retain the validated required-port contract and remove the misleading fallback, or define a default deliberately in validation. Verify missing/invalid values follow the selected contract. |

The health method currently lives in `AppController`/`AppService`, and no dedicated health feature module is present. Nest permits a small application with just a root module, so this is not a correctness defect. It differs from the generator exercise; use a dedicated module when that boundary is useful rather than claiming it already exists.

## Verified behavior and limits

Installed versions inspected: Node.js 24.21.0, Nest core 12.1.3, Nest CLI 12.0.8, TypeScript 6.0.3, Prettier 3.9.10, Vite 8.3.4 and Vitest 4.1.12.

| Check | Actual result |
| --- | --- |
| Existing unit suite | Passed: one test, covering Hello World. |
| Existing e2e suite | Passed: one test, covering Hello World. `NODE_ENV=test` and `PORT=14400` were supplied explicitly. |
| Type checking | Passed with no emit and incremental output disabled. |
| Type-aware lint and formatting | Passed with the requested double-quote configuration. |
| Nest build | Passed. The source enum alias was emitted as `../enums/environment.enum.js`. |
| Compiled Node startup | HTTP 200 from `/health-check`, returning the current plain-text body. Used a temporary available port supplied through `PORT` to avoid disturbing an existing developer server. |
| Nest watch startup | Same HTTP 200/body and alias behavior. No source file was changed to trigger a watch restart. |
| Synthetic validator checks | Accepted `14400`; also accepted `14400.5` and `1e4`, as noted above. Rejected empty and out-of-range `65536` values. |

The requested tooling changes add no dependencies and do not change application behavior. The review did not implement the findings, certify production security, exercise frontend identity flows or verify database behavior. The completed setup walkthrough was removed at the developer's request; its intended endpoint/configuration gaps remain explicit above.

## Sources checked

The recommendations above were checked against [Nest configuration](https://docs.nestjs.com/techniques/configuration), [CORS](https://docs.nestjs.com/security/cors), [controller responses](https://docs.nestjs.com/controllers#routing), [testing](https://docs.nestjs.com/fundamentals/testing), [Node listening-host behavior](https://nodejs.org/api/net.html#serverlistenport-host-backlog-callback), and the installed class-validator implementation. The [class-validator project](https://github.com/typestack/class-validator) documents integer validation.

For the requested alias and formatting configuration, the relevant primary references are [TypeScript paths](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths), [Nest CLI compilation](https://docs.nestjs.com/cli/usages#nest-build), [Vite tsconfig-path resolution](https://vite.dev/config/shared-options.html#resolve-tsconfigpaths), and [Prettier quotes](https://prettier.io/docs/options#quotes). The [TypeScript alias-extension issue](https://github.com/microsoft/TypeScript/issues/61991) and [Oxc formatter discussion](https://github.com/oxc-project/oxc/discussions/19642) provide maintainer/community context; local compilation and runtime checks establish the behavior in this repository.
