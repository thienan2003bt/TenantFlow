import { QueryFailedError } from "typeorm";
import { describe, expect, it } from "vitest";
import { isPersistenceUnavailable } from "./is-persistence-unavailable.js";

const unavailableCodes: readonly string[] = [
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "08000",
  "08001",
  "08003",
  "08006",
  "57P01",
  "57P02",
  "57P03",
  "53300",
];

describe("isPersistenceUnavailable", () => {
  it.each(unavailableCodes)("recognizes raw connection failure %s without matching its message", (code) => {
    const error: Error = Object.assign(new Error("Arbitrary or localized message"), { code });
    expect(isPersistenceUnavailable(error)).toBe(true);
  });

  it.each(unavailableCodes)("recognizes %s inside a real TypeORM QueryFailedError", (code) => {
    const driverError: Error = Object.assign(new Error("Arbitrary driver message"), { code });
    const error: QueryFailedError = new QueryFailedError("INSERT", ["sensitive-parameter"], driverError);
    expect(isPersistenceUnavailable(error)).toBe(true);
  });

  it.each(["23505", "23503", "23514", "42601", "28P01", "08P01", "08007", "UNKNOWN", "econnrefused"])(
    "keeps unrelated or unsupported code %s as an unexpected failure",
    (code) => {
      const driverError: Error = Object.assign(new Error("Connection refused; could not connect to server"), { code });
      expect(isPersistenceUnavailable(driverError)).toBe(false);
      expect(isPersistenceUnavailable(new QueryFailedError("INSERT", [], driverError))).toBe(false);
    },
  );

  it.each([
    { label: "null", error: null },
    { label: "undefined", error: undefined },
    { label: "a string", error: "ECONNREFUSED" },
    { label: "a plain coded object", error: { code: "ECONNREFUSED" } },
    { label: "a numeric code", error: Object.assign(new Error("failure"), { code: 8006 }) },
    { label: "a message-only error", error: new Error("could not connect to server: Connection refused") },
    {
      label: "a spoofed wrapper name",
      error: Object.assign(new Error("failure"), {
        name: "QueryFailedError",
        driverError: Object.assign(new Error("driver"), { code: "08006" }),
      }),
    },
  ])("does not guess unavailability from $label", ({ error }) => {
    expect(isPersistenceUnavailable(error)).toBe(false);
  });

  it("follows a coded connection cause without discarding its original wrapper", () => {
    const cause: Error = Object.assign(new Error("connection failure"), { code: "ECONNRESET" });
    const wrapper: Error = new Error("Pool acquisition failed", { cause });
    expect(isPersistenceUnavailable(wrapper)).toBe(true);
    expect(wrapper.cause).toBe(cause);
  });

  it("does not override an explicit unrelated outer code with a connection cause", () => {
    const cause: Error = Object.assign(new Error("connection failure"), { code: "ECONNRESET" });
    const error: Error = Object.assign(new Error("constraint failure", { cause }), { code: "23514" });
    expect(isPersistenceUnavailable(error)).toBe(false);
  });

  it("terminates when an error cause chain cycles", () => {
    const first: Error = new Error("first");
    const second: Error = new Error("second", { cause: first });
    first.cause = second;
    expect(isPersistenceUnavailable(first)).toBe(false);
  });
});
