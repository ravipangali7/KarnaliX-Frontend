import { useSecondHomePageData } from "@/hooks/useSecondHomePageData";
import { SecondHomeSlider, SecondGameCategoryBar, LiveBettingSection } from "@/components/secondHome";
import { GameProviders } from "@/components/home/GameProviders";

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
    <div className="space-y-0 pb-8">
      <SecondHomeSlider slides={data.sliderSlides} />
      <SecondGameCategoryBar categories={data.categories} />
      {data.liveBettingSections.map((section, i) => (
        <LiveBettingSection key={i} section={section} />
      ))}
      <GameProviders providers={data.providerCards} />
    </div>
  );
}
