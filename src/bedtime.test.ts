import { test, describe } from "node:test";
import assert from "node:assert";
import { getLocalDateString, isInMidnightWindow, shouldRemind } from "./policy.js";

describe("bedtime simulated-time reminder flow", () => {
  test("full day cycle: outside window, then remind, then skip duplicate, then remind next day", () => {
    // Scenario 1: 23:59 — outside window
    const beforeMidnight = new Date("2024-01-15T23:59:00");
    assert.strictEqual(isInMidnightWindow(beforeMidnight), false);
    assert.strictEqual(shouldRemind(beforeMidnight, undefined), false);

    // Scenario 2: 00:00 — inside window, no prior reminder today
    const midnight = new Date("2024-01-15T00:00:00");
    assert.strictEqual(isInMidnightWindow(midnight), true);
    assert.strictEqual(shouldRemind(midnight, undefined), true);
    const today = getLocalDateString(midnight);

    // Scenario 3: 02:30 same day — inside window but already reminded
    const earlyMorning = new Date("2024-01-15T02:30:00");
    assert.strictEqual(isInMidnightWindow(earlyMorning), true);
    assert.strictEqual(shouldRemind(earlyMorning, today), false);

    // Scenario 4: 05:59 same day — still inside window, already reminded
    const justBeforeSix = new Date("2024-01-15T05:59:00");
    assert.strictEqual(isInMidnightWindow(justBeforeSix), true);
    assert.strictEqual(shouldRemind(justBeforeSix, today), false);

    // Scenario 5: 06:00 same day — outside window
    const sixAm = new Date("2024-01-15T06:00:00");
    assert.strictEqual(isInMidnightWindow(sixAm), false);
    assert.strictEqual(shouldRemind(sixAm, today), false);

    // Scenario 6: 00:00 next day — inside window, last reminder was yesterday
    const nextDayMidnight = new Date("2024-01-16T00:00:00");
    assert.strictEqual(isInMidnightWindow(nextDayMidnight), true);
    assert.strictEqual(shouldRemind(nextDayMidnight, today), true);
  });

  test("never reminds more than once per date string", () => {
    const lastDate = "2024-06-01";

    const times = [
      "2024-06-01T00:00:00",
      "2024-06-01T01:00:00",
      "2024-06-01T03:30:00",
      "2024-06-01T05:59:00",
    ];

    for (const t of times) {
      const d = new Date(t);
      assert.strictEqual(shouldRemind(d, lastDate), false, `should not remind at ${t}`);
    }
  });

  test("reminds again immediately after midnight on a new day", () => {
    const lastDate = "2024-06-01";
    const nextDay = new Date("2024-06-02T00:00:00");

    assert.strictEqual(shouldRemind(nextDay, lastDate), true);
    const nextDate = getLocalDateString(nextDay);
    assert.strictEqual(nextDate, "2024-06-02");
  });

  test("does not remind outside 00:00–05:59 even if never reminded", () => {
    const times = [
      "2024-01-15T06:00:00",
      "2024-01-15T12:00:00",
      "2024-01-15T18:00:00",
      "2024-01-15T23:59:00",
    ];

    for (const t of times) {
      const d = new Date(t);
      assert.strictEqual(isInMidnightWindow(d), false, `${t} should be outside window`);
      assert.strictEqual(shouldRemind(d, undefined), false, `should not remind at ${t}`);
    }
  });
});
