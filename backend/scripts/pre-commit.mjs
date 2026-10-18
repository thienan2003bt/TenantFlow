import { execFileSync, spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const checks = [
  { label: "ESLint", script: "lint" },
  { label: "Nest unit tests", script: "test" },
  { label: "Nest e2e tests", script: "test:e2e" },
];

export function runPreCommit({
  read = execFileSync,
  run = spawnSync,
  log = console.log,
  platform = process.platform,
  env = process.env,
} = {}) {
  let repositoryRoot;
  let stagedPaths;

  try {
    repositoryRoot = read("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
    // No rename detection: both the old and new paths participate in the gate.
    // NUL separation preserves spaces, Unicode and newlines in filenames.
    stagedPaths = read("git", ["diff", "--cached", "--name-only", "--no-renames", "-z", "--"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
  } catch (error) {
    log(`[pre-commit] Could not inspect staged changes: ${error.message}`);
    return 1;
  }

  if (!stagedPaths.split("\0").some((file) => file.startsWith("backend/"))) {
    log("[pre-commit] No staged backend changes; skipping backend checks.");
    return 0;
  }

  for (const { label, script } of checks) {
    log(`[pre-commit] ${label}`);
    // Windows npm.cmd requires a command interpreter. Only fixed script names
    // enter this command; staged filenames are never passed to a shell.
    const command = platform === "win32" ? (env.ComSpec ?? "cmd.exe") : "npm";
    const args = platform === "win32" ? ["/d", "/c", `npm run ${script}`] : ["run", script];
    const result = run(command, args, {
      cwd: join(repositoryRoot, "backend"),
      env,
      stdio: "inherit",
      windowsHide: true,
    });

    if (result.error || result.status !== 0) {
      log(`[pre-commit] ${label} failed; commit stopped.${result.error ? ` ${result.error.message}` : ""}`);
      return result.status || 1;
    }
  }

  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = runPreCommit();
}
