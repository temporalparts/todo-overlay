/**
 * Get today's date in YYYY-MM-DD format using local timezone
 * This avoids issues where UTC date differs from local date
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is before today (in local timezone)
 */
export function isBeforeToday(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateStr + 'T00:00:00');
  return checkDate < today;
}