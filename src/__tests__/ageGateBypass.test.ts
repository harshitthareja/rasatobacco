import { describe, it, expect } from "vitest";

const BYPASS = ["/age-restricted", "/login", "/test-email"];
const shouldBypass = (path: string) => BYPASS.includes(path);

describe("AgeGate bypass paths", () => {
  it("bypasses /login", () => {
    expect(shouldBypass("/login")).toBe(true);
  });
  it("bypasses /age-restricted", () => {
    expect(shouldBypass("/age-restricted")).toBe(true);
  });
  it("bypasses /test-email", () => {
    expect(shouldBypass("/test-email")).toBe(true);
  });
  it("does not bypass /", () => {
    expect(shouldBypass("/")).toBe(false);
  });
  it("does not bypass /collections/majlis", () => {
    expect(shouldBypass("/collections/majlis")).toBe(false);
  });
});

describe("Session storage helpers", () => {
  const AGE_KEY = "rasa_age_verified";
  it("reads and writes verification flag", () => {
    sessionStorage.clear();
    expect(sessionStorage.getItem(AGE_KEY)).toBeNull();
    sessionStorage.setItem(AGE_KEY, "1");
    expect(sessionStorage.getItem(AGE_KEY)).toBe("1");
    sessionStorage.clear();
    expect(sessionStorage.getItem(AGE_KEY)).toBeNull();
  });
});
