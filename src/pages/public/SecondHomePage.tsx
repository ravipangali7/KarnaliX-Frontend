import { useSecondHomePageData } from "@/hooks/useSecondHomePageData";
import {
  SecondHomeSlider,
  SecondGameCategoryBar,
  LiveBettingSection,
  SecondHomeTopGamesCarousel,
  SecondHomeCategoryGames,
} from "@/components/secondHome";
import { GameProviders } from "@/components/home/GameProviders";
import { PromoBannerGrid, PromoBanner } from "@/components/home/PromoBanner";
import { ComingSoon } from "@/components/home/ComingSoon";
import { Testimonials } from "@/components/home/Testimonials";
export default function SecondHomePage() {
  const { data, isLoading, isError, refetch } = useSecondHomePageData();

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">Something went wrong loading the page.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-8 bg-background">
      <SecondHomeSlider slides={data.sliderSlides} />
      <SecondGameCategoryBar categories={data.categories} />

      {/* Scrolling static section (e.g. Ind vs Pak) */}
      <div className="container px-4 py-6">
        {data.liveBettingSections.map((section, i) => (
          <LiveBettingSection key={i} section={section} />
        ))}
      </div>

      {/* Top Games: 16 cards, 8 visible, horizontal auto-scroll, image only, click -> game */}
      <SecondHomeTopGamesCarousel games={data.topGames} />

      {/* Sports iframe (configurable via site settings sports_iframe_url) */}
      {data.sportsIframeUrl && (
        <section className="container px-4 py-6">
          <h2 className="font-display font-bold text-xl text-foreground mb-4">Live Sports</h2>
          <div className="rounded-xl overflow-hidden border border-white/10 aspect-video max-h-[400px]">
            <iframe
              src={data.sportsIframeUrl}
              title="Sports"
              className="w-full h-full min-h-[300px] border-0"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Providers: image + name only, circular irregular shape */}
      <GameProviders providers={data.providerCards} />

      {/* Games by category: category name + horizontal scroll */}
      <SecondHomeCategoryGames categories={data.categories} gamesByCategory={data.gamesByCategory} />

      {/* Promotion and bonus (like first home) */}
      {data.promosGrid.length > 0 && (
        <PromoBannerGrid promos={data.promosGrid} />
      )}
      {data.tournamentPromo && (
        <section className="container px-4 py-6">
          <PromoBanner promo={data.tournamentPromo} fullWidth />
        </section>
      )}
      {data.cashbackPromo && (
        <section className="container px-4 py-6">
          <PromoBanner promo={data.cashbackPromo} fullWidth />
        </section>
      )}

      {/* Coming Soon */}
      <ComingSoon comingSoon={data.comingSoon} />

      {/* Review / Testimonials */}
      <Testimonials testimonials={data.testimonials} />
    </div>
  );
}
