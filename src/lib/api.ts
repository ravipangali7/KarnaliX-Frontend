/**
 * API Client for KarnaliX
 * Handles all backend API communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.setToken(null);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string, totpCode?: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, totp_code: totpCode }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Users
  async getUsers(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async createUser(userData: any) {
    return this.request('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserById(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async suspendUser(userId: string) {
    return this.request(`/users/${userId}/suspend`, { method: 'POST' });
  }

  // Wallets
  async getMyBalance() {
    return this.request('/wallets/my-balance');
  }

  async getUserBalance(userId: string) {
    return this.request(`/wallets/${userId}`);
  }

  // Coins
  async mintCoins(toUserId: string, amount: number, description?: string) {
    return this.request('/coins/mint', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, amount, description }),
    });
  }

  async transferCoins(toUserId: string, amount: number, walletType = 'main_coin', description?: string) {
    return this.request('/coins/transfer', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, amount, wallet_type: walletType, description }),
    });
  }

  async getTransactions(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/coins/transactions${query ? `?${query}` : ''}`);
  }

  // Games
  async getGames(params?: { category?: string; provider?: string; featured?: boolean; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.provider) searchParams.set('provider', params.provider);
    if (params?.featured !== undefined) searchParams.set('featured', String(params.featured));
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return this.request(`/games${query ? `?${query}` : ''}`);
  }

  async getGame(idOrSlug: string) {
    return this.request(`/games/${idOrSlug}`);
  }

  async launchGame(gameId: string) {
    return this.request(`/games/${gameId}/launch`, { method: 'POST' });
  }

  async getGameCategories() {
    return this.request('/games/categories');
  }

  async getGameProviders() {
    return this.request('/games/providers');
  }

  // Bets
  async placeBet(betData: any) {
    return this.request('/bets', {
      method: 'POST',
      body: JSON.stringify(betData),
    });
  }

  async getBets(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bets${query ? `?${query}` : ''}`);
  }

  async settleBet(betId: string, result: 'won' | 'lost', actualWin = 0) {
    return this.request(`/bets/${betId}/settle`, {
      method: 'POST',
      body: JSON.stringify({ result, actual_win: actualWin }),
    });
  }

  // Deposits
  async createDeposit(data: any) {
    return this.request('/transactions/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDeposits(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions/deposits${query ? `?${query}` : ''}`);
  }

  async approveDeposit(depositId: string, reviewNotes?: string) {
    return this.request(`/transactions/deposits/${depositId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  async rejectDeposit(depositId: string, reviewNotes: string) {
    return this.request(`/transactions/deposits/${depositId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  // Withdrawals
  async createWithdrawal(data: any) {
    return this.request('/transactions/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWithdrawals(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions/withdrawals${query ? `?${query}` : ''}`);
  }

  async approveWithdrawal(withdrawalId: string, reviewNotes?: string) {
    return this.request(`/transactions/withdrawals/${withdrawalId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  async rejectWithdrawal(withdrawalId: string, reason?: string) {
    return this.request(`/transactions/withdrawals/${withdrawalId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // KYC
  async uploadKYC(data: any) {
    return this.request('/kyc/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getKYCStatus() {
    return this.request('/kyc/status');
  }

  async getPendingKYC() {
    return this.request('/kyc/pending');
  }

  async approveKYC(kycId: string, reviewNotes?: string) {
    return this.request(`/kyc/${kycId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  async rejectKYC(kycId: string, reviewNotes: string) {
    return this.request(`/kyc/${kycId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  // Support
  async createTicket(data: any) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTickets(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/support/tickets${query ? `?${query}` : ''}`);
  }

  async replyToTicket(ticketId: string, message: string) {
    return this.request(`/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async closeTicket(ticketId: string) {
    return this.request(`/support/tickets/${ticketId}/close`, {
      method: 'PATCH',
    });
  }

  // ============= ADMIN APIs =============
  
  // Dashboard Stats
  async getAdminDashboardStats() {
    return this.request('/dashboard/admin-stats');
  }

  // All Games (Admin view)
  async getAllGames(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/games/admin/all${query ? `?${query}` : ''}`);
  }

  async createGame(data: any) {
    return this.request('/games/admin/games', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGame(gameId: string, data: any) {
    return this.request(`/games/admin/games/${gameId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGame(gameId: string) {
    return this.request(`/games/admin/games/${gameId}`, {
      method: 'DELETE',
    });
  }

  // Provider CRUD (Admin)
  async getAllProviders() {
    return this.request('/games/admin/providers/');
  }

  async createProvider(data: { name: string; logo?: string; description?: string; website_url?: string; is_active?: boolean; sort_order?: number }) {
    return this.request('/games/admin/providers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProvider(providerId: string, data: any) {
    return this.request(`/games/admin/providers/${providerId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProvider(providerId: string) {
    return this.request(`/games/admin/providers/${providerId}/`, {
      method: 'DELETE',
    });
  }

  // Category CRUD (Admin)
  async getAllCategories() {
    return this.request('/games/admin/categories/');
  }

  async createCategory(data: { name: string; icon?: string; description?: string; is_active?: boolean; sort_order?: number }) {
    return this.request('/games/admin/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(categoryId: string, data: any) {
    return this.request(`/games/admin/categories/${categoryId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(categoryId: string) {
    return this.request(`/games/admin/categories/${categoryId}/`, {
      method: 'DELETE',
    });
  }

  // KYC Admin
  async getAllKYC(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/kyc/pending${query ? `?${query}` : ''}`);
  }

  // All Bets (Admin)
  async getAllBets(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bets${query ? `?${query}` : ''}`);
  }

  async cancelBet(betId: string, reason: string) {
    return this.request(`/bets/${betId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Change User Role (Master Admin)
  async changeUserRole(userId: string, newRole: string) {
    return this.request(`/users/${userId}/change-role?new_role=${newRole}`, {
      method: 'PATCH',
    });
  }

  // System Config
  async getSystemConfig(category?: string) {
    return this.request(`/config/system${category ? `?category=${category}` : ''}`);
  }

  async updateSystemConfig(configKey: string, configValue: any, configType: string, category: string, description?: string) {
    const params = new URLSearchParams({
      config_key: configKey,
      config_value: String(configValue),
      config_type: configType,
      category: category,
    });
    if (description) params.append('description', description);
    return this.request(`/config/system?${params.toString()}`, {
      method: 'POST',
    });
  }

  // Payment Methods
  async getPaymentMethods(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/config/payment-methods${query ? `?${query}` : ''}`);
  }

  async createPaymentMethod(data: any) {
    return this.request('/config/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(methodId: string, data: any) {
    return this.request(`/config/payment-methods/${methodId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Bonus Rules
  async getBonusRules(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/config/bonus-rules${query ? `?${query}` : ''}`);
  }

  async createBonusRule(data: any) {
    return this.request('/config/bonus-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Banners
  async getBanners(position?: string) {
    return this.request(`/config/banners${position ? `?position=${position}` : ''}`);
  }

  async createBanner(data: any) {
    return this.request('/config/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Limits
  async getLimits(limitType?: string) {
    return this.request(`/config/limits${limitType ? `?limit_type=${limitType}` : ''}`);
  }

  async createLimit(data: any) {
    return this.request('/config/limits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============= USER DASHBOARD APIs =============

  // User Stats (for dashboard overview)
  async getUserStats() {
    return this.request('/users/me/stats');
  }

  // User Bonuses
  async getUserBonuses() {
    return this.request('/bonuses/my');
  }

  // User Referrals
  async getUserReferrals() {
    return this.request('/referrals/my');
  }

  // Favorites
  async getFavorites() {
    return this.request('/favorites');
  }

  async addFavorite(gameId: string | number) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId }),
    });
  }

  async addFavoriteBySlug(gameSlug: string) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ game_slug: gameSlug }),
    });
  }

  async removeFavorite(gameId: string | number) {
    return this.request(`/favorites/${gameId}`, {
      method: 'DELETE',
    });
  }

  // ============= USER SETTINGS =============

  async getUserSettings() {
    return this.request('/users/me/settings');
  }

  async updateUserSettings(data: any) {
    return this.request('/users/me/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============= USER PASSWORD CHANGE =============

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/users/me/password/', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // ============= PROMO CODES =============

  async getActivePromoCodes() {
    return this.request('/promo-codes/');
  }

  async redeemPromoCode(code: string) {
    return this.request('/bonuses/redeem-promo/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // ============= BONUS CLAIM =============

  async claimBonus(bonusId: number) {
    return this.request(`/bonuses/${bonusId}/claim/`, {
      method: 'POST',
    });
  }

  // ============= EXPORT APIs =============

  async exportTransactions() {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/api/coins/transactions/export/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  async exportBets() {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/api/bets/export/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  // ============= PUBLIC APIs (No Auth Required) =============

  async getTestimonials() {
    return this.request('/public/testimonials');
  }

  async getLiveWins() {
    return this.request('/public/live-wins');
  }

  async getPlatformStats() {
    return this.request('/public/stats');
  }

  // ============= REFERRAL TIERS =============

  async getReferralTiers() {
    return this.request('/config/referral-tiers');
  }

  // =============================================================================
  // POWERHOUSE APIs (Platform Owner - Root Level)
  // =============================================================================

  async getPowerHouseStats() {
    return this.request('/powerhouse/stats');
  }

  async getPowerHouseSuperAdmins() {
    return this.request('/powerhouse/superadmins');
  }

  async createSuperAdmin(data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    transfer_limit?: number;
  }) {
    return this.request('/powerhouse/superadmins/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async powerHouseMint(toUserId: string, amount: number, description?: string) {
    return this.request('/powerhouse/mint', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, amount, description }),
    });
  }

  async emergencySuspend(suspend: boolean) {
    return this.request('/powerhouse/emergency-suspend', {
      method: 'POST',
      body: JSON.stringify({ suspend }),
    });
  }

  async getAuditLogs(params?: {
    action?: string;
    entity_type?: string;
    user_id?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/powerhouse/audit-logs${query ? `?${query}` : ''}`);
  }

  async getGlobalWallets(params?: { role?: string; min_balance?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/powerhouse/global-wallets${query ? `?${query}` : ''}`);
  }

  async powerHouseSuspendUser(userId: string, suspend: boolean) {
    return this.request(`/powerhouse/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ suspend }),
    });
  }

  // =============================================================================
  // SUPERADMIN APIs (Platform Management)
  // =============================================================================

  async getSuperAdminStats() {
    return this.request('/superadmin/stats');
  }

  async getSuperAdminMasters() {
    return this.request('/superadmin/masters');
  }

  async createMaster(data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    transfer_limit?: number;
  }) {
    return this.request('/superadmin/masters/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setMasterLimits(masterId: string, transferLimit: number | null) {
    return this.request(`/superadmin/masters/${masterId}/limits`, {
      method: 'PATCH',
      body: JSON.stringify({ transfer_limit: transferLimit }),
    });
  }

  async suspendMaster(masterId: string, suspend: boolean) {
    return this.request(`/superadmin/masters/${masterId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ suspend }),
    });
  }

  async superAdminTransfer(toUserId: string, amount: number, description?: string) {
    return this.request('/superadmin/transfer', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, amount, description }),
    });
  }

  async getSuperAdminReports(params?: {
    type?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/superadmin/reports${query ? `?${query}` : ''}`);
  }

  // =============================================================================
  // MASTER APIs (Agent/Operator)
  // =============================================================================

  async getMasterStats() {
    return this.request('/master/stats');
  }

  async getMasterUsers(params?: { search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/master/users${query ? `?${query}` : ''}`);
  }

  async createUserAccount(data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    betting_limit?: number;
  }) {
    return this.request('/master/users/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async masterSuspendUser(userId: string, suspend: boolean) {
    return this.request(`/master/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ suspend }),
    });
  }

  async resetUserPassword(userId: string, newPassword: string) {
    return this.request(`/master/users/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ new_password: newPassword }),
    });
  }

  async setUserBettingLimit(userId: string, bettingLimit: number | null) {
    return this.request(`/master/users/${userId}/betting-limit`, {
      method: 'PATCH',
      body: JSON.stringify({ betting_limit: bettingLimit }),
    });
  }

  async depositForUser(userId: string, amount: number, description?: string) {
    return this.request(`/master/users/${userId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  }

  async withdrawForUser(userId: string, amount: number, description?: string) {
    return this.request(`/master/users/${userId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  }

  async getUserBetHistory(userId: string, params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/master/users/${userId}/bets${query ? `?${query}` : ''}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;

// CamelCase mappers for API responses (snake_case -> component props)
export interface GameApiRow {
  id: number;
  slug: string;
  name: string;
  image?: string;
  category_name?: string;
  category_slug?: string;
  provider_name?: string;
  players?: number;
  min_bet?: number;
  max_bet?: number;
  rating?: number;
  rtp?: number;
  is_hot?: boolean;
  is_new?: boolean;
  description?: string;
  how_to_play?: string[];
  features?: string[];
}

export function mapGame(row: GameApiRow) {
  return {
    id: row.slug,
    name: row.name,
    image: row.image || '',
    category: row.category_name || '',
    categorySlug: row.category_slug || '',
    players: row.players ?? 0,
    minBet: Number(row.min_bet ?? 0),
    maxBet: Number(row.max_bet ?? 0),
    rating: Number(row.rating ?? 0),
    isHot: row.is_hot ?? false,
    isNew: row.is_new ?? false,
    provider: row.provider_name || '',
    description: row.description,
    howToPlay: row.how_to_play,
    features: row.features,
    rtp: row.rtp != null ? Number(row.rtp) : undefined,
  };
}

export interface CategoryApiRow {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  href?: string;
  game_count?: number;
  color?: string;
  sort_order?: number;
}

export function mapCategory(row: CategoryApiRow) {
  return {
    id: row.slug,
    name: row.name,
    slug: row.slug,
    href: row.href || `/games/${row.slug}`,
    gameCount: row.game_count ?? 0,
    color: row.color || 'primary',
  };
}

export interface ProviderApiRow {
  id: number;
  name: string;
  logo?: string;
  color?: string;
  games_count?: number;
  sort_order?: number;
}

export function mapProvider(row: ProviderApiRow) {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo || row.name.slice(0, 2).toUpperCase(),
    games: row.games_count ?? 0,
    color: row.color || 'from-primary to-secondary',
  };
}

export interface BannerApiRow {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  sort_order?: number;
}

export function mapBanner(row: BannerApiRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    imageUrl: row.image_url || '',
    linkUrl: row.link_url || '#',
  };
}
