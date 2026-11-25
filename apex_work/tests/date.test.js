import test from "node:test";
import assert from "node:assert/strict";
import { dateKey, addCalendarDays, calendarDate, inputDateKey } from "../src/utils/date.js";

test("daily date key follows the configured Lagos calendar day, not UTC day", () => {
  assert.equal(dateKey(new Date("2026-11-11T23:30:00.000Z"), "Africa/Lagos"), "2026-11-12");
});

test("daily date key handles instants before Lagos midnight correctly", () => {
  assert.equal(dateKey(new Date("2026-11-11T22:30:00.000Z"), "Africa/Lagos"), "2026-11-11");
});

test("calendar day arithmetic crosses month and year boundaries", () => {
  assert.equal(addCalendarDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addCalendarDays("2028-02-28", 1), "2028-02-29");
});

test("calendar dates are stored at UTC noon without changing their date key", () => {
  const value = calendarDate("2026-11-12");
  assert.equal(value.toISOString(), "2026-11-12T12:00:00.000Z");
  assert.equal(inputDateKey("2026-11-12"), "2026-11-12");
});
