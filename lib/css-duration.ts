export function readCssDuration(name: string, fallbackMs: number): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = value.match(/^(-?(?:\d+\.?\d*|\.\d+))(ms|s)$/);
  if (!match) return fallbackMs;
  const duration = Number(match[1]) * (match[2] === "s" ? 1000 : 1);
  return duration >= 0 ? duration : fallbackMs;
}
