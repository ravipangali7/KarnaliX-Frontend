import { useQuery } from "@tanstack/react-query";
import { getSiteSetting } from "@/api/site";
import { getCategories, getProviders, getMediaUrl, type GameCategory, type GameProvider } from "@/api/games";
import type { ProviderShape } from "@/data/homePageMockData";

export interface SliderSlide {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  ctaText: string;
  ctaHref: string;
}

export interface LiveBettingEvent {
  id: string;
  sport?: string;
  team1: string;
  team2: string;
  date: string;
  time: string;
  odds: number[];
  isLive?: boolean;
}

export interface LiveBettingSection {
  title: string;
  events: LiveBettingEvent[];
}

export interface SecondHomePageData {
  sliderSlides: SliderSlide[];
  categories: GameCategory[];
  providers: GameProvider[];
  providerCards: ProviderShape[];
  liveBettingSections: LiveBettingSection[];
}

const PROVIDER_COLORS = [
  "from-orange-500 to-red-500",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-blue-500",
  "from-green-500 to-emerald-600",
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-500",
  "from-yellow-500 to-amber-500",
  "from-teal-500 to-cyan-500",
];

function defaultSliderSlides(site: Record<string, unknown>): SliderSlide[] {
  const heroTitle = (site.hero_title as string)?.trim() || "CRICKET CHAMPIONSHIP - T20 WORLD CUP MADNESS BEGINS - THE COUNTDOWN IS OVER";
  const promoBanners = Array.isArray(site.promo_banners) ? (site.promo_banners as Record<string, unknown>[]) : [];
  if (promoBanners.length > 0) {
    return promoBanners.slice(0, 5).map((p, i) => ({
      id: `slide-${i}`,
      title: (p.title as string) ?? heroTitle,
      subtitle: (p.subtitle as string) ?? "Join now and enjoy live sports betting and casino games.",
      image: (p.image as string)?.trim() ? getMediaUrl((p.image as string).trim()) : undefined,
      ctaText: (p.cta_label as string) ?? (p.cta as string) ?? "Join Now",
      ctaHref: (p.cta_link as string) ?? (p.href as string) ?? "/register",
    }));
  }
  return [
    {
      id: "slide-default",
      title: heroTitle,
      subtitle: "Join now and enjoy live sports betting and casino games.",
      ctaText: "Join Now",
      ctaHref: "/register",
    },
  ];
}

function defaultLiveBettingSections(site: Record<string, unknown>): LiveBettingSection[] {
  const raw = site.live_betting ?? site.home_live_events;
  if (Array.isArray(raw) && raw.length >= 3) {
    return (raw as LiveBettingSection[]).slice(0, 3).map((s, i) => ({
      title: s.title ?? `Live Betting ${i + 1}`,
      events: Array.isArray(s.events) ? s.events : [],
    }));
  }
  return [
    {
      title: "Cricket",
      events: [
        { id: "c1", sport: "Cricket", team1: "Pakistan", team2: "Sri Lanka", date: "19 Mar 2026", time: "23:00", odds: [1.92, 1.92, 2.1], isLive: true },
        { id: "c2", sport: "Cricket", team1: "India", team2: "Australia", date: "20 Mar 2026", time: "14:30", odds: [1.7, 1.9, 1.9] },
      ],
    },
    {
      title: "Football",
      events: [
        { id: "f1", sport: "Soccer", team1: "Team A", team2: "Team B", date: "19 Mar 2026", time: "20:00", odds: [2.0, 3.2, 3.5], isLive: true },
        { id: "f2", sport: "Soccer", team1: "Team C", team2: "Team D", date: "19 Mar 2026", time: "22:00", odds: [1.85, 3.4, 4.0] },
      ],
    },
    {
      title: "Tennis",
      events: [
        { id: "t1", sport: "Tennis", team1: "Player 1", team2: "Player 2", date: "19 Mar 2026", time: "18:00", odds: [1.85, 2.0, 2.1], isLive: true },
        { id: "t2", sport: "Tennis", team1: "Player 3", team2: "Player 4", date: "20 Mar 2026", time: "12:00", odds: [1.9, 1.95, 2.05] },
      ],
    },
  ];
}

export function useSecondHomePageData(): {
  data: SecondHomePageData;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { data: siteSetting = {}, isLoading: siteLoading, isError: siteError, refetch: refetchSite } = useQuery({
    queryKey: ["siteSetting"],
    queryFn: getSiteSetting,
  });
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });

  const isLoading = siteLoading || categoriesLoading || providersLoading;
  const site = (siteSetting as Record<string, unknown>) ?? {};
  const providersList = (providers ?? []) as GameProvider[];
  const providerCards: ProviderShape[] = providersList.map((p, i) => ({
    name: p.name,
    logo: (p.code ?? p.name.slice(0, 2).toUpperCase()).slice(0, 2),
    logoImage: p.image?.trim() ? getMediaUrl(p.image.trim()) : undefined,
    games: 0,
    color: PROVIDER_COLORS[i % PROVIDER_COLORS.length],
  }));

  const data: SecondHomePageData = {
    sliderSlides: defaultSliderSlides(site),
    categories: (categories ?? []) as GameCategory[],
    providers: providersList,
    providerCards,
    liveBettingSections: defaultLiveBettingSections(site),
  };

  const refetch = () => {
    refetchSite();
  };

  return { data, isLoading, isError: !!siteError, refetch };
}

export { PROVIDER_COLORS };
