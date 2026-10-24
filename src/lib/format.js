export function formatHours(hours) {
  if (hours === null || hours === undefined || Number.isNaN(hours) || hours <= 0) return null;

  // Always report total hours — never days or minutes.
  const total = Math.round(hours * 10) / 10;
  if (total < 0.1) return '<0.1h played';

  return `${Number.isInteger(total) ? total : total.toFixed(1)}h played`;
}

export function formatPlayedDate(timestamp) {
  if (!timestamp) return null;
  const date = new Date(Number(timestamp) * 1000);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}
