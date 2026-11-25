const DEFAULT_TIME_ZONE = "Africa/Lagos";

export const getAppTimeZone = () =>
  process.env.APP_TIME_ZONE || DEFAULT_TIME_ZONE;

/** Return YYYY-MM-DD for an instant in the configured application timezone. */
export function dateKey(date = new Date(), timeZone = getAppTimeZone()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) throw new TypeError("Invalid date supplied");

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const fields = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}

/** Add calendar days to a YYYY-MM-DD value without local/UTC rollover. */
export function addCalendarDays(day, amount) {
  const [year, month, date] = day.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, date + amount, 12));
  return value.toISOString().slice(0, 10);
}

/** Store calendar dates at UTC noon so they remain stable across common timezones. */
export function calendarDate(day) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date, 12));
}

export function inputDateKey(value, timeZone = getAppTimeZone()) {
  // A date-only input is already a calendar date; do not reinterpret it as UTC.
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return dateKey(value, timeZone);
}
