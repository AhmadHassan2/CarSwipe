const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("en-CA");

export function formatPrice(value: number) {
  return cad.format(value).replace("CA$", "$");
}

export function formatKm(value: number) {
  return `${num.format(value)} km`;
}

export function formatNumber(value: number) {
  return num.format(value);
}

export function vehicleTitle(v: { year: number; make: string; model: string }) {
  return `${v.year} ${v.make} ${v.model}`;
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

export function timeAgo(date: Date | string) {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(new Date(date));
}

export function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
