/**
 * Must match server core.otp_domain_policy: apex = SMS only; currency subdomains = email + WhatsApp.
 */
export type OtpPolicy = "sms_only" | "email_whatsapp";

const SMS_ONLY_HOSTS = new Set(["luckyuser365.com", "www.luckyuser365.com"]);

const EMAIL_WHATSAPP_HOST = /^(bht|inr|bdt|myr|aed|aud)\.luckyuser365\.com$/i;

/**
 * Policy from the player site hostname (browser). Unknown hosts default to email_whatsapp to match server OTP_DOMAIN_POLICY_DEFAULT.
 * Optional VITE_OTP_DOMAIN_POLICY_DEFAULT=sms_only|email_whatsapp for localhost / dev.
 */
export function getOtpPolicy(hostname?: string): OtpPolicy {
  const raw =
    hostname ??
    (typeof window !== "undefined" ? window.location.hostname : "");
  const h = raw.trim().toLowerCase();

  if (h === "localhost" || h === "127.0.0.1" || !h) {
    const v = import.meta.env.VITE_OTP_DOMAIN_POLICY_DEFAULT as string | undefined;
    if (v === "sms_only" || v === "email_whatsapp") return v;
    return "email_whatsapp";
  }

  if (SMS_ONLY_HOSTS.has(h)) return "sms_only";
  if (EMAIL_WHATSAPP_HOST.test(h)) return "email_whatsapp";

  const v = import.meta.env.VITE_OTP_DOMAIN_POLICY_DEFAULT as string | undefined;
  if (v === "sms_only" || v === "email_whatsapp") return v;
  return "email_whatsapp";
}
