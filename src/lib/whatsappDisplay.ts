import type { User } from "@/contexts/AuthContext";

/**
 * Get the WhatsApp number to display and use for links on site and player dashboard:
 * - Not logged in: site setting WhatsApp
 * - Logged in as player: parent master's WhatsApp, else site setting
 * - Other roles: site setting
 */
export function getDisplayWhatsAppNumber(
  siteWhatsapp: string,
  user: User | null
): string {
  const site = (siteWhatsapp || "").trim() || "";
  if (!user) return site;
  if (user.role === "player") {
    const parent = (user.parent_whatsapp_number ?? "").trim();
    return parent || site;
  }
  return site;
}

/**
 * Normalize number to digits; 9–10 digits get 977 prefix for wa.me.
 */
function normalizeForWaMe(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length < 9) return digits;
  return digits.length <= 10 ? "977" + digits : digits;
}

/**
 * Build wa.me URL for the display WhatsApp number (site + user role logic).
 */
export function getDisplayWhatsAppUrl(
  siteWhatsapp: string,
  user: User | null,
  prefillText?: string
): string | null {
  const number = getDisplayWhatsAppNumber(siteWhatsapp, user);
  return buildWaMeUrlFromRawNumber(number, prefillText);
}

function buildWaMeUrlFromRawNumber(raw: string, prefillText?: string): string | null {
  const trimmed = (raw || "").trim();
  if (!trimmed || !trimmed.replace(/\D/g, "")) return null;
  const normalized = normalizeForWaMe(trimmed);
  if (normalized.length < 9) return null;
  const base = `https://wa.me/${normalized}`;
  if (prefillText && prefillText.trim()) {
    return `${base}?text=${encodeURIComponent(prefillText.trim())}`;
  }
  return base;
}

/**
 * Player deposit via WhatsApp: master `whatsapp_deposit`, then parent's general WhatsApp, then site.
 */
export function getMasterDepositWhatsAppUrl(
  siteWhatsapp: string,
  user: User | null,
  prefillText?: string
): string | null {
  if (!user || user.role !== "player") {
    return getDisplayWhatsAppUrl(siteWhatsapp, user, prefillText);
  }
  const site = (siteWhatsapp || "").trim();
  const candidates = [
    (user.parent_whatsapp_deposit ?? "").trim(),
    (user.parent_whatsapp_number ?? "").trim(),
    site,
  ];
  for (const raw of candidates) {
    const url = buildWaMeUrlFromRawNumber(raw, prefillText);
    if (url) return url;
  }
  return null;
}

/**
 * Player withdraw via WhatsApp: master `whatsapp_withdraw`, then parent's general WhatsApp, then site.
 */
export function getMasterWithdrawWhatsAppUrl(
  siteWhatsapp: string,
  user: User | null,
  prefillText?: string
): string | null {
  if (!user || user.role !== "player") {
    return getDisplayWhatsAppUrl(siteWhatsapp, user, prefillText);
  }
  const site = (siteWhatsapp || "").trim();
  const candidates = [
    (user.parent_whatsapp_withdraw ?? "").trim(),
    (user.parent_whatsapp_number ?? "").trim(),
    site,
  ];
  for (const raw of candidates) {
    const url = buildWaMeUrlFromRawNumber(raw, prefillText);
    if (url) return url;
  }
  return null;
}
