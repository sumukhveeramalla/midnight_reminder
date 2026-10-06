import { test, describe } from "node:test";
import assert from "node:assert";
import { getLocalDateString, isInMidnightWindow, shouldRemind } from "./policy.js";

// Tests local date formatting used for tracking daily reminders
describe("getLocalDateString", () => {
  test("formats a basic date correctly", () => {
    const d = new Date("2024-01-15T00:00:00");
    assert.strictEqual(getLocalDateString(d), "2024-01-15");
  });

  test("zero-pads single-digit month and day", () => {
    const d = new Date("2024-03-05T00:00:00");
    assert.strictEqual(getLocalDateString(d), "2024-03-05");
  });

  test("handles December 31 correctly", () => {
    const d = new Date("2024-12-31T00:00:00");
    assert.strictEqual(getLocalDateString(d), "2024-12-31");
  });
});

// Tests the reminder window boundaries from midnight to 6:00 AM
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

  test("03:00 is inside window", () => {
    const d = new Date("2024-01-15T03:00:00");
    assert.strictEqual(isInMidnightWindow(d), true);
  });
});

// Tests when a reminder should be shown or skipped
describe("shouldRemind", () => {
  test("shows reminder at 00:00 if not reminded today", () => {
    const d = new Date("2024-01-15T00:00:00");
    assert.strictEqual(shouldRemind(d, undefined), true);
  });

  test("does not show reminder outside midnight window", () => {
    const d = new Date("2024-01-15T12:00:00");
    assert.strictEqual(shouldRemind(d, undefined), false);
  });

  test("does not show duplicate reminder on same day", () => {
    const d = new Date("2024-01-15T02:00:00");
    assert.strictEqual(shouldRemind(d, "2024-01-15"), false);
  });

  test("does not show duplicate reminder at 00:00 same day", () => {
    const d = new Date("2024-01-15T00:00:00");
    assert.strictEqual(shouldRemind(d, "2024-01-15"), false);
  });

  test("shows reminder if last reminder was yesterday", () => {
    const d = new Date("2024-01-15T02:00:00");
    assert.strictEqual(shouldRemind(d, "2024-01-14"), true);
  });

  test("shows reminder just before window ends if not reminded", () => {
    const d = new Date("2024-01-15T05:59:00");
    assert.strictEqual(shouldRemind(d, undefined), true);
  });

  test("does not show reminder at exactly 06:00 even if not reminded", () => {
    const d = new Date("2024-01-15T06:00:00");
    assert.strictEqual(shouldRemind(d, undefined), false);
  });
});
