/**
 * Admin API (powerhouse, super, master). Use prefix: powerhouse/ | super/ | master/
 */
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";

const prefix = (role: "powerhouse" | "super" | "master") => `/${role}`;

// --- Dashboard ---
export async function getDashboard(role: "powerhouse" | "super" | "master") {
  const res = await apiGet<Record<string, unknown>>(`${prefix(role)}/dashboard/`);
  return res as unknown as Record<string, unknown>;
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

export async function getPlayers(role: "powerhouse" | "super" | "master" = "powerhouse") {
  const res = await apiGet(`${prefix(role)}/players/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getPlayer(id: number, role: "powerhouse" | "super" | "master" = "powerhouse") {
  return apiGet(`${prefix(role)}/players/${id}/`);
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
export async function getDeposits(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/deposits/`);
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

export async function getWithdrawals(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/withdrawals/`);
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
export async function updateMasterPaymentMode(id: number, body: unknown) {
  return apiPatch(`${prefix("master")}/payment-modes/${id}/edit/`, body);
}
export async function deleteMasterPaymentMode(id: number) {
  return apiDelete(`${prefix("master")}/payment-modes/${id}/delete/`);
}

// --- KYC ---
export async function getKycList(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/kyc/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function approveKyc(id: number, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/kyc/${id}/approve/`, {});
}
export async function rejectKyc(id: number, body: { reason?: string }, role: "powerhouse" | "super" | "master") {
  return apiPost(`${prefix(role)}/kyc/${id}/reject/`, body);
}

// --- Game log, Transactions, Activity ---
export async function getGameLog(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/game-log/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getTransactions(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/transactions/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getActivity(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/activity/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}

// --- Messages ---
export async function getMessages(role: "powerhouse" | "super" | "master") {
  const res = await apiGet(`${prefix(role)}/messages/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
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
export async function updateCategoryAdmin(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/categories/${id}/`, body);
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
export async function updateProviderAdmin(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/providers/${id}/`, body);
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
export async function updateGame(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/games/${id}/`, body);
}
export async function deleteGame(id: number) {
  return apiDelete(`${prefix("powerhouse")}/games/${id}/`);
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
export async function updateCmsPage(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/cms/${id}/`, body);
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
export async function updateTestimonial(id: number, body: unknown) {
  return apiPatch(`${prefix("powerhouse")}/testimonials/${id}/`, body);
}
export async function deleteTestimonial(id: number) {
  return apiDelete(`${prefix("powerhouse")}/testimonials/${id}/`);
}
