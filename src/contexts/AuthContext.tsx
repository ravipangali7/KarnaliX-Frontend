import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';

export type UserRole = 'POWERHOUSE' | 'SUPER' | 'MASTER' | 'USER' | 'STAFF';

interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  is_active: boolean;
  wallet_balance?: string;
  exposure_balance?: string;
  last_login_at?: string;
  created_at?: string;
  parent?: {
    id: string;
    username: string;
    role: UserRole;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  // Role helpers
  isPowerhouse: boolean;
  isSuper: boolean;
  isMaster: boolean;
  isUser: boolean;
  isStaff: boolean;
  // Legacy compatibility
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isAgent: boolean;
  // Dashboard route helper
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage immediately
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = apiClient.getToken();
      if (!token) {
        setUser(null);
        localStorage.removeItem('user');
        return;
      }

      const userData = await apiClient.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      localStorage.removeItem('user');
      apiClient.setToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // If we have a token but no user, try to refresh
      const token = apiClient.getToken();
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      apiClient.setToken(null);
    }
  };

  const register = async (userData: any) => {
    const response = await apiClient.register(userData);
    if (response && response.user) {
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  };

  const isAuthenticated = !!user;
  
  // New role-based helpers
  const isPowerhouse = user?.role === 'POWERHOUSE';
  const isSuper = user?.role === 'SUPER' || isPowerhouse;
  const isMaster = user?.role === 'MASTER' || isSuper;
  const isUser = isAuthenticated;
  const isStaff = user?.role === 'STAFF';
  
  // Legacy compatibility (map old roles to new hierarchy)
  const isMasterAdmin = isPowerhouse;
  const isAdmin = isSuper;
  const isAgent = isMaster;

  // Get appropriate dashboard route based on role
  const getDashboardRoute = (): string => {
    if (!user) return '/login';
    switch (user.role) {
      case 'POWERHOUSE':
        return '/powerhouse';
      case 'SUPER':
        return '/super';
      case 'MASTER':
        return '/master';
      case 'USER':
      case 'STAFF':
      default:
        return '/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        refreshUser,
        isAuthenticated,
        // New role helpers
        isPowerhouse,
        isSuper,
        isMaster,
        isUser,
        isStaff,
        // Legacy compatibility
        isAdmin,
        isMasterAdmin,
        isAgent,
        // Dashboard route helper
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
