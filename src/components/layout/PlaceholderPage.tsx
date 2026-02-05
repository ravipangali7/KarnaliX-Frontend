import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import apiClient from "@/lib/api";

interface PlaceholderPageProps {
  title: string;
  message?: string;
  contentKey?: string;
}

export function PlaceholderPage({
  title,
  message = "Content will be available here. Please check back later or contact support.",
  contentKey,
}: PlaceholderPageProps) {
  const [body, setBody] = useState<string | null>(contentKey ? null : message);
  const [loading, setLoading] = useState(!!contentKey);

  useEffect(() => {
    if (!contentKey) {
      setBody(message);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const content = await apiClient.getPublicContent();
        if (cancelled) return;
        const data = (content as any)?.[contentKey];
        if (data && typeof data === "object" && typeof data.body === "string" && data.body.trim()) {
          setBody(data.body);
        } else {
          setBody(message);
        }
      } catch {
        if (!cancelled) setBody(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [contentKey, message]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="pt-28 pb-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">{body ?? message}</p>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
