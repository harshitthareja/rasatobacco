import { describe, it, expect } from "vitest";

// Basic route registration smoke check - ensures route files exist and export a Route
describe("Route modules load without crashing", () => {
  const routes = [
    "index",
    "login",
    "contact",
    "loyalty",
    "hookah",
    "accessories.index",
    "accessories.$category",
    "partners",
    "coming-soon",
    "age-restricted",
    "house-of-rasa",
    "collections.index",
    "collections.majlis",
    "collections.makhmal",
    "collections.tarkib",
    "account.orders",
    "account.settings",
  ];

  for (const r of routes) {
    it(`route "${r}" module imports`, async () => {
      const mod = await import(`../routes/${r}.tsx`);
      expect(mod.Route).toBeDefined();
    });
  }
});
