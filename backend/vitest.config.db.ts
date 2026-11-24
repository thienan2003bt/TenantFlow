import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: { decorator: { legacy: true, emitDecoratorMetadata: true } },
  resolve: { tsconfigPaths: true },
  test: {
    env: { NODE_ENV: "test", PORT: "14400" },
    globals: true,
    root: "./",
    include: ["test/**/*.db-spec.ts"],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
