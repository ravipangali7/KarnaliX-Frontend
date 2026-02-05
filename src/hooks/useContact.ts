import { useState, useEffect } from "react";
import apiClient from "@/lib/api";

const DEFAULT_CONTACT = {
  phone: "+91 80008 25980",
  email: "support@karnalix.com",
  whatsapp_number: "918000825980",
  payment_methods: ["eSewa", "Khalti", "Bank Transfer", "UPI", "Cards"] as string[],
  min_deposit: 500,
  min_withdraw: 500,
  referral_amount: "500",
};

let contactCache: typeof DEFAULT_CONTACT | null = null;

export function useContact() {
  const [contact, setContact] = useState<typeof DEFAULT_CONTACT>(contactCache ?? DEFAULT_CONTACT);

  useEffect(() => {
    if (contactCache) {
      setContact(contactCache);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const content = await apiClient.getPublicContent();
        if (cancelled) return;
        const c = content?.contact;
        if (c && typeof c === "object") {
          const minDeposit = typeof c.min_deposit === "number" ? c.min_deposit : (typeof c.min_deposit === "string" ? parseInt(c.min_deposit, 10) : DEFAULT_CONTACT.min_deposit);
          const minWithdraw = typeof c.min_withdraw === "number" ? c.min_withdraw : (typeof c.min_withdraw === "string" ? parseInt(c.min_withdraw, 10) : DEFAULT_CONTACT.min_withdraw);
          const referralAmount = c.referral_amount != null && c.referral_amount !== "" ? String(c.referral_amount) : DEFAULT_CONTACT.referral_amount;
          const next = {
            phone: typeof c.phone === "string" ? c.phone : DEFAULT_CONTACT.phone,
            email: typeof c.email === "string" ? c.email : DEFAULT_CONTACT.email,
            whatsapp_number: typeof c.whatsapp_number === "string" ? c.whatsapp_number : DEFAULT_CONTACT.whatsapp_number,
            payment_methods: Array.isArray(c.payment_methods) ? c.payment_methods : DEFAULT_CONTACT.payment_methods,
            min_deposit: Number.isNaN(minDeposit) ? DEFAULT_CONTACT.min_deposit : minDeposit,
            min_withdraw: Number.isNaN(minWithdraw) ? DEFAULT_CONTACT.min_withdraw : minWithdraw,
            referral_amount: referralAmount.startsWith("₹") ? referralAmount : `₹${referralAmount}`,
          };
          contactCache = next;
          setContact(next);
        }
      } catch {
        if (!cancelled) setContact(DEFAULT_CONTACT);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return contact;
}
