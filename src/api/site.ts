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

export interface PopupApi {
  id: number;
  title: string;
  content?: string;
  image?: string | null;
  cta_label: string;
  cta_link: string;
  is_active: boolean;
  order: number;
}

export async function getActivePopups(): Promise<PopupApi[]> {
  const res = await apiGet("/public/popups/");
  return (Array.isArray(res) ? res : []) as PopupApi[];
}

export interface PublicPaymentMethod {
  id: number;
  name: string;
  image_url?: string | null;
  order: number;
}

export async function getPublicPaymentMethods(): Promise<PublicPaymentMethod[]> {
  const res = await apiGet("/public/payment-methods/");
  return (Array.isArray(res) ? res : []) as PublicPaymentMethod[];
}

// Type definitions for site setting JSON fields
export interface SiteSectionBase {
  section_title?: string;
  section_svg?: string;
}

export interface SiteCategoriesJson extends SiteSectionBase {
  category_ids?: number[];
}

export interface SiteTopGamesJson extends SiteSectionBase {
  game_ids?: number[];
}

export interface SiteProvidersJson extends SiteSectionBase {
  provider_ids?: number[];
}

export interface SiteCategoryEntry {
  category_id: number;
  game_ids: number[];
}

export interface SiteCategoriesGameJson extends SiteSectionBase {
  categories?: SiteCategoryEntry[];
}

export interface SitePopularGamesJson extends SiteSectionBase {
  game_ids?: number[];
}

export interface SiteComingSoonJson extends SiteSectionBase {}

export interface SiteReferBonusJson extends SiteSectionBase {
  description?: string;
  cta?: string;
  href?: string;
}

export interface SitePaymentsAcceptedJson extends SiteSectionBase {
  payment_method_ids?: number[];
}

export interface SiteFooterJson {
  tagline?: string;
  links?: { label: string; href: string }[];
}

export interface SiteWelcomeDepositJson extends SiteSectionBase {
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
}
