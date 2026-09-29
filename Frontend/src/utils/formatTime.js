/**
 * Formats an ISO date string into a 12-hour clock time (e.g. "10:42 AM")
 * @param {string|Date} isoString
 * @returns {string}
 */
export const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Returns a short relative label such as "Today", "Yesterday", or "Sep 28"
 * Used for date separator chips between message groups.
 * @param {string|Date} isoString
 * @returns {string}
 */
export const formatDateLabel = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, now)) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Returns true if two ISO date strings fall on different calendar days.
 * Used to decide when to render a date separator between messages.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export const isDifferentDay = (a, b) => {
  if (!a || !b) return true;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() !== db.getFullYear() ||
    da.getMonth() !== db.getMonth() ||
    da.getDate() !== db.getDate()
  );
};
