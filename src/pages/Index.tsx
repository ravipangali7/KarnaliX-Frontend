import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedGames } from "@/components/home/FeaturedGames";
import { GameCategories } from "@/components/home/GameCategories";
import { PromoBannerGrid, PromoBanner } from "@/components/home/PromoBanner";
import { AllGameCategories } from "@/components/home/GamesList";
import { GameProviders } from "@/components/home/GameProviders";
import { ComingSoon } from "@/components/home/ComingSoon";
import { Testimonials } from "@/components/home/Testimonials";
import apiClient from "@/lib/api";
import { apiGameToCard, apiProviderToCard } from "@/lib/gameUtils";

const Index = () => {
  const [featuredGames, setFeaturedGames] = useState<any[] | null>(null);
  const [providers, setProviders] = useState<any[] | null>(null);
  const [content, setContent] = useState<{
    hero?: any;
    promos?: any[];
    testimonials?: any[];
    recent_wins?: any[];
    coming_soon?: any[];
  } | null>(null);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [gamesRes, providersRes, contentRes] = await Promise.all([
          apiClient.getPublicGames({ featured: "5" }),
          apiClient.getPublicProviders(),
          apiClient.getPublicContent().catch(() => null),
        ]);
        if (cancelled) return;
        const games = gamesRes?.results ?? gamesRes ?? [];
        const provs = providersRes?.results ?? providersRes ?? [];
        setFeaturedGames(Array.isArray(games) ? games.map((g: any) => apiGameToCard(g)) : []);
        setProviders(Array.isArray(provs) ? provs.map((p: any) => apiProviderToCard(p)) : []);
        if (contentRes && typeof contentRes === "object") setContent(contentRes as any);
      } catch {
        if (!cancelled) {
          setFeaturedGames(null);
          setProviders(null);
        }
      } finally {
        if (!cancelled) {
          setGamesLoading(false);
          setProvidersLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <main>
        <HeroSection hero={content?.hero} />
        <FeaturedGames games={featuredGames ?? undefined} loading={gamesLoading} />
        <PromoBannerGrid promos={content?.promos} />
        <GameCategories />
        <AllGameCategories />
        <div className="container mx-auto px-4 py-8">
          <PromoBanner variant="tournament" promo={content?.promos?.find((p: any) => p.variant === "tournament")} />
        </div>
        <GameProviders providers={providers ?? undefined} loading={providersLoading} />
        <ComingSoon comingSoon={content?.coming_soon} />
        <Testimonials testimonials={content?.testimonials} recentWins={content?.recent_wins} />
        <div className="container mx-auto px-4 py-8">
          <PromoBanner variant="cashback" promo={content?.promos?.find((p: any) => p.variant === "cashback")} />
        </div>
      </main>

      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
