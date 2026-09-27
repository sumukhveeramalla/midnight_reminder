import { test, describe } from "node:test";
import assert from "node:assert";
import { isInMidnightWindow, shouldRemind } from "./policy.js";

describe("isInMidnightWindow", () => {
  test("23:59 is outside window", () => {
    const d = new Date("2024-01-15T23:59:00");
    assert.strictEqual(isInMidnightWindow(d), false);
  });

  test("00:00 is inside window", () => {
    const d = new Date("2024-01-15T00:00:00");
    assert.strictEqual(isInMidnightWindow(d), true);
  });

  test("05:59 is inside window", () => {
    const d = new Date("2024-01-15T05:59:00");
    assert.strictEqual(isInMidnightWindow(d), true);
  });

  test("06:00 is outside window", () => {
    const d = new Date("2024-01-15T06:00:00");
    assert.strictEqual(isInMidnightWindow(d), false);
  });
});

describe("shouldRemind", () => {
  test("shows reminder at 00:00 if not reminded today", () => {
    const d = new Date("2024-01-15T00:00:00");
    assert.strictEqual(shouldRemind(d, undefined), true);
  });

  test("does not show duplicate reminder on same day", () => {
    const d = new Date("2024-01-15T02:00:00");
    assert.strictEqual(shouldRemind(d, "2024-01-15"), false);
  });

  test("shows reminder if last reminder was yesterday", () => {
    const d = new Date("2024-01-15T02:00:00");
    assert.strictEqual(shouldRemind(d, "2024-01-14"), true);
  });
});
