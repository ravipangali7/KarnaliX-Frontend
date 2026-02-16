/**
 * API client: base URL + auth header. Uses fetch.
 */

// const BASE_URL = 'http://localhost:8000/api';
const BASE_URL = 'https://admin.kingxclub.com/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export type ApiResponse<T = unknown> = {
  data?: T;
  detail?: string;
  [key: string]: unknown;
};

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Token ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data: ApiResponse<T>;
  try {
    data = text ? (JSON.parse(text) as ApiResponse<T>) : {};
  } catch {
    data = { detail: text || 'Request failed' };
  }
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    throw { status: res.status, ...data };
  }
  return data;
}

export async function apiGet<T = unknown>(path: string): Promise<ApiResponse<T>> {
  return api<T>(path, { method: 'GET' });
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export async function apiPut<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return api<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
}

export async function apiPatch<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return api<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
}

export async function apiDelete(path: string): Promise<ApiResponse> {
  return api(path, { method: 'DELETE' });
}

export function getMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = BASE_URL.replace('/api', '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
