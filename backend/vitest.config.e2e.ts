import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    env: { NODE_ENV: "test", PORT: "14400" },
    globals: true,
    root: "./",
    include: ["**/*.e2e-spec.ts"],
  },
});
