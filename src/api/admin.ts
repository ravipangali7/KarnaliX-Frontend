/**
 * Admin API (powerhouse, super, master). Use prefix: powerhouse/ | super/ | master/
 */
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiPostForm, apiPatchForm } from "@/lib/api";

const prefix = (role: "powerhouse" | "super" | "master") => `/${role}`;

// --- Dashboard ---
export async function getDashboard(role: "powerhouse" | "super" | "master") {
  const res = await apiGet<Record<string, unknown>>(`${prefix(role)}/dashboard/`);
  return res as unknown as Record<string, unknown>;
}

export async function getUnreadMessageCount(role: "powerhouse" | "super" | "master") {
  const res = await apiGet<{ unread_count: number }>(`${prefix(role)}/messages/unread-count/`);
  return (res as { unread_count: number })?.unread_count ?? 0;
}

// --- Current user (profile / change password) ---
export type AdminRole = "powerhouse" | "super" | "master";
export async function getProfile(role: AdminRole) {
  return apiGet<Record<string, unknown>>(`${prefix(role)}/profile/`);
}
export async function updateProfile(role: AdminRole, data: { name?: string; phone?: string; email?: string; whatsapp_number?: string }) {
  return apiPatch(`${prefix(role)}/profile/update/`, data);
}
export async function changePassword(role: AdminRole, body: { old_password: string; new_password: string }) {
  return apiPost(`${prefix(role)}/change-password/`, body);
}

// --- Users (role-specific paths) ---
export async function getSupers() {
  const res = await apiGet(`${prefix("powerhouse")}/supers/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getSuper(id: number) {
  return apiGet(`${prefix("powerhouse")}/supers/${id}/`);
}
export async function createSuper(body: unknown) {
  return apiPost(`${prefix("powerhouse")}/supers/create/`, body);
}
export async function updateSuper(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/supers/${id}/edit/`, body);
}
export async function deleteSuper(id: number) {
  return apiDelete(`${prefix("powerhouse")}/supers/${id}/delete/`);
}

export async function getMasters(role: "powerhouse" | "super" = "powerhouse") {
  const res = await apiGet(`${prefix(role)}/masters/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getMaster(id: number, role: "powerhouse" | "super" = "powerhouse") {
  return apiGet(`${prefix(role)}/masters/${id}/`);
}
export async function createMaster(body: unknown, role: "powerhouse" | "super" = "powerhouse") {
  return apiPost(`${prefix(role)}/masters/create/`, body);
}
export async function updateMaster(id: number, body: unknown, role: "powerhouse" | "super" = "powerhouse") {
  return apiPatch(`${prefix(role)}/masters/${id}/edit/`, body);
}
export async function deleteMaster(id: number, role: "powerhouse" | "super" = "powerhouse") {
  return apiDelete(`${prefix(role)}/masters/${id}/delete/`);
}

export async function getPlayers(role: "powerhouse" | "super" | "master" = "powerhouse", params?: ListParams) {
  const res = await apiGet(`${prefix(role)}/players/${buildQueryString(params)}`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getPlayer(id: number, role: "powerhouse" | "super" | "master" = "powerhouse") {
  return apiGet(`${prefix(role)}/players/${id}/`);
}
export type PlayerReportParams = { date_from?: string; date_to?: string };
export async function getPlayerReport(
  role: "powerhouse" | "super" | "master",
  playerId: number,
  params?: PlayerReportParams
) {
  const q = new URLSearchParams();
  if (params?.date_from) q.set("date_from", params.date_from);
  if (params?.date_to) q.set("date_to", params.date_to);
  const qs = q.toString();
  const path = `${prefix(role)}/players/${playerId}/report/`;
  return apiGet<Record<string, unknown>>(qs ? `${path}?${qs}` : path);
}
export async function createPlayer(body: unknown, role: "powerhouse" | "super" | "master" = "powerhouse") {
  return apiPost(`${prefix(role)}/players/create/`, body);
}
export async function updatePlayer(id: number, body: unknown, role: "powerhouse" | "super" | "master" = "powerhouse") {
  return apiPatch(`${prefix(role)}/players/${id}/edit/`, body);
}
export async function deletePlayer(id: number, role: "powerhouse" | "super" | "master" = "powerhouse") {
  return apiDelete(`${prefix(role)}/players/${id}/delete/`);
}

// --- Deposits / Withdrawals ---
export type ListParams = { search?: string; status?: string; date_from?: string; date_to?: string; is_active?: string };
function buildQueryString(params?: ListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.date_from) q.set("date_from", params.date_from);
  if (params.date_to) q.set("date_to", params.date_to);
  if (params.is_active) q.set("is_active", params.is_active);
  const s = q.toString();
  return s ? `?${s}` : "";
}
export async function getDeposits(role: "powerhouse" | "super" | "master", params?: ListParams) {
  const res = await apiGet(`${prefix(role)}/deposits/${buildQueryString(params)}`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getDeposit(id: number, role: "powerhouse" | "super" | "master") {
  return apiGet(`${prefix(role)}/deposits/${id}/`);
}
export async function createDeposit(body: unknown, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/deposits/create/`, body);
}
/** Verify PIN first, then create and approve in one call. No pending deposit if PIN fails. */
export async function directDeposit(
  body: { user_id: number; amount: number; remarks?: string; pin: string; payment_mode?: number },
  role: "powerhouse" | "super" | "master"
) {
  return apiPost(`${prefix(role)}/deposits/direct/`, body);
}

/** Payment modes for deposit target (for dropdown). Master: own modes; super/powerhouse: modes for user_id (or parent if player). */
export async function getPaymentModesForDepositTarget(
  role: "powerhouse" | "super" | "master",
  userId: number
): Promise<Record<string, unknown>[]> {
  if (role === "master") {
    const res = await apiGet(`${prefix("master")}/payment-modes/`);
    return (res as unknown as Record<string, unknown>[]) ?? [];
  }
  const res = await apiGet(`${prefix(role)}/deposits/payment-modes/?user_id=${userId}`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function approveDeposit(id: number, body: { password?: string; pin?: string }, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/deposits/${id}/approve/`, body);
}
export async function rejectDeposit(id: number, body?: { reject_reason?: string }, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/deposits/${id}/reject/`, body ?? {});
}

export async function getWithdrawals(role: "powerhouse" | "super" | "master", params?: ListParams) {
  const res = await apiGet(`${prefix(role)}/withdrawals/${buildQueryString(params)}`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getWithdraw(id: number, role: "powerhouse" | "super" | "master") {
  return apiGet(`${prefix(role)}/withdrawals/${id}/`);
}
/** Verify PIN first, then create and approve in one call. No pending withdrawal if PIN fails. */
export async function directWithdraw(
  body: { user_id: number; amount: number; remarks?: string; pin: string },
  role: "powerhouse" | "super" | "master"
) {
  return apiPost(`${prefix(role)}/withdrawals/direct/`, body);
}
export async function approveWithdraw(id: number, body: { password?: string; pin?: string }, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/withdrawals/${id}/approve/`, body);
}
export async function rejectWithdraw(id: number, body?: { reject_reason?: string }, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/withdrawals/${id}/reject/`, body ?? {});
}

// --- Master: Payment modes (master role only) ---
export async function getMasterPaymentModes() {
  const res = await apiGet(`${prefix("master")}/payment-modes/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getMasterPaymentMode(id: number) {
  return apiGet(`${prefix("master")}/payment-modes/${id}/`);
}
export async function createMasterPaymentMode(body: unknown) {
  return apiPost(`${prefix("master")}/payment-modes/`, body);
}
/** Create payment mode with optional QR image (FormData). */
export async function createMasterPaymentModeFormData(formData: FormData) {
  return apiPostForm(`${prefix("master")}/payment-modes/`, formData);
}
export async function updateMasterPaymentMode(id: number, body: unknown) {
  return apiPatch(`${prefix("master")}/payment-modes/${id}/edit/`, body);
}
/** Update payment mode with optional QR image (FormData). */
export async function updateMasterPaymentModeFormData(id: number, formData: FormData) {
  return apiPatchForm(`${prefix("master")}/payment-modes/${id}/edit/`, formData);
}
export async function deleteMasterPaymentMode(id: number) {
  return apiDelete(`${prefix("master")}/payment-modes/${id}/delete/`);
}

// --- Payment Mode Verification (master, super, powerhouse) ---
export async function getPaymentModeVerificationList(role: "powerhouse" | "super" | "master", params?: { status?: string }) {
  const qs = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
  const res = await apiGet(`${prefix(role)}/payment-mode-verification/${qs}`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function approvePaymentModeVerification(id: number, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/payment-mode-verification/${id}/approve/`, {});
}
export async function rejectPaymentModeVerification(id: number, body: { reject_reason?: string }, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/payment-mode-verification/${id}/reject/`, body);
}

// --- Game log, Transactions, Activity ---
export async function getGameLog(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/game-log/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export type GameLogDetailResponse = {
  game_log: Record<string, unknown>;
  transaction: Record<string, unknown> | null;
};
export async function getGameLogDetail(role: "powerhouse" | "super" | "master", id: number | string): Promise<GameLogDetailResponse> {
  return apiGet<GameLogDetailResponse>(`${prefix(role)}/game-log/${id}/`);
}
export async function getTransactions(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/transactions/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getActivity(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/activity/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}

// --- Accounting report (master & super only) ---
export type AccountingReportParams = { date_from?: string; date_to?: string };
export type AccountingSummary = {
  total_pl: string;
  total_deposits: string;
  deposits_count: number;
  total_withdrawals: string;
  withdrawals_count: number;
  game_logs_count: number;
  transactions_count: number;
  settlements_count?: number;
  settlements_total?: string;
};
export type AccountingReportResponse = {
  summary: AccountingSummary;
  game_logs: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  deposits: Record<string, unknown>[];
  withdrawals: Record<string, unknown>[];
  settlements?: { id: number; from_user_username: string | null; amount: string; created_at: string | null }[];
};
export async function getAccountingReport(
  role: "master" | "super",
  params?: AccountingReportParams
): Promise<AccountingReportResponse> {
  const q = new URLSearchParams();
  if (params?.date_from) q.set("date_from", params.date_from);
  if (params?.date_to) q.set("date_to", params.date_to);
  const qs = q.toString();
  const url = `${prefix(role)}/accounting-report/${qs ? `?${qs}` : ""}`;
  return apiGet<AccountingReportResponse>(url);
}

// --- Messages ---
export async function getMessages(role: "powerhouse" | "super" | "master", partnerId?: number) {
  const path = partnerId != null ? `${prefix(role)}/messages/?partner_id=${partnerId}` : `${prefix(role)}/messages/`;
  const res = await apiGet(path);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getMessageContacts(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/messages/contacts/`);
  return (res as unknown as { id: number; username: string; name: string; role: string }[]) ?? [];
}
export async function sendMessage(body: unknown, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/messages/send/`, body);
}

// --- Settlement (super only) ---
export async function settleMaster(masterId: number, body: { pin: string }) {
  return apiPost(`${prefix("super")}/settlement/${masterId}/`, body);
}

// --- Regenerate PIN / Reset Password (powerhouse for supers/masters/players) ---
const userTypePrefix = (role: "powerhouse" | "super" | "master", userType: "supers" | "masters" | "players") =>
  `${prefix(role)}/${userType}`;

export async function regeneratePin(
  userId: number,
  body: { pin: string },
  role: "powerhouse" | "super" | "master",
  userType: "supers" | "masters" | "players"
) {
  return apiPost(`${userTypePrefix(role, userType)}/${userId}/regenerate-pin/`, body);
}

export async function resetPassword(
  userId: number,
  body: { pin: string; new_password: string },
  role: "powerhouse" | "super" | "master",
  userType: "supers" | "masters" | "players"
) {
  return apiPost(`${userTypePrefix(role, userType)}/${userId}/reset-password/`, body);
}

// ========== Powerhouse-only ==========
export async function getCategoriesAdmin() {
  const res = await apiGet(`${prefix("powerhouse")}/categories/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getCategoryAdmin(id: number) {
  return apiGet(`${prefix("powerhouse")}/categories/${id}/`);
}
export async function createCategoryAdmin(body: unknown) {
  return apiPost(`${prefix("powerhouse")}/categories/`, body);
}
/** Create category with optional SVG file (FormData). */
export async function createCategoryAdminForm(formData: FormData) {
  return apiPostForm(`${prefix("powerhouse")}/categories/`, formData);
}
export async function updateCategoryAdmin(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/categories/${id}/`, body);
}
/** Update category with optional SVG file (FormData). */
export async function updateCategoryAdminForm(id: number, formData: FormData) {
  return apiPatchForm(`${prefix("powerhouse")}/categories/${id}/`, formData);
}
export async function deleteCategoryAdmin(id: number) {
  return apiDelete(`${prefix("powerhouse")}/categories/${id}/`);
}

export async function getProvidersAdmin() {
  const res = await apiGet(`${prefix("powerhouse")}/providers/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getProviderAdmin(id: number) {
  return apiGet(`${prefix("powerhouse")}/providers/${id}/`);
}
export async function createProviderAdmin(body: unknown) {
  return apiPost(`${prefix("powerhouse")}/providers/`, body);
}
/** Create provider with optional image file (FormData). */
export async function createProviderAdminForm(formData: FormData) {
  return apiPostForm(`${prefix("powerhouse")}/providers/`, formData);
}
export async function updateProviderAdmin(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/providers/${id}/`, body);
}
/** Update provider with optional image file (FormData). */
export async function updateProviderAdminForm(id: number, formData: FormData) {
  return apiPatchForm(`${prefix("powerhouse")}/providers/${id}/`, formData);
}
export async function deleteProviderAdmin(id: number) {
  return apiDelete(`${prefix("powerhouse")}/providers/${id}/`);
}

export async function getGamesAdmin() {
  const res = await apiGet(`${prefix("powerhouse")}/games/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getGameAdmin(id: number) {
  return apiGet(`${prefix("powerhouse")}/games/${id}/`);
}
export async function createGame(body: unknown) {
  return apiPost(`${prefix("powerhouse")}/games/`, body);
}
export async function createGameForm(formData: FormData) {
  return apiPostForm(`${prefix("powerhouse")}/games/`, formData);
}
export async function updateGame(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/games/${id}/`, body);
}
export async function updateGameForm(id: number, formData: FormData) {
  return apiPatchForm(`${prefix("powerhouse")}/games/${id}/`, formData);
}
export async function deleteGame(id: number) {
  return apiDelete(`${prefix("powerhouse")}/games/${id}/`);
}

// --- Direct Import (game API called from browser; backend only provides URL and persists import) ---
export type ImportProvider = { code: string; name: string };
export type ImportGame = { game_uid: string; game_name: string; game_type: string; game_image: string };
export type ImportProviderGamesResponse = { categories: string[]; games: ImportGame[] };
export type ImportGamesResult = { provider_created: boolean; categories_created: number; games_created: number; games_skipped: number };

function unwrapObject<T>(res: unknown): T {
  if (res != null && typeof res === "object" && !Array.isArray(res) && !("data" in res)) return res as T;
  const d = (res as { data?: T })?.data;
  return d as T;
}

/** Get game API base URL from backend (no backend call to game API). */
export async function getImportGameApiUrl(): Promise<{ game_api_url: string }> {
  const res = await apiGet<{ game_api_url?: string }>(`${prefix("powerhouse")}/import/game-api-url/`);
  const raw = unwrapObject<{ game_api_url?: string }>(res as unknown);
  const url = (raw?.game_api_url ?? "").trim();
  return { game_api_url: url };
}

/** Fetch providers from game API from browser (GET serverurl/getProvider). */
export async function fetchProvidersFromGameApi(baseUrl: string): Promise<ImportProvider[]> {
  const url = baseUrl.replace(/\/$/, "") + "/getProvider";
  const r = await fetch(url, { method: "GET" });
  if (!r.ok) throw new Error(r.status === 404 ? "Not Found (check Game API URL in Super Settings)" : `Game API error: ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data)) return [];
  const result: ImportProvider[] = [];
  for (const item of data) {
    if (typeof item === "string") result.push({ code: item, name: item });
    else if (item && typeof item === "object") {
      const code = String(item.code ?? item.provider ?? item.id ?? "").trim();
      const name = String(item.name ?? item.displayName ?? code).trim();
      if (code) result.push({ code, name });
    }
  }
  return result;
}

/** Fetch provider games from game API from browser (GET serverurl/providerGame?provider=...&limitCount=10000). */
export async function fetchProviderGamesFromGameApi(baseUrl: string, providerCode: string): Promise<ImportProviderGamesResponse> {
  const base = baseUrl.replace(/\/$/, "");
  const url = `${base}/providerGame?provider=${encodeURIComponent(providerCode)}&limitCount=10000`;
  const r = await fetch(url, { method: "GET" });
  if (!r.ok) throw new Error(r.status === 404 ? "Not Found (check provider code)" : `Game API error: ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data)) return { categories: [], games: [] };
  const games: ImportGame[] = [];
  const categorySet = new Set<string>();
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const game_code = String(item.game_code ?? item.code ?? "").trim();
    if (!game_code) continue;
    const game_type = (String(item.game_type ?? item.type ?? "").trim() || "Other");
    categorySet.add(game_type);
    games.push({
      game_uid: game_code,
      game_name: String(item.game_name ?? item.name ?? game_code).trim(),
      game_type,
      game_image: String(item.game_image ?? item.image ?? "").trim(),
    });
  }
  const categories = Array.from(categorySet).sort();
  return { categories, games };
}

export async function postImportGames(payload: {
  provider_code: string;
  provider_name: string;
  games: ImportGame[];
}): Promise<ImportGamesResult> {
  const res = await apiPost<ImportGamesResult>(`${prefix("powerhouse")}/import/games/`, payload);
  return unwrapObject<ImportGamesResult>(res as unknown) ?? {
    provider_created: false,
    categories_created: 0,
    games_created: 0,
    games_skipped: 0,
  };
}

export async function getBonusRulesAdmin() {
  const res = await apiGet(`${prefix("powerhouse")}/bonus-rules/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getBonusRuleAdmin(id: number) {
  return apiGet(`${prefix("powerhouse")}/bonus-rules/${id}/`);
}
export async function createBonusRule(body: unknown) {
  return apiPost(`${prefix("powerhouse")}/bonus-rules/`, body);
}
export async function updateBonusRule(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/bonus-rules/${id}/`, body);
}
export async function deleteBonusRule(id: number) {
  return apiDelete(`${prefix("powerhouse")}/bonus-rules/${id}/`);
}

export async function getSuperSettings() {
  return apiGet(`${prefix("powerhouse")}/super-settings/`);
}
export async function saveSuperSettings(body: unknown) {
  return apiPost(`${prefix("powerhouse")}/super-settings/save/`, body);
}

export async function getSiteSettingsAdmin() {
  return apiGet(`${prefix("powerhouse")}/site-settings/`);
}
export async function updateSiteSettings(body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/site-settings/update/`, body);
}
/** Update site settings with logo file (FormData). Send name, phone1, phone2, email1, whatsapp_number, hero_title, hero_subtitle, footer_description, promo_banners (JSON string), logo (file). */
export async function updateSiteSettingsForm(formData: FormData) {
  return apiPatchForm(`${prefix("powerhouse")}/site-settings/update/`, formData);
}

// --- Slider (second home) ---
export async function getSliderSlidesAdmin() {
  const res = await apiGet(`${prefix("powerhouse")}/slider/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function createSliderSlide(body: { title: string; subtitle?: string; image?: string; cta_label?: string; cta_link?: string; order?: number }) {
  return apiPost(`${prefix("powerhouse")}/slider/`, body);
}
export async function updateSliderSlide(id: number, body: Partial<{ title: string; subtitle: string; image: string; cta_label: string; cta_link: string; order: number }>) {
  return apiPatch(`${prefix("powerhouse")}/slider/${id}/`, body);
}
export async function deleteSliderSlide(id: number) {
  return apiDelete(`${prefix("powerhouse")}/slider/${id}/`);
}
export async function createSliderSlideForm(formData: FormData) {
  return apiPostForm(`${prefix("powerhouse")}/slider/`, formData);
}
export async function updateSliderSlideForm(id: number, formData: FormData) {
  return apiPatchForm(`${prefix("powerhouse")}/slider/${id}/`, formData);
}

// --- Live Betting (second home) ---
export async function getLiveBettingSectionsAdmin() {
  const res = await apiGet(`${prefix("powerhouse")}/live-betting-sections/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function createLiveBettingSection(body: { title: string; order?: number }) {
  return apiPost(`${prefix("powerhouse")}/live-betting-sections/`, body);
}
export async function updateLiveBettingSection(id: number, body: Partial<{ title: string; order: number }>) {
  return apiPatch(`${prefix("powerhouse")}/live-betting-sections/${id}/`, body);
}
export async function deleteLiveBettingSection(id: number) {
  return apiDelete(`${prefix("powerhouse")}/live-betting-sections/${id}/`);
}
export async function getLiveBettingEventsAdmin(sectionId?: number) {
  const url = sectionId != null ? `${prefix("powerhouse")}/live-betting-events/?section=${sectionId}` : `${prefix("powerhouse")}/live-betting-events/`;
  const res = await apiGet(url);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function createLiveBettingEvent(body: { section: number; sport?: string; team1: string; team2: string; event_date?: string; event_time?: string; odds?: number[]; is_live?: boolean; order?: number }) {
  return apiPost(`${prefix("powerhouse")}/live-betting-events/`, body);
}
export async function updateLiveBettingEvent(id: number, body: Partial<{ section: number; sport: string; team1: string; team2: string; event_date: string; event_time: string; odds: number[]; is_live: boolean; order: number }>) {
  return apiPatch(`${prefix("powerhouse")}/live-betting-events/${id}/`, body);
}
export async function deleteLiveBettingEvent(id: number) {
  return apiDelete(`${prefix("powerhouse")}/live-betting-events/${id}/`);
}

export async function getCmsPages() {
  const res = await apiGet(`${prefix("powerhouse")}/cms/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getCmsPage(id: number) {
  return apiGet(`${prefix("powerhouse")}/cms/${id}/`);
}
export async function createCmsPage(body: unknown) {
  return apiPost(`${prefix("powerhouse")}/cms/`, body);
}
/** Create CMS page with optional image file (FormData). */
export async function createCmsPageForm(formData: FormData) {
  return apiPostForm(`${prefix("powerhouse")}/cms/`, formData);
}
export async function updateCmsPage(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/cms/${id}/`, body);
}
/** Update CMS page with optional image file (FormData). */
export async function updateCmsPageForm(id: number, formData: FormData) {
  return apiPatchForm(`${prefix("powerhouse")}/cms/${id}/`, formData);
}
export async function deleteCmsPage(id: number) {
  return apiDelete(`${prefix("powerhouse")}/cms/${id}/`);
}

export async function getTestimonialsAdmin() {
  const res = await apiGet(`${prefix("powerhouse")}/testimonials/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getTestimonialAdmin(id: number) {
  return apiGet(`${prefix("powerhouse")}/testimonials/${id}/`);
}
export async function createTestimonial(body: unknown) {
  return apiPost(`${prefix("powerhouse")}/testimonials/`, body);
}
/** Create testimonial with optional image file (FormData). */
export async function createTestimonialForm(formData: FormData) {
  return apiPostForm(`${prefix("powerhouse")}/testimonials/`, formData);
}
export async function updateTestimonial(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/testimonials/${id}/`, body);
}
/** Update testimonial with optional image file (FormData). */
export async function updateTestimonialForm(id: number, formData: FormData) {
  return apiPatchForm(`${prefix("powerhouse")}/testimonials/${id}/`, formData);
}
export async function deleteTestimonial(id: number) {
  return apiDelete(`${prefix("powerhouse")}/testimonials/${id}/`);
}
