/**
 * Map API game/provider shape to frontend card shape.
 * Category slug <-> backend game_type mapping for public games API.
 */

/** Backend game_type to frontend category slug (for URLs and sections) */
export const GAME_TYPE_TO_SLUG: Record<string, string> = {
  CRASH: "crash",
  CASINO: "casino",
  SLOT: "casino",
  LIVE: "liveCasino",
  SPORTS: "sports",
  VIRTUAL: "casual",
  OTHER: "casual",
};

/** Frontend slug to backend game_type(s) - one slug can map to multiple types */
export const SLUG_TO_GAME_TYPES: Record<string, string[]> = {
  crash: ["CRASH"],
  casino: ["CASINO", "SLOT"],
  liveCasino: ["LIVE"],
  sports: ["SPORTS"],
  casual: ["VIRTUAL", "OTHER"],
};

/** Slug to display label for category sections */
export const SLUG_TO_LABEL: Record<string, string> = {
  crash: "Crash Games",
  casino: "Casino Games",
  liveCasino: "Live Casino",
  sports: "Sports Betting",
  casual: "Casual Games",
};

/** Ordered slug list for home page sections */
export const CATEGORY_SLUGS_ORDER = ["crash", "casino", "liveCasino", "sports", "casual"];

const DEFAULT_GAME_IMAGE = "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=300&fit=crop";

export interface ApiGame {
  id: number;
  name: string;
  game_type: string;
  min_bet: string | number;
  max_bet: string | number;
  rtp?: string | number;
  provider_name?: string;
  provider?: number;
  status?: string;
}

export interface ApiProvider {
  id: number;
  name: string;
  code?: string;
  games_count?: number;
  status?: string;
}

export interface GameCardShape {
  id: string;
  name: string;
  image: string;
  category: string;
  players: number;
  minBet: number;
  maxBet: number;
  rating: number;
  isHot?: boolean;
  isNew?: boolean;
  provider?: string;
}

export function apiGameToCard(g: ApiGame): GameCardShape {
  const minBet = typeof g.min_bet === "string" ? parseFloat(g.min_bet) : g.min_bet;
  const maxBet = typeof g.max_bet === "string" ? parseFloat(g.max_bet) : g.max_bet;
  const rtp = g.rtp != null ? (typeof g.rtp === "string" ? parseFloat(g.rtp) : g.rtp) : 96;
  return {
    id: String(g.id),
    name: g.name,
    image: DEFAULT_GAME_IMAGE,
    category: g.game_type || "OTHER",
    players: 0,
    minBet: Number.isFinite(minBet) ? minBet : 10,
    maxBet: Number.isFinite(maxBet) ? maxBet : 100000,
    rating: Math.min(5, (rtp || 96) / 20),
    provider: g.provider_name || "",
  };
}

export function apiProviderToCard(p: ApiProvider): { name: string; logo: string; games: number; color: string } {
  const colors = [
    "from-orange-500 to-red-500",
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-cyan-500 to-blue-500",
    "from-red-500 to-pink-500",
    "from-indigo-500 to-purple-500",
  ];
  const i = (p.id || 0) % colors.length;
  return {
    name: p.name,
    logo: p.code ? p.code.slice(0, 2).toUpperCase() : p.name.slice(0, 2).toUpperCase(),
    games: p.games_count ?? 0,
    color: colors[i],
  };
}
