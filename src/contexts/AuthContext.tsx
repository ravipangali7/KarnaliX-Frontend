import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiPost, apiGet } from "@/lib/api";

export type UserRole = "powerhouse" | "super" | "master" | "player";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  role_display?: string;
  main_balance?: string;
  bonus_balance?: string;
  pl_balance?: string;
  exposure_balance?: string;
  exposure_limit?: string;
  super_balance?: string | null;
  master_balance?: string | null;
  player_balance?: string | null;
  total_balance?: string | number;
  kyc_status?: string;
  parent?: number | null;
  whatsapp_number?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<User>;
  register: (data: { signup_token: string; phone: string; name: string; password: string; referral_code?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "user";
const TOKEN_KEY = "token";

function loadStored(): { user: User | null; token: string | null } {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t && u) {
      return { token: t, user: JSON.parse(u) as User };
    }
  } catch {
    // ignore
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    ...loadStored(),
    loading: true,
  }));

  const refreshUser = useCallback(async () => {
    const { token } = loadStored();
    if (!token) {
      setState((s) => ({ ...s, user: null, token: null, loading: false }));
      return;
    }
    try {
      const res = await apiGet<User>("/public/auth/me/");
      const user = res as unknown as User;
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState((s) => ({ ...s, user, loading: false }));
      } else {
        setState((s) => ({ ...s, user: null, token: null, loading: false }));
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState((s) => ({ ...s, user: null, token: null, loading: false }));
    }
  }, []);

  useEffect(() => {
    const { token, user } = loadStored();
    if (!token) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const onLogout = () => {
      setState({ user: null, token: null, loading: false });
    };
    window.addEventListener("auth-logout", onLogout);
    return () => window.removeEventListener("auth-logout", onLogout);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<User> => {
    const res = await apiPost<{ token: string; user: User }>("/public/auth/login/", {
      username,
      password,
    });
    const data = res as unknown as { token: string; user: User };
    if (!data.token || !data.user) throw new Error("Invalid response");
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, loading: false });
    return data.user;
  }, []);

  const register = useCallback(
    async (data: {
      signup_token: string;
      phone: string;
      name: string;
      password: string;
      referral_code?: string;
    }) => {
      const res = await apiPost<{ token: string; user: User }>("/public/auth/register/", data);
      const out = res as unknown as { token: string; user: User };
      if (out.token && out.user) {
        localStorage.setItem(TOKEN_KEY, out.token);
        localStorage.setItem(USER_KEY, JSON.stringify(out.user));
        setState({ user: out.user, token: out.token, loading: false });
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, loading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
