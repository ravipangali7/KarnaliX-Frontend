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

export async function getGames(categoryId?: number, providerId?: number): Promise<Game[]> {
  const params = new URLSearchParams();
  if (categoryId != null) params.set("category_id", String(categoryId));
  if (providerId != null) params.set("provider_id", String(providerId));
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await apiGet<Game[]>(`/public/games/${q}`);
  return unwrapList<Game>(res as unknown);
}

export async function getGame(id: string | number): Promise<Game | null> {
  const res = await apiGet<Game>(`/public/games/${id}/`);
  return unwrapSingle<Game>(res as unknown);
}
