import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const backend = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const container = `tenantflow-registration-db-${randomUUID()}`;
const ownerLabel = "io.tenantflow.test-owner=registration";
const database = "tenantflow_registration_test";
const username = "registration_test";
const password = randomUUID();
let owned = false;
let child;
let interrupted = false;

function docker(args, { allowFailure = false, timeout = 15000 } = {}) {
  const result = spawnSync("docker", args, { encoding: "utf8", windowsHide: true, timeout });
  if (!allowFailure && (result.error || result.status !== 0)) {
    throw new Error(`Docker ${args[0]} failed: ${result.error?.message || result.stderr.trim()}`);
  }
  return result;
}

const onSignal = () => {
  interrupted = true;
  child?.kill("SIGTERM");
};
process.once("SIGINT", onSignal);
process.once("SIGTERM", onSignal);

try {
  docker(["version", "--format", "{{.Server.Version}}"]);
  console.log("Preparing disposable PostgreSQL 17 for registration tests...");
  docker(
    [
      "create",
      "--name",
      container,
      "--label",
      ownerLabel,
      "--publish",
      "127.0.0.1::5432",
      "--mount",
      "type=tmpfs,destination=/var/lib/postgresql/data",
      "--env",
      `POSTGRES_DB=${database}`,
      "--env",
      `POSTGRES_USER=${username}`,
      "--env",
      `POSTGRES_PASSWORD=${password}`,
      "postgres:17",
    ],
    { timeout: 120000 },
  );
  owned = true;
  docker(["start", container]);

  const deadline = Date.now() + 90000;
  let ready = false;
  while (!interrupted && Date.now() < deadline) {
    const probe = docker(["exec", container, "pg_isready", "-h", "127.0.0.1", "-U", username, "-d", database], {
      allowFailure: true,
    });
    if (probe.status === 0) {
      ready = true;
      break;
    }
    await delay(250);
  }
  if (!ready) throw new Error(interrupted ? "Database test interrupted." : "PostgreSQL readiness timed out.");

  const mapping = docker(["port", container, "5432/tcp"]).stdout.trim();
  const port = /^127\.0\.0\.1:(\d+)$/.exec(mapping)?.[1];
  if (!port) throw new Error("Expected an isolated loopback PostgreSQL port mapping.");
  const env = {
    ...process.env,
    NODE_ENV: "test",
    TENANTFLOW_TEST_DB_OWNER: container,
    TENANTFLOW_TEST_DB_HOST: "127.0.0.1",
    TENANTFLOW_TEST_DB_PORT: port,
    TENANTFLOW_TEST_DB_USERNAME: username,
    TENANTFLOW_TEST_DB_PASSWORD: password,
    TENANTFLOW_TEST_DB_NAME: database,
  };
  // Use the installed runner directly; never load the application's .env file.
  child = spawn(
    process.execPath,
    [resolve(backend, "node_modules/vitest/vitest.mjs"), "run", "--config", "vitest.config.db.ts"],
    {
      cwd: backend,
      env,
      stdio: "inherit",
      windowsHide: true,
    },
  );
  const watchdog = setTimeout(() => {
    interrupted = true;
    child.kill("SIGTERM");
  }, 180000);
  try {
    const code = await new Promise((resolveExit, reject) => {
      child.once("error", reject);
      child.once("exit", (code) => resolveExit(code));
    });
    if (interrupted || code !== 0) throw new Error("PostgreSQL integration tests failed or were interrupted.");
  } finally {
    clearTimeout(watchdog);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Database test failed.");
  process.exitCode = 1;
} finally {
  process.removeListener("SIGINT", onSignal);
  process.removeListener("SIGTERM", onSignal);
  if (owned) {
    // Remove only this run's uniquely named and labelled container. No shared volume is mounted.
    const identity = docker(
      ["inspect", "--format", '{{ index .Config.Labels "io.tenantflow.test-owner" }}', container],
      { allowFailure: true },
    );
    if (identity.status !== 0 || identity.stdout.trim() !== "registration") {
      console.error(`Could not verify test-container ownership for cleanup: ${container}`);
      process.exitCode = 1;
    } else {
      const stop = docker(["stop", "--timeout", "10", container], { allowFailure: true, timeout: 20000 });
      const remove = docker(["rm", "--volumes", container], { allowFailure: true });
      if (stop.status !== 0 || remove.status !== 0) {
        console.error(`Test-container cleanup needs attention: ${container}`);
        process.exitCode = 1;
      } else {
        console.log("Removed disposable PostgreSQL container and its test storage.");
      }
    }
  }
}
