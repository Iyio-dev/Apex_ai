export const subjects = ["Mathematics", "Chemistry", "Physics", "Biology", "Agricultural Science", "Geography", "Business Studies", "Economics", "Accounting", "Government", "Christian Religious Studies", "French", "History", "Islamic Studies", "Literature-in-English", "Music", "Visual Arts", "Igbo", "Yoruba"];
export const dateISO = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export const prettyDate = (value) => {
  const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = dateOnly
    ? (() => { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); })()
    : new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
};
export const cls = (...a) => a.filter(Boolean).join(" ");
