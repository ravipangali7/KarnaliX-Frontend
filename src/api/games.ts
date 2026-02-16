import { apiGet } from "@/lib/api";

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
  min_bet: string;
  max_bet: string;
  category: number;
  category_name?: string;
  provider: number;
  provider_name?: string;
  provider_code?: string;
  is_active?: boolean;
}

export async function getCategories(): Promise<GameCategory[]> {
  const res = await apiGet<GameCategory[]>("/public/categories/");
  return (res as unknown as GameCategory[]) ?? [];
}

export async function getProviders(): Promise<GameProvider[]> {
  const res = await apiGet<GameProvider[]>("/public/providers/");
  return (res as unknown as GameProvider[]) ?? [];
}

export async function getGames(categoryId?: number): Promise<Game[]> {
  const q = categoryId != null ? `?category_id=${categoryId}` : "";
  const res = await apiGet<Game[]>(`/public/games/${q}`);
  return (res as unknown as Game[]) ?? [];
}

export async function getGame(id: string | number): Promise<Game | null> {
  const res = await apiGet<Game>(`/public/games/${id}/`);
  return (res as unknown as Game) ?? null;
}
