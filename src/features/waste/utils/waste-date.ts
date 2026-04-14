export function parseWasteDate(dateString: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString.trim());

  if (!match) {
    const fallback = new Date(dateString);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatWasteDate(dateString: string): string {
  const parsedDate = parseWasteDate(dateString);

  if (!parsedDate) {
    return dateString;
  }

  const weekday = new Intl.DateTimeFormat("de-DE", { weekday: "short" })
    .format(parsedDate)
    .replace(".", "");
  const dayMonth = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsedDate);

  return `${weekday}, ${dayMonth}`;
}
