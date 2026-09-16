export function parseLocalDate(val: string): Date {
  const dateStr = val.includes("T") ? val.split("T")[0] : val;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  if (val.includes("/")) {
    const parts = val.split("/");
    if (parts.length === 3) {
      const m = Number(parts[0]) - 1;
      const d = Number(parts[1]);
      const y = Number(parts[2]);
      return new Date(y, m, d);
    }
  }
  return new Date(val);
}

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getCurrentDateISO(): string {
  return formatLocalDate(new Date());
}
