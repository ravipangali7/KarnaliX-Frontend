import { useSecondHomePageData } from "@/hooks/useSecondHomePageData";
import {
  SecondHomeSlider,
  SecondHomeTopGamesCarousel,
  SecondHomeCategoryGames,
  SecondHomePopularGames,
} from "@/components/secondHome";
import { GameProviders } from "@/components/home/GameProviders";
import { ActivePopups } from "@/components/home/ActivePopups";
import { SecondHomeReferBonus } from "@/components/secondHome/SecondHomeReferBonus";
import { SecondHomeBonusSection } from "@/components/secondHome/SecondHomeBonusSection";
import { SecondHomeComingSoon } from "@/components/secondHome/SecondHomeComingSoon";

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

      {/* 2. Top Games (is_top_game) */}
      <SecondHomeTopGamesCarousel games={data.topGames} />

      {/* 4. Trusted Game Providers */}
      <GameProviders providers={data.providerCards} />

      {/* 5–7. Category-wise game cards (Live Casino, Slots, Sports, etc.) */}
      <SecondHomeCategoryGames categories={data.categories} gamesByCategory={data.gamesByCategory} />

      {/* 8. Popular Games (is_popular_game) */}
      <SecondHomePopularGames games={data.popularGames} />

      {/* 9. Refer Bonus */}
      {data.promosGrid.length > 0 && (
        <SecondHomeReferBonus promos={data.promosGrid} />
      )}

      {/* 10. Welcome | Deposit Bonus */}
      <SecondHomeBonusSection
        welcomeDepositPromos={data.welcomeDepositPromos}
        tournamentPromo={data.tournamentPromo}
        cashbackPromo={data.cashbackPromo}
      />

      {/* 11. Coming Soon Games */}
      <SecondHomeComingSoon comingSoon={data.comingSoon} />

      {/* 12. Footer is in SecondPublicLayout */}
    </div>
  );
}
