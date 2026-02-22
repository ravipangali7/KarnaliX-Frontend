import { useQuery } from "@tanstack/react-query";
import { getSiteSetting, getSliderSlides, getLiveBettingSections, type LiveBettingSectionApi } from "@/api/site";
import { getCategories, getProviders, getGames, getGameImageUrl, type Game, type GameCategory, type GameProvider } from "@/api/games";
import { getMediaUrl } from "@/lib/api";
import type { ProviderShape, GameCardShape } from "@/data/homePageMockData";

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
  topLiveGames: GameCardShape[];
  otherGames: GameCardShape[];
}

function mapGameToCardShape(game: Game, index: number): GameCardShape {
  const minBet = Number(game.min_bet) || 0;
  const maxBet = Number(game.max_bet) || 0;
  return {
    id: String(game.id),
    name: game.name,
    image: getGameImageUrl(game),
    category: game.category_name ?? "",
    players: 0,
    minBet,
    maxBet,
    rating: 4.5,
    isHot: index < 2,
    isNew: index < 3,
    provider: game.provider_name ?? game.provider_code ?? "",
  };
}

const TOP_LIVE_COUNT = 12;
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

function mapSliderApiToSlide(s: { id: number; title: string; subtitle?: string; image?: string; cta_label: string; cta_link: string }): SliderSlide {
  return {
    id: String(s.id),
    title: s.title ?? "",
    subtitle: s.subtitle,
    image: (s.image as string)?.trim() ? getMediaUrl((s.image as string).trim()) : undefined,
    ctaText: s.cta_label ?? "Join Now",
    ctaHref: s.cta_link ?? "/register",
  };
}

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

function mapLiveBettingApiToSections(sections: LiveBettingSectionApi[]): LiveBettingSection[] {
  return sections.slice(0, 10).map((sec) => ({
    title: sec.title ?? "",
    events: (sec.events ?? []).map((ev) => ({
      id: String(ev.id),
      sport: ev.sport,
      team1: ev.team1 ?? "",
      team2: ev.team2 ?? "",
      date: ev.event_date ?? "",
      time: ev.event_time ?? "",
      odds: Array.isArray(ev.odds) ? ev.odds : [],
      isLive: !!ev.is_live,
    })),
  }));
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
  const { data: sliderSlidesApi = [], isLoading: sliderLoading } = useQuery({
    queryKey: ["sliderSlides"],
    queryFn: getSliderSlides,
  });
  const { data: liveBettingApi = [], isLoading: liveBettingLoading } = useQuery({
    queryKey: ["liveBettingSections"],
    queryFn: getLiveBettingSections,
  });
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });
  const { data: gamesResp, isLoading: gamesLoading, isError: gamesError, refetch: refetchGames } = useQuery({
    queryKey: ["games", "second-home"],
    queryFn: () => getGames(undefined, undefined, 1, 50),
  });
  const games = (gamesResp?.results ?? []) as Game[];
  const categoriesList = (categories ?? []) as GameCategory[];

  const isLoading = siteLoading || sliderLoading || liveBettingLoading || categoriesLoading || providersLoading || gamesLoading;
  const site = (siteSetting as Record<string, unknown>) ?? {};
  const liveBettingSections: LiveBettingSection[] =
    Array.isArray(liveBettingApi) && liveBettingApi.length > 0
      ? mapLiveBettingApiToSections(liveBettingApi)
      : defaultLiveBettingSections(site);
  const sliderSlides: SliderSlide[] =
    Array.isArray(sliderSlidesApi) && sliderSlidesApi.length > 0
      ? sliderSlidesApi.map(mapSliderApiToSlide)
      : defaultSliderSlides(site);
  const providersList = (providers ?? []) as GameProvider[];
  const providerCards: ProviderShape[] = providersList.map((p, i) => ({
    name: p.name,
    logo: (p.code ?? p.name.slice(0, 2).toUpperCase()).slice(0, 2),
    logoImage: p.image?.trim() ? getMediaUrl(p.image.trim()) : undefined,
    games: 0,
    color: PROVIDER_COLORS[i % PROVIDER_COLORS.length],
  }));

  const liveCategory = categoriesList.find((c) => /live/i.test(c.name));
  let topLiveGames: GameCardShape[] = [];
  let otherGames: GameCardShape[] = [];
  if (games.length > 0) {
    if (liveCategory) {
      const liveGames = games.filter((g) => g.category === liveCategory.id);
      const rest = games.filter((g) => g.category !== liveCategory.id);
      topLiveGames = liveGames.slice(0, TOP_LIVE_COUNT).map((g, i) => mapGameToCardShape(g, i));
      otherGames = rest.map((g, i) => mapGameToCardShape(g, i));
    } else {
      topLiveGames = games.slice(0, TOP_LIVE_COUNT).map((g, i) => mapGameToCardShape(g, i));
      otherGames = games.slice(TOP_LIVE_COUNT).map((g, i) => mapGameToCardShape(g, i));
    }
  }

  const data: SecondHomePageData = {
    sliderSlides,
    categories: categoriesList,
    providers: providersList,
    providerCards,
    liveBettingSections,
    topLiveGames,
    otherGames,
  };

  const refetch = () => {
    refetchSite();
    refetchGames();
  };
  return { data, isLoading, isError: !!siteError || !!gamesError, refetch };
}

export { PROVIDER_COLORS };
