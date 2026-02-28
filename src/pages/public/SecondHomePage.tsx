import { useSecondHomePageData } from "@/hooks/useSecondHomePageData";
import {
  SecondHomeSlider,
  SecondHomeLiveCategorySubcategories,
  SecondHomeTopGamesCarousel,
  SecondHomeCategoryGames,
  SecondHomePopularGames,
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
      {/* 1. Banner */}
      <SecondHomeSlider slides={data.sliderSlides} />

      {/* 2. Live Casino Category — subcategories with icons, horizontal slider */}
      <SecondHomeLiveCategorySubcategories liveCategory={data.liveCategory} subcategories={data.liveCategorySubcategories} />

      {/* 3. Top Games */}
      <SecondHomeTopGamesCarousel games={data.topGames} />

      {/* 4. Trusted Game Providers */}
      <GameProviders providers={data.providerCards} />

      {/* 5. GameCategory-wise game cards */}
      <SecondHomeCategoryGames categories={data.categories} gamesByCategory={data.gamesByCategory} />

      {/* 6. Popular Games */}
      <SecondHomePopularGames games={data.popularGames} />

      {/* 7. Refer & Earn */}
      {data.promosGrid.length > 0 && (
        <PromoBannerGrid promos={data.promosGrid} />
      )}

      {/* 8. Bonus — Welcome (first column) + Deposit (second column) */}
      {data.welcomeDepositPromos.length > 0 && (
        <section className="container px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.welcomeDepositPromos.map((promo, i) => (
              <PromoBanner key={i} promo={promo} />
            ))}
          </div>
        </section>
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

      {/* 9. Coming Soon Games */}
      <ComingSoon comingSoon={data.comingSoon} />

      {/* 10. Footer is in SecondPublicLayout */}

      {/* Testimonials */}
      <Testimonials testimonials={data.testimonials} />
    </div>
  );
}
