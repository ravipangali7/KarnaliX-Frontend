import { apiGet, getMediaUrl } from "@/lib/api";

export interface GameCategory {
  id: number;
  name: string;
  svg?: string;
  is_active?: boolean;
}

export interface GameProvider {
  id: number;
  name: string;
  code: string;
  image?: string;
  is_active?: boolean;
}

export interface Game {
  id: number;
  name: string;
  game_uid: string;
  image?: string;
  image_url?: string;
  min_bet: string;
  max_bet: string;
  category: number;
  category_name?: string;
  provider: number;
  provider_name?: string;
  provider_code?: string;
  is_active?: boolean;
}

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  const data = (res as { data?: unknown })?.data;
  return Array.isArray(data) ? (data as T[]) : [];
}

function unwrapSingle<T>(res: unknown): T | null {
  if (res != null && typeof res === "object" && !Array.isArray(res) && !("data" in res)) return res as T;
  const data = (res as { data?: T })?.data;
  return data ?? null;
}

/** Resolve game image URL: prefer uploaded media (image), else image_url, else empty. */
export function getGameImageUrl(game: Game): string {
  if (game.image?.trim()) return getMediaUrl(game.image.trim());
  if (game.image_url?.trim()) return game.image_url.trim();
  return getMediaUrl("");
}

export async function getCategories(): Promise<GameCategory[]> {
  const res = await apiGet<GameCategory[]>("/public/categories/");
  return unwrapList<GameCategory>(res as unknown);
}

export async function getProviders(): Promise<GameProvider[]> {
  const res = await apiGet<GameProvider[]>("/public/providers/");
  return unwrapList<GameProvider>(res as unknown);
}

export interface GamesPaginatedResponse {
  results: Game[];
  count: number;
  next: string | null;
  previous: string | null;
}

export async function getGames(
  categoryId?: number,
  providerId?: number,
  page?: number,
  pageSize: number = 24
): Promise<GamesPaginatedResponse> {
  const params = new URLSearchParams();
  if (categoryId != null) params.set("category_id", String(categoryId));
  if (providerId != null) params.set("provider_id", String(providerId));
  if (page != null) params.set("page", String(page));
  params.set("page_size", String(pageSize));
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await apiGet<GamesPaginatedResponse>(`/public/games/${q}`);
  const raw = res as unknown as { results?: Game[]; count?: number; next?: string | null; previous?: string | null };
  return {
    results: Array.isArray(raw?.results) ? raw.results : [],
    count: typeof raw?.count === "number" ? raw.count : 0,
    next: raw?.next ?? null,
    previous: raw?.previous ?? null,
  };
}

export async function getGame(id: string | number): Promise<Game | null> {
  const res = await apiGet<Game>(`/public/games/${id}/`);
  return unwrapSingle<Game>(res as unknown);
}
