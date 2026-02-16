export function escapeHtml(value) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(value).replace(/[&<>"']/g, (m) => map[m]);
}

export function safeColor(value, fallback = "#2b7a46") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  if (/^rgb(a?)\([\d\s.,%]+\)$/.test(trimmed)) return trimmed;
  return fallback;
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(isoString, days) {
  const d = new Date(isoString);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

export function getLastDaysSeries(dayMap = {}, length = 7) {
  const out = [];
  for (let i = length - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    out.push({ key, value: Number(dayMap[key] || 0) });
  }
  return out;
}
