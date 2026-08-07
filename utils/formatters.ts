const DAY_LABELS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTH_LABELS = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function formatDateShort(iso: string): string {
  const d = parseIsoDate(iso);
  return `${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()]}`;
}

export function formatDateLong(iso: string): string {
  const d = parseIsoDate(iso);
  return `${DAY_LABELS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatWeekday(iso: string): string {
  const d = parseIsoDate(iso);
  return DAY_LABELS[d.getUTCDay()];
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatOdds(value: number): string {
  return value.toFixed(2);
}

export function formatDecimal(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function formatSigned(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}`;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function isToday(iso: string, todayIso: string): boolean {
  return iso === todayIso;
}

export function relativeDayLabel(iso: string, todayIso: string): string {
  const target = parseIsoDate(iso).getTime();
  const today = parseIsoDate(todayIso).getTime();
  const diffDays = Math.round((target - today) / 86400000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays === -1) return "Ayer";
  if (diffDays > 1 && diffDays <= 6) return `En ${diffDays} días`;
  if (diffDays < -1 && diffDays >= -6) return `Hace ${Math.abs(diffDays)} días`;
  return formatDateShort(iso);
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
