// Formatting helpers (used on both server and client).

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 150000 -> "₹1,50,000", 0 -> "Free" */
export function formatPrice(rupees: number): string {
  return rupees === 0 ? "Free" : priceFormatter.format(rupees);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

/** "2026-10-18T13:00:00.000Z" -> "Sat, 18 Oct, 6:30 PM" (event times are shown in IST). */
export function formatEventDate(iso: string): string {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(new Date(iso)).map((p) => [p.type, p.value])
  );
  return `${parts.weekday}, ${parts.day} ${parts.month}, ${parts.hour}:${parts.minute} ${String(
    parts.dayPeriod
  ).toUpperCase()}`;
}

/** datetime-local value ("2026-10-18T18:30") entered as IST -> ISO string with offset. */
export function istLocalToIsoWithOffset(value: string): string {
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return `${withSeconds}+05:30`;
}
