import { useSecondHomePageData } from "@/hooks/useSecondHomePageData";
import {
  SecondHomeSlider,
  SecondGameCategoryBar,
  LiveBettingSection,
  SecondHomeTopGamesCarousel,
  SecondHomeCategoryGames,
} from "@/components/secondHome";
import { GameProviders } from "@/components/home/GameProviders";
import { ActivePopups } from "@/components/home/ActivePopups";
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
      <ActivePopups />
      <SecondHomeSlider slides={data.sliderSlides} />

      {/* Welcome + Deposit: after banner, before top games */}
      {data.welcomeDepositPromos.length > 0 && (
        <section className="container px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.welcomeDepositPromos.map((promo, i) => (
              <PromoBanner key={i} promo={promo} />
            ))}
          </div>
        </section>
      )}

      <SecondGameCategoryBar categories={data.categories} />

      {/* Scrolling static section (e.g. Ind vs Pak) */}
      {/* <div className="container px-4 py-6">
        {data.liveBettingSections.map((section, i) => (
          <LiveBettingSection key={i} section={section} />
        ))}
      </div> */}

      {/* Top Games: 16 cards, 8 visible, horizontal auto-scroll, image only, click -> game */}
      <SecondHomeTopGamesCarousel games={data.topGames} />

      {/* Sports iframe: full width, viewport crop to hide remote header/footer */}
      {/* {data.sportsIframeUrl && (
        <section className="w-full">
          <div className="w-full overflow-hidden h-[70vh] min-h-[400px] relative bg-background">
            <iframe
              src={data.sportsIframeUrl}
              title="Sports"
              className="absolute left-0 border-0 w-full"
              style={{
                height: "calc(100% + 144px)",
                top: 0,
                transform: "translateY(-64px)",
              }}
              allowFullScreen
            />
          </div>
        </section>
      )} */}

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
