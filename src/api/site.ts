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
