export const uniq = (arr) => [...new Set(arr)];

export function parseIsoFromParts(dateStr, timeStr, tzStr) {
  const iso = `${dateStr}T${timeStr}:00.000${tzStr}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function isValidParts(dateStr, timeStr, tzStr) {
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  const timeOk = /^\d{2}:\d{2}$/.test(timeStr);
  const tzOk = /^[+-]\d{2}:\d{2}$/.test(tzStr);
  return dateOk && timeOk && tzOk;
}
