import { apiGet } from "@/lib/api";

export async function getSiteSetting() {
  const res = await apiGet("/public/site-setting/");
  return (res as Record<string, unknown>) ?? {};
}

export async function getCmsFooterPages() {
  const res = await apiGet("/public/cms/footer/");
  return (res as unknown as Array<Record<string, unknown>>) ?? [];
}

export async function getTestimonials() {
  const res = await apiGet("/public/testimonials/");
  return (res as unknown as Array<Record<string, unknown>>) ?? [];
}

export interface SliderSlideApi {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  cta_label: string;
  cta_link: string;
  order: number;
}

export async function getSliderSlides(): Promise<SliderSlideApi[]> {
  const res = await apiGet("/public/slider/");
  return (Array.isArray(res) ? res : []) as SliderSlideApi[];
}

export interface LiveBettingEventApi {
  id: number;
  section: number;
  sport?: string;
  team1: string;
  team2: string;
  event_date?: string;
  event_time?: string;
  odds: number[];
  is_live?: boolean;
  order?: number;
}

export interface LiveBettingSectionApi {
  id: number;
  title: string;
  order: number;
  events: LiveBettingEventApi[];
}

export async function getLiveBettingSections(): Promise<LiveBettingSectionApi[]> {
  const res = await apiGet("/public/live-betting/");
  return (Array.isArray(res) ? res : []) as LiveBettingSectionApi[];
}
