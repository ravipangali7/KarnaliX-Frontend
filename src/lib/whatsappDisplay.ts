import type { User } from "@/contexts/AuthContext";

/**
 * Merge master WhatsApp fields from GET /player/wallet/ (fresh DB) over auth /me/ user.
 * Fixes stale localStorage user missing `parent_whatsapp_deposit` / `parent_whatsapp_withdraw`.
 */
export function userWithWalletMasterWhatsApp(
  user: User | null,
  wallet: Record<string, unknown> | null | undefined
): User | null {
  if (!user || user.role !== "player") return user;
  const w = wallet ?? {};
  /** Support snake_case (DRF) and camelCase if a proxy transforms JSON. */
  const fromWallet = (snake: string, camel: string): string | null | undefined => {
    const v = w[snake] ?? w[camel];
    if (v == null) return undefined;
    const s = String(v).trim();
    return s ? s : undefined;
  };
  return {
    ...user,
    parent_whatsapp_number:
      fromWallet("master_whatsapp_number", "masterWhatsappNumber") ?? user.parent_whatsapp_number ?? null,
    parent_whatsapp_deposit:
      fromWallet("master_whatsapp_deposit", "masterWhatsappDeposit") ?? user.parent_whatsapp_deposit ?? null,
    parent_whatsapp_withdraw:
      fromWallet("master_whatsapp_withdraw", "masterWhatsappWithdraw") ?? user.parent_whatsapp_withdraw ?? null,
  };
}

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
 * Normalize to wa.me-style international digits.
 * 11–15 digits: treat as already including country code.
 * 9–10 digits: prepend 977 (Nepal-style local) for legacy behavior.
 */
function normalizeForWaMe(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length < 9) return digits;
  if (digits.length >= 11 && digits.length <= 15) return digits;
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
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!trimmed || !digitsOnly) return null;
  let normalized = normalizeForWaMe(trimmed);
  // If 977-prefix path failed validation but we have plausible intl digits, use as-is
  if (normalized.length < 9 && digitsOnly.length >= 9 && digitsOnly.length <= 15) {
    normalized = digitsOnly;
  }
  if (normalized.length < 8) return null;
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
