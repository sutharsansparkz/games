export function formatHours(hours) {
  if (hours === null || hours === undefined || Number.isNaN(hours) || hours <= 0) return null;
  if (hours < 1) return `${Math.max(1, Math.floor(hours * 60))}m played`;
  if (hours < 25) return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h played`;
  const days = Math.floor(hours / 24);
  const rem = Math.round((hours % 24) * 10) / 10;
  return rem ? `${days}d ${rem}h played` : `${days}d played`;
}
