/** Player sites that must not offer or use SMS for OTP; WhatsApp (+ email where applicable) only. */
const NO_SMS_HOSTNAMES = new Set([
  "bht.luckyuser365.com",
  "inr.luckyuser365.com",
  "bdt.luckyuser365.com",
  "myr.luckyuser365.com",
  "aed.luckyuser365.com",
  "aud.luckyuser365.com",
  "lucky365bht.com",
  "lucky365ind.com",
  "lucky365bhd.com",
]);

export function isCurrencySiteNoSms(): boolean {
  if (typeof window === "undefined") return false;
  return NO_SMS_HOSTNAMES.has(window.location.hostname.toLowerCase());
}
