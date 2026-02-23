import { Link } from "react-router-dom";
import { useSecondHomePageData } from "@/hooks/useSecondHomePageData";
import { SecondHomeSlider, SecondGameCategoryBar, LiveBettingSection, SecondHomeSidebar } from "@/components/secondHome";
import { GameProviders } from "@/components/home/GameProviders";
import { GameCardSmall } from "@/components/games/GameCard";
import { ChevronRight } from "lucide-react";

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
      <div className="container px-4 py-6 grid grid-cols-1 md:grid-cols-[70%_1fr] gap-6">
        <div className="min-w-0 space-y-0">
          {data.liveBettingSections.map((section, i) => (
            <LiveBettingSection key={i} section={section} />
          ))}
          {data.topLiveGames.length > 0 && (
            <section className="py-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-foreground">Top Live Games</h2>
                <Link to="/games" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data.topLiveGames.map((game) => (
                  <GameCardSmall key={game.id} {...game} />
                ))}
              </div>
            </section>
          )}
          {data.otherGames.length > 0 && (
            <section className="py-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-foreground">Other Games</h2>
                <Link to="/games" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data.otherGames.map((game) => (
                  <GameCardSmall key={game.id} {...game} />
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="hidden md:block md:min-w-0">
          <SecondHomeSidebar categories={data.categories} />
        </div>
      </div>
      <div className="md:hidden container px-4 pb-6">
        <SecondHomeSidebar categories={data.categories} />
      </div>
      <GameProviders providers={data.providerCards} />
    </div>
  );
}
