import type { User } from "@/contexts/AuthContext";

/**
 * Return currency symbol for display based on user's country (from API).
 * Falls back to ₹ if user is null or currency_symbol not set.
 */
export function getCurrencySymbol(user: User | null): string {
  return user?.currency_symbol ?? "₹";
}

const symbol = "₹";

/** Format a balance/amount for display. */
export function fmt(value: string | number | null | undefined): string {
  if (value == null || value === "") return `${symbol}0`;
  const n = Number(value);
  return Number.isNaN(n) ? `${symbol}0` : `${symbol}${n.toLocaleString()}`;
}

/** Format P/L or win/loss (signed) for display. */
export function fmtPL(value: string | number | null | undefined): string {
  if (value == null || value === "") return `${symbol}0`;
  const n = Number(value);
  if (Number.isNaN(n)) return `${symbol}0`;
  const formatted = n.toLocaleString();
  if (n > 0) return `+${symbol}${formatted}`;
  if (n < 0) return `-${symbol}${Math.abs(n).toLocaleString()}`;
  return `${symbol}0`;
}
