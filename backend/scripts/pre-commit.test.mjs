import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { runPreCommit } from "./pre-commit.mjs";

function fixture(paths, options = {}) {
  const reads = [];
  const runs = [];
  const root = join(process.cwd(), "repository with spaces");
  const status = runPreCommit({
    read(command, args, settings) {
      reads.push({ command, args, settings });
      if (args[0] === "rev-parse") return root + "\n";
      return paths;
    },
    run(command, args, settings) {
      runs.push({ command, args, settings });
      return options.result?.(runs.length) ?? { status: 0 };
    },
    log() {},
    platform: options.platform ?? "linux",
    env: { ComSpec: "C:\\Windows\\System32\\cmd.exe" },
  });
  return { status, reads, runs, root };
}

test("empty, frontend-only and similarly named paths skip backend checks", () => {
  for (const paths of ["", "frontend/app.ts\0README.md\0", "backend-tools/file.ts\0docs/backend/file.md\0"]) {
    const result = fixture(paths);
    assert.equal(result.status, 0);
    assert.equal(result.runs.length, 0);
  }
});

test("staged backend changes run only lint, unit and e2e in the backend directory", () => {
  const result = fixture("frontend/app.ts\0backend/src/example.ts\0");
  assert.equal(result.status, 0);
  assert.deepEqual(
    result.runs.map(({ args }) => args),
    [
      ["run", "lint"],
      ["run", "test"],
      ["run", "test:e2e"],
    ],
  );
  assert.ok(result.runs.every(({ settings }) => settings.cwd === join(result.root, "backend")));
  assert.deepEqual(result.reads[1].args, ["diff", "--cached", "--name-only", "--no-renames", "-z", "--"]);
});

test("deletion/rename sides and filenames containing whitespace still trigger checks", () => {
  // With --no-renames, a rename is represented as deletion + addition.
  for (const paths of [
    "backend/deleted.ts\0",
    "backend/old.ts\0frontend/new.ts\0",
    "frontend/old.ts\0backend/new.ts\0",
    "backend/a\nb c.ts\0",
  ]) {
    assert.equal(fixture(paths).runs.length, 3);
  }
});

test("each failing check stops later checks and returns failure", () => {
  for (const failureAt of [1, 2, 3]) {
    const result = fixture("backend/package.json\0", {
      result: (count) => ({ status: count === failureAt ? 2 : 0 }),
    });
    assert.equal(result.status, 2);
    assert.equal(result.runs.length, failureAt);
  }
});

test("an unavailable npm command fails closed", () => {
  const result = fixture("backend/package.json\0", {
    result: () => ({ status: null, error: new Error("npm unavailable") }),
  });
  assert.equal(result.status, 1);
  assert.equal(result.runs.length, 1);
});

test("Windows invokes fixed npm commands through the command interpreter", () => {
  const result = fixture("backend/source with spaces.ts\0", { platform: "win32" });
  assert.equal(result.status, 0);
  assert.equal(result.runs[0].command, "C:\\Windows\\System32\\cmd.exe");
  assert.deepEqual(
    result.runs.map(({ args }) => args),
    [
      ["/d", "/c", "npm run lint"],
      ["/d", "/c", "npm run test"],
      ["/d", "/c", "npm run test:e2e"],
    ],
  );
});

test("Git inspection failure stops the hook without running checks", () => {
  let ran = false;
  assert.equal(
    runPreCommit({
      read() {
        throw new Error("Git unavailable");
      },
      run() {
        ran = true;
      },
      log() {},
    }),
    1,
  );
  assert.equal(ran, false);
});
