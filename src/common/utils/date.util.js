const AppError = require("../errors/app.error");

/**
 * Standardizes parsing of incoming date strings into JS Date objects.
 * Safely strips trailing 'Z' if attached to a local wall-clock time
 * to prevent unwanted +05:30 timezone offset shifts in PostgreSQL.
 * 
 * @param {string|Date} dateInput 
 * @returns {Date}
 */
const parseDate = (dateInput) => {
  if (!dateInput) {
    throw new AppError("Date and time is required", 400);
  }

  let dateString =  typeof dateInput === "string" ? dateInput.trim() : dateInput;

  // If input string ends with 'Z' (e.g. "2026-08-19T23:45:00.000Z"),
  // strip 'Z' so it is parsed as the intended local wall-clock time
  // without shifting by +05:30 when stored/retrieved.
  if (typeof dateString === "string" && dateString.endsWith("Z")) {
    dateString = dateString.slice(0, -1);
  }

  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    throw new AppError("Invalid date and time format", 400);
  }

  return parsed;
};

/**
 * Formats a Date object or string into ISO string.
 * @param {Date|string} date 
 * @returns {string}
 */
const toISOString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString();
};

module.exports = {
  parseDate,
  toISOString,
};
