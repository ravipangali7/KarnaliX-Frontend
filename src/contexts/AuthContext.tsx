import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';

/**
 * Role hierarchy (highest to lowest):
 * - powerhouse: Platform owner with absolute authority
 * - super_admin: Platform management
 * - master: Agent/Operator who manages users
 * - user: Player/End user
 */
export type UserRole = 'powerhouse' | 'super_admin' | 'master' | 'user';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  powerhouse: 4,
  super_admin: 3,
  master: 2,
  user: 1,
};

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  kyc_status: string;
  wallet_balance?: number;
  transfer_limit?: string;
  betting_limit?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  // Role checks
  isPowerHouse: boolean;
  isSuperAdmin: boolean;
  isMaster: boolean;
  isUser: boolean;
  // Legacy compatibility
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isAgent: boolean;
  // Utility functions
  canAccessPanel: (panel: 'powerhouse' | 'superadmin' | 'master' | 'dashboard') => boolean;
  getRoleLevel: () => number;
  canManageRole: (targetRole: UserRole) => boolean;
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
      // Only clear auth state on 401 (token was invalid and already cleared by API).
      // On network/5xx errors keep persisted user so refresh does not log the user out.
      if (!apiClient.getToken()) {
        setUser(null);
        localStorage.removeItem('user');
      }
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

  const login = async (email: string, password: string, totpCode?: string) => {
    try {
      const response = await apiClient.login(email, password, totpCode);
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
    return response;
  };

  const isAuthenticated = !!user;
  
  // New role checks based on hierarchy
  const isPowerHouse = user?.role === 'powerhouse';
  const isSuperAdmin = user?.role === 'super_admin' || isPowerHouse;
  const isMaster = user?.role === 'master'; // Master only - no inheritance from SuperAdmin
  const isUser = !!user; // All authenticated users are at least 'user' level
  
  // Legacy compatibility
  const isMasterAdmin = isSuperAdmin; // Maps to super_admin or above
  const isAdmin = isMaster; // Maps to master or above
  const isAgent = isMaster; // Maps to master or above (agent was renamed to master)

  // Utility function to check panel access
  const canAccessPanel = (panel: 'powerhouse' | 'superadmin' | 'master' | 'dashboard'): boolean => {
    if (!user) return false;
    
    const panelRequirements: Record<string, UserRole[]> = {
      powerhouse: ['powerhouse'],
      superadmin: ['powerhouse', 'super_admin'],
      master: ['powerhouse', 'super_admin', 'master'],
      dashboard: ['powerhouse', 'super_admin', 'master', 'user'],
    };
    
    return panelRequirements[panel]?.includes(user.role) ?? false;
  };

  // Get current user's role level
  const getRoleLevel = (): number => {
    if (!user) return 0;
    return ROLE_HIERARCHY[user.role] ?? 0;
  };

  // Check if current user can manage users with target role
  const canManageRole = (targetRole: UserRole): boolean => {
    if (!user) return false;
    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0;
    return userLevel > targetLevel;
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
        // New role checks
        isPowerHouse,
        isSuperAdmin,
        isMaster,
        isUser,
        // Legacy compatibility
        isAdmin,
        isMasterAdmin,
        isAgent,
        // Utility functions
        canAccessPanel,
        getRoleLevel,
        canManageRole,
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
