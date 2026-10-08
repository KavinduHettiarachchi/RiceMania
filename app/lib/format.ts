const rupees = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Rs. 1,250 — trailing .00 is dropped so round prices stay clean. */
export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Rs. 0";
  return `Rs. ${rupees.format(value)}`;
}

const dateTime = new Intl.DateTimeFormat("en-LK", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatDate(value: string | Date | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return dateTime.format(date);
}

/** "2 hours ago" — used on the admin order feed. */
export function formatRelative(value: string | Date | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return dateTime.format(date);
}

/** Short display id for orders — customers read "#4F2A9C", not the full ObjectId. */
export function shortId(id: string | undefined): string {
  if (!id) return "—";
  return `#${id.slice(-6).toUpperCase()}`;
}

export function initials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
