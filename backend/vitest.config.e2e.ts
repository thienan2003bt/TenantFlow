import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // HTTP smoke tests override the DataSource; these values never connect to PostgreSQL.
    env: {
      NODE_ENV: "test",
      PORT: "14400",
      DB_HOST: "database.invalid",
      DB_PORT: "5432",
      DB_USERNAME: "http_smoke",
      DB_PASSWORD: "http_smoke_only",
      DB_NAME: "tenantflow_http_smoke",
    },
    globals: true,
    root: "./",
    include: ["**/*.e2e-spec.ts"],
  },
});
