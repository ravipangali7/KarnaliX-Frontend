import { useQuery } from "@tanstack/react-query";
import { getSiteSetting, getSliderSlides, getLiveBettingSections, getTestimonials, getPublicPaymentMethods, type LiveBettingSectionApi, type PublicPaymentMethod } from "@/api/site";
import { getCategories, getProviders, getGames, getGameImageUrl, getComingSoonGames, type Game, type GameCategory, type GameProvider } from "@/api/games";
import { getBonusRules, mapBonusRulesToPromoShapes } from "@/api/bonus";
import { getMediaUrl } from "@/lib/api";
import type { ProviderShape, GameCardShape, PromoShape, TestimonialShape, ComingSoonShape } from "@/data/homePageMockData";
import { comingSoon as defaultComingSoon, testimonials as defaultTestimonials } from "@/data/homePageMockData";

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

export interface SectionMeta {
  title?: string;
  svg?: string;
}

export interface SecondHomePageData {
  sliderSlides: SliderSlide[];
  categories: GameCategory[];
  providers: GameProvider[];
  providerCards: ProviderShape[];
  liveBettingSections: LiveBettingSection[];
  topLiveGames: GameCardShape[];
  otherGames: GameCardShape[];
  /** First 16 games for Top Games carousel (is_top_game preferred, else live+other fallback). */
  topGames: GameCardShape[];
  /** Games marked is_popular_game for Popular Games section. */
  popularGames: GameCardShape[];
  /** Games grouped by category id for category-wise rows. */
  gamesByCategory: Record<number, GameCardShape[]>;
  sportsIframeUrl: string;
  /** Welcome + Deposit promos (Bonus section). */
  welcomeDepositPromos: PromoShape[];
  /** Refer & Earn promos. */
  promosGrid: PromoShape[];
  tournamentPromo: PromoShape | null;
  cashbackPromo: PromoShape | null;
  comingSoon: ComingSoonShape[];
  testimonials: TestimonialShape[];
  /** Payment methods accepted (from site_payments_accepted_json, resolved). */
  paymentMethods: PublicPaymentMethod[];
  /** Section meta (title, svg) for each configurable section. */
  sectionMeta: {
    banner: SectionMeta;
    topGames: SectionMeta;
    providers: SectionMeta;
    categoriesGame: SectionMeta;
    popularGames: SectionMeta;
    comingSoon: SectionMeta;
    referBonus: SectionMeta;
    paymentsAccepted: SectionMeta;
    welcomeDeposit: SectionMeta;
  };
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
    queryFn: () => getGames(undefined, undefined, 1, 100),
  });
  /** Fetch popular games separately so we get all is_popular_game=true games (not limited to first 100). */
  const { data: popularGamesResp, refetch: refetchPopularGames } = useQuery({
    queryKey: ["games", "second-home", "popular"],
    queryFn: () => getGames(undefined, undefined, 1, 50, undefined, { is_popular_game: true }),
  });
  /** Fetch top games separately so we get all is_top_game=true games (not limited to first 100). */
  const { data: topGamesResp, refetch: refetchTopGames } = useQuery({
    queryKey: ["games", "second-home", "top"],
    queryFn: () => getGames(undefined, undefined, 1, 24, undefined, { is_top_game: true }),
  });
  const { data: testimonialsApi = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: getTestimonials,
  });
  const { data: comingSoonApi } = useQuery({
    queryKey: ["comingSoonGames"],
    queryFn: getComingSoonGames,
  });
  const { data: bonusRules = [] } = useQuery({
    queryKey: ["bonusRules"],
    queryFn: getBonusRules,
  });
  const { data: publicPaymentMethodsApi = [] } = useQuery({
    queryKey: ["publicPaymentMethods"],
    queryFn: getPublicPaymentMethods,
  });
  const games: Game[] = Array.isArray(gamesResp?.results) ? (gamesResp.results as Game[]) : [];
  const categoriesList = Array.isArray(categories) ? (categories as GameCategory[]) : [];

  const isLoading = siteLoading || sliderLoading || liveBettingLoading || categoriesLoading || providersLoading || gamesLoading;
  const site = (siteSetting as Record<string, unknown>) ?? {};

  // Parse site JSON section configs
  const parseSiteSection = (key: string): Record<string, unknown> => {
    const val = site[key];
    return (val && typeof val === "object" && !Array.isArray(val)) ? (val as Record<string, unknown>) : {};
  };
  const siteCategoriesJson = parseSiteSection("site_categories_json");
  const siteTopGamesJson = parseSiteSection("site_top_games_json");
  const siteProvidersJson = parseSiteSection("site_providers_json");
  const siteCategoriesGameJson = parseSiteSection("site_categories_game_json");
  const sitePopularGamesJson = parseSiteSection("site_popular_games_json");
  const siteComingSoonJson = parseSiteSection("site_coming_soon_json");
  const siteReferBonusJson = parseSiteSection("site_refer_bonus_json");
  const sitePaymentsAcceptedJson = parseSiteSection("site_payments_accepted_json");
  const siteWelcomeDepositJson = parseSiteSection("site_welcome_deposit_json");

  const getSectionMeta = (json: Record<string, unknown>): SectionMeta => ({
    title: (json.section_title as string) || undefined,
    svg: (json.section_svg as string) || undefined,
  });

  const liveBettingSections: LiveBettingSection[] =
    Array.isArray(liveBettingApi) && liveBettingApi.length > 0
      ? mapLiveBettingApiToSections(liveBettingApi)
      : defaultLiveBettingSections(site);
  const sliderSlides: SliderSlide[] =
    Array.isArray(sliderSlidesApi) && sliderSlidesApi.length > 0
      ? sliderSlidesApi.map(mapSliderApiToSlide)
      : defaultSliderSlides(site);

  const providersList = (providers ?? []) as GameProvider[];

  // If site_providers_json.provider_ids is set, order providers by that list
  const providerIdOrder = Array.isArray(siteProvidersJson.provider_ids) ? (siteProvidersJson.provider_ids as number[]) : [];
  const orderedProvidersList: GameProvider[] =
    providerIdOrder.length > 0
      ? [
          ...providerIdOrder.map((id) => providersList.find((p) => p.id === id)).filter(Boolean) as GameProvider[],
          ...providersList.filter((p) => !providerIdOrder.includes(p.id!)),
        ]
      : providersList;

  const providerCards: ProviderShape[] = orderedProvidersList.map((p, i) => ({
    id: p.id,
    name: p.name,
    logo: (p.code ?? p.name.slice(0, 2).toUpperCase()).slice(0, 2),
    logoImage: p.image?.trim() ? getMediaUrl(p.image.trim()) : undefined,
    games: 0,
    color: PROVIDER_COLORS[i % PROVIDER_COLORS.length],
    single_game_id: p.single_game_id ?? undefined,
  }));

  let topLiveGames: GameCardShape[] = [];
  let otherGames: GameCardShape[] = [];
  const gamesByCategory: Record<number, GameCardShape[]> = {};
  if (games.length > 0) {
    topLiveGames = games.slice(0, TOP_LIVE_COUNT).map((g, i) => mapGameToCardShape(g, i));
    otherGames = games.slice(TOP_LIVE_COUNT).map((g, i) => mapGameToCardShape(g, i));

    // If site_categories_game_json.categories is set, use that ordering
    const siteCatEntries = Array.isArray(siteCategoriesGameJson.categories)
      ? (siteCategoriesGameJson.categories as { category_id: number; game_ids: number[] }[])
      : [];
    if (siteCatEntries.length > 0) {
      siteCatEntries.forEach(({ category_id, game_ids }) => {
        const orderedGames = game_ids
          .map((gid) => games.find((g) => g.id === gid))
          .filter(Boolean) as Game[];
        const fallbackCatGames = games.filter((g) => g.category === category_id);
        const catGames = orderedGames.length > 0 ? orderedGames : fallbackCatGames;
        if (catGames.length > 0) gamesByCategory[category_id] = catGames.map((g, i) => mapGameToCardShape(g, i));
      });
    } else {
      categoriesList.forEach((cat) => {
        const catGames = games.filter((g) => g.category === cat.id).map((g, i) => mapGameToCardShape(g, i));
        if (catGames.length > 0) gamesByCategory[cat.id] = catGames;
      });
    }
  }

  // Top games: if site_top_games_json.game_ids set, use those in order
  const siteTopGameIds = Array.isArray(siteTopGamesJson.game_ids) ? (siteTopGamesJson.game_ids as number[]) : [];
  const topGamesFromSiteJson: GameCardShape[] = siteTopGameIds.length > 0
    ? siteTopGameIds.map((id) => games.find((g) => g.id === id)).filter(Boolean).map((g, i) => mapGameToCardShape(g as Game, i))
    : [];
  /** Top games: prefer site JSON, then dedicated API (all is_top_game), else from main list, else live+other fallback. */
  const topGamesFromApi = Array.isArray(topGamesResp?.results)
    ? (topGamesResp.results as Game[]).map((g, i) => mapGameToCardShape(g, i)).slice(0, 16)
    : [];
  const topGamesFromFlags = games.filter((g) => g.is_top_game).map((g, i) => mapGameToCardShape(g, i)).slice(0, 16);
  const topGames =
    topGamesFromSiteJson.length > 0 ? topGamesFromSiteJson.slice(0, 16) :
    topGamesFromApi.length > 0 ? topGamesFromApi : topGamesFromFlags.length > 0 ? topGamesFromFlags : [...topLiveGames, ...otherGames].slice(0, 16);

  // Popular games: if site_popular_games_json.game_ids set, use those
  const sitePopularGameIds = Array.isArray(sitePopularGamesJson.game_ids) ? (sitePopularGamesJson.game_ids as number[]) : [];
  const popularFromSiteJson: GameCardShape[] = sitePopularGameIds.length > 0
    ? sitePopularGameIds.map((id) => games.find((g) => g.id === id)).filter(Boolean).map((g, i) => mapGameToCardShape(g as Game, i))
    : [];
  /** Popular games: prefer site JSON, then dedicated API (all is_popular_game), else filter from main list. */
  const popularFromApi = Array.isArray(popularGamesResp?.results)
    ? (popularGamesResp.results as Game[]).map((g, i) => mapGameToCardShape(g, i))
    : [];
  const popularGames: GameCardShape[] =
    popularFromSiteJson.length > 0 ? popularFromSiteJson :
    popularFromApi.length > 0 ? popularFromApi : games.filter((g) => g.is_popular_game).map((g, i) => mapGameToCardShape(g, i));

  // Payment methods: filter by payment_method_ids from site_payments_accepted_json if set
  const acceptedIds = Array.isArray(sitePaymentsAcceptedJson.payment_method_ids) ? (sitePaymentsAcceptedJson.payment_method_ids as number[]) : [];
  const allPublicPaymentMethods = (publicPaymentMethodsApi as PublicPaymentMethod[]);
  const paymentMethods: PublicPaymentMethod[] = acceptedIds.length > 0
    ? acceptedIds.map((id) => allPublicPaymentMethods.find((m) => m.id === id)).filter(Boolean) as PublicPaymentMethod[]
    : allPublicPaymentMethods;

  // categories for categoriesGameJson – respect site ordering
  const siteCatIdOrder = Array.isArray(siteCategoriesGameJson.categories)
    ? (siteCategoriesGameJson.categories as { category_id: number }[]).map((e) => e.category_id)
    : [];
  const orderedCategoriesList: GameCategory[] = siteCatIdOrder.length > 0
    ? [
        ...siteCatIdOrder.map((id) => categoriesList.find((c) => c.id === id)).filter(Boolean) as GameCategory[],
        ...categoriesList.filter((c) => !siteCatIdOrder.includes(c.id!)),
      ]
    : categoriesList;

  const sportsIframeUrl = (site.sports_iframe_url as string)?.trim() || "https://sprodm.uni247.xyz/?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNWRmOTZiZjUtNGU2ZC00MWIyLWFmOGMtMTU5MTRmZjgyZjBjIiwicGxheWVyX2lkIjoiaGI1ZjQ5MTI2U1RBUiIsIm1lcmNoYW50X2NvZGUiOiJjbXQtaGQtc3ViLTg4MHIyYmYiLCJpc3N1ZWRfYXQiOiIyMDI2LTAyLTIzVDEwOjM5OjQyLjAyNjgyMDA2MloiLCJleHBpcmVzX2F0IjoiMjAyNi0wMi0yM1QxMzozOTo0Mi4wMjY4MjAxMjJaIiwibGFuZ3VhZ2UiOiJlbiJ9.5W0ZztMElPLnVqvFwaqh3ehaIhQYVieBe2FwnDMNNDw#/";

  const bonusPromos = bonusRules.length > 0 ? mapBonusRulesToPromoShapes(bonusRules) : [];
  const welcomeDepositPromos: PromoShape[] = bonusPromos.filter(
    (p) => p.variant === "welcome" || p.variant === "deposit"
  );
  const referOnlyPromos: PromoShape[] = bonusPromos.filter((p) => p.variant === "referral");
  const promoBannersRaw = Array.isArray(site.promo_banners) ? (site.promo_banners as Record<string, unknown>[]) : [];
  const promosGrid: PromoShape[] =
    bonusPromos.length > 0
      ? referOnlyPromos
      : promoBannersRaw.length >= 2
        ? promoBannersRaw.slice(0, 2).map((p, i) => ({
            variant: (["welcome", "deposit", "referral", "tournament", "cashback"] as const)[i % 5],
            badge: (p.badge as string) ?? "",
            title: (p.title as string) ?? "",
            highlight: (p.highlight as string) ?? "",
            subtitle: (p.subtitle as string) ?? "",
            description: (p.description as string) ?? "",
            cta: (p.cta_label as string) ?? (p.cta as string) ?? "Learn More",
            href: (p.cta_link as string) ?? (p.href as string) ?? "/promotions",
          }))
        : [];
  const tournamentPromo: PromoShape | null = promoBannersRaw.length >= 3
    ? {
        variant: "tournament",
        badge: (promoBannersRaw[2].badge as string) ?? "",
        title: (promoBannersRaw[2].title as string) ?? "",
        highlight: (promoBannersRaw[2].highlight as string) ?? "",
        subtitle: (promoBannersRaw[2].subtitle as string) ?? "",
        description: (promoBannersRaw[2].description as string) ?? "",
        cta: (promoBannersRaw[2].cta_label as string) ?? "Join Now",
        href: (promoBannersRaw[2].cta_link as string) ?? "/tournaments",
      }
    : null;
  const cashbackPromo: PromoShape | null = promoBannersRaw.length >= 4
    ? {
        variant: "cashback",
        badge: (promoBannersRaw[3].badge as string) ?? "",
        title: (promoBannersRaw[3].title as string) ?? "",
        highlight: (promoBannersRaw[3].highlight as string) ?? "",
        subtitle: (promoBannersRaw[3].subtitle as string) ?? "",
        description: (promoBannersRaw[3].description as string) ?? "",
        cta: (promoBannersRaw[3].cta_label as string) ?? "Learn More",
        href: (promoBannersRaw[3].cta_link as string) ?? "/promotions",
      }
    : null;

  const testimonialsMapped: TestimonialShape[] = Array.isArray(testimonialsApi) && testimonialsApi.length > 0
    ? (testimonialsApi as { id?: number; name?: string; testimonial_from?: string; message?: string; stars?: number; game_name?: string; image?: string }[]).map((t, i) => ({
        id: t.id ?? i,
        name: t.name ?? "Player",
        avatar: t.image ? getMediaUrl(t.image) : undefined,
        location: t.testimonial_from,
        game: t.game_name,
        message: t.message ?? "",
        rating: t.stars ?? 5,
      }))
    : defaultTestimonials;

  const data: SecondHomePageData = {
    sliderSlides,
    categories: orderedCategoriesList,
    providers: orderedProvidersList,
    providerCards,
    liveBettingSections,
    topLiveGames,
    otherGames,
    topGames,
    popularGames,
    gamesByCategory,
    sportsIframeUrl,
    welcomeDepositPromos,
    promosGrid,
    tournamentPromo,
    cashbackPromo,
    comingSoon: Array.isArray(comingSoonApi) && comingSoonApi.length > 0 ? comingSoonApi : defaultComingSoon,
    testimonials: testimonialsMapped,
    paymentMethods,
    sectionMeta: {
      banner: getSectionMeta(siteCategoriesJson),
      topGames: getSectionMeta(siteTopGamesJson),
      providers: getSectionMeta(siteProvidersJson),
      categoriesGame: getSectionMeta(siteCategoriesGameJson),
      popularGames: getSectionMeta(sitePopularGamesJson),
      comingSoon: getSectionMeta(siteComingSoonJson),
      referBonus: getSectionMeta(siteReferBonusJson),
      paymentsAccepted: getSectionMeta(sitePaymentsAcceptedJson),
      welcomeDeposit: getSectionMeta(siteWelcomeDepositJson),
    },
  };

  const refetch = () => {
    refetchSite();
    refetchGames();
    refetchPopularGames();
    refetchTopGames();
  };
  return { data, isLoading, isError: !!siteError || !!gamesError, refetch };
}

export { PROVIDER_COLORS };
