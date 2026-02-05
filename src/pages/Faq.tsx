import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { useContact } from "@/hooks/useContact";
import apiClient from "@/lib/api";

function getDefaultFaqs(minWithdraw: number) {
  return [
    { q: "How do I deposit funds?", a: "You can deposit using eSewa, Khalti, Bank Transfer, or UPI from the Deposit page." },
    { q: "How long do withdrawals take?", a: "Withdrawals are processed within 24-48 hours after verification." },
    { q: "How do I verify my account?", a: "Go to Profile > KYC Verification and upload your government ID and selfie." },
    { q: "What is the minimum withdrawal?", a: `The minimum withdrawal amount is ₹${minWithdraw}.` },
  ];
}

export default function Faq() {
  const contact = useContact();
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(() => getDefaultFaqs(500));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const content = await apiClient.getPublicContent();
        if (cancelled) return;
        const list = content?.faq;
        if (Array.isArray(list) && list.length > 0) {
          setFaqs(list.map((item: { q?: string; a?: string }) => ({
            q: item.q ?? "",
            a: item.a ?? "",
          })));
        }
      } catch {
        if (!cancelled) setFaqs(getDefaultFaqs(contact.min_withdraw));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [contact.min_withdraw]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="pt-28 pb-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-border pb-4">
                  <h2 className="font-semibold mb-2">{faq.q}</h2>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
