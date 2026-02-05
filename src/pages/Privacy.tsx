import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import apiClient from "@/lib/api";

const DEFAULT_BODY = "Privacy Policy content will be available here. We are committed to protecting your data. Contact us for any privacy-related questions.";

export default function Privacy() {
  const [body, setBody] = useState(DEFAULT_BODY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const content = await apiClient.getPublicContent();
        if (cancelled) return;
        const privacy = content?.privacy;
        if (privacy && typeof privacy === "object" && typeof privacy.body === "string" && privacy.body.trim()) {
          setBody(privacy.body);
        }
      } catch {
        if (!cancelled) setBody(DEFAULT_BODY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="pt-28 pb-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">{body}</p>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
