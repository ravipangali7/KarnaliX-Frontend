import { apiGet, apiPost, apiPatch, apiDelete, BASE_URL } from "@/lib/api";

const P = "/player";

/**
 * Launch game by internal game id: GET /api/player/games/<id>/launch/, then open launch_url in new tab.
 */
export async function launchGame(gameId: number): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Login to play");
  const url = `${BASE_URL.replace(/\/$/, "")}${P}/games/${gameId}/launch/`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Token ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { launch_url?: string; error?: string; detail?: string };
  if (!res.ok) {
    throw { status: res.status, detail: data.error ?? data.detail ?? "Launch failed", ...data };
  }
  const launchUrl = data?.launch_url?.trim();
  if (!launchUrl) throw new Error("Could not get game URL");
  window.open(launchUrl, "_blank", "noopener,noreferrer");
}

export async function getPlayerDashboard() {
  const res = await apiGet<Record<string, unknown>>(`${P}/dashboard/`);
  return res as unknown as Record<string, unknown>;
}

export async function getPlayerWallet() {
  const res = await apiGet<Record<string, unknown>>(`${P}/wallet/`);
  return res as unknown as Record<string, unknown>;
}

export async function getPlayerTransactions() {
  const res = await apiGet(`${P}/transactions/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}

export async function getPlayerGameLog() {
  const res = await apiGet(`${P}/game-log/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}

/** Master's payment modes (for deposit). Use in deposit modal. */
export async function getDepositPaymentModes() {
  const res = await apiGet(`${P}/deposit-payment-modes/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}

export async function getPaymentModes() {
  const res = await apiGet(`${P}/payment-modes/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function getPaymentMode(id: number) {
  return apiGet(`${P}/payment-modes/${id}/`);
}
export async function createPaymentMode(body: unknown) {
  return apiPost(`${P}/payment-modes/`, body);
}
export async function updatePaymentMode(id: number, body: unknown) {
  return apiPatch(`${P}/payment-modes/${id}/`, body);
}
export async function deletePaymentMode(id: number) {
  return apiDelete(`${P}/payment-modes/${id}/`);
}

export async function getKycStatus() {
  return apiGet(`${P}/kyc/`);
}

export async function submitKyc(body: FormData | Record<string, unknown>) {
  if (body instanceof FormData) {
    const token = localStorage.getItem("token");
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const res = await fetch(`${base}${P}/kyc/submit/`, {
      method: "POST",
      headers: token ? { Authorization: `Token ${token}` } : {},
      body,
    });
    if (!res.ok) throw { status: res.status, ...(await res.json().catch(() => ({}))) };
    return res.json();
  }
  return apiPost(`${P}/kyc/submit/`, body);
}

export async function depositRequest(body: unknown) {
  return apiPost(`${P}/deposit-request/`, body);
}

/** Submit deposit with screenshot file (multipart/form-data). */
export async function depositRequestWithScreenshot(formData: FormData) {
  const token = localStorage.getItem("token");
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  const res = await fetch(`${base}${P}/deposit-request/`, {
    method: "POST",
    headers: token ? { Authorization: `Token ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, ...data };
  }
  return res.json();
}

export async function withdrawRequest(body: unknown) {
  return apiPost(`${P}/withdraw-request/`, body);
}

export async function getProfile() {
  return apiGet(`${P}/profile/`);
}

export async function updateProfile(body: unknown) {
  return apiPost(`${P}/profile/update/`, body);
}

export async function changePassword(body: { old_password: string; new_password: string }) {
  return apiPost(`${P}/change-password/`, body);
}

export async function getPlayerMessages() {
  const res = await apiGet(`${P}/messages/`);
  return (res as unknown as Record<string, unknown>[]) ?? [];
}
export async function sendPlayerMessage(body: unknown) {
  return apiPost(`${P}/messages/send/`, body);
}

export async function transfer(body: { username: string; amount: string; password: string }) {
  return apiPost(`${P}/transfer/`, body);
}
