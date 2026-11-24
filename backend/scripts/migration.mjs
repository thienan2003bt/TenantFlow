import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [action, ...args] = process.argv.slice(2);
const actions = new Set(["generate", "show", "run", "revert"]);
const usage = "Use npm run db:migration:generate -- MigrationName, or npm run db:migration:show|run|revert.";

if (!actions.has(action)) {
  console.error(usage);
  process.exitCode = 1;
} else if (args.length === 1 && args[0] === "--help") {
  console.log(usage);
  console.log("Commands rebuild first, load backend/.env and use the shared compiled DataSource.");
  console.log("Generation writes a migration file; run applies pending migrations; revert undoes the latest one.");
} else if (action === "generate" ? args.length !== 1 || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(args[0]) : args.length !== 0) {
  console.error("Generation requires one migration name (letters, digits, underscores or hyphens), not a path.");
  console.error("Show, run and revert accept no arguments. Use --help for usage.");
  process.exitCode = 1;
} else {
  const cliArguments = [
    "--env-file=.env",
    resolve(backendDirectory, "node_modules/typeorm/cli.js"),
    `migration:${action}`,
    "-d",
    resolve(backendDirectory, "dist/database/data-source.js"),
  ];

  if (action === "generate") {
    cliArguments.push(resolve(backendDirectory, "src/database/migrations", args[0]));
  }

  const result = spawnSync(process.execPath, cliArguments, {
    cwd: backendDirectory,
    stdio: "inherit",
    windowsHide: true,
  });

  if (result.error) {
    console.error(`Could not start TypeORM: ${result.error.message}`);
  }
  process.exitCode = result.status ?? 1;
}
