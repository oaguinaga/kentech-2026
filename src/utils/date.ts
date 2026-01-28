/**
 * Date utilities
 *
 * Important: `new Date('YYYY-MM-DD')` is parsed as **UTC** per the JS Date spec.
 * When your UI represents dates as calendar days (local time), that can create
 * off-by-one / "today is in the future" bugs depending on the user's timezone.
 *
 * This helper parses `YYYY-MM-DD` as a **local calendar date** at local midnight.
 */
export function parseLocalIsoDate(value: string): Date | null {
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  // Interpret the date as a *local* calendar day (avoids UTC parsing issues).
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  // Guard against invalid dates like 2024-02-31.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}


