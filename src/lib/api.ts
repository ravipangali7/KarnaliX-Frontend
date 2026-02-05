/**
 * API Client for KarnaliX
 * Handles all backend API communication with role-based endpoints
 */

const API_BASE_URL = 'http://127.0.0.1:8000';
// const API_BASE_URL = 'https://admin.kingxclub.com';

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

  /**
   * Parse API error response into a user-friendly message
   * Handles Django REST Framework validation error formats
   */
  private parseApiError(errorData: any, status: number): string {
    // Handle detail/error message format
    if (errorData.detail) return errorData.detail;
    if (errorData.error) return errorData.error;
    
    // Handle field-level validation errors from DRF
    // Format: { "field_name": ["error1", "error2"], "field2": ["error"] }
    const fieldErrors: string[] = [];
    for (const [field, errors] of Object.entries(errorData)) {
      if (Array.isArray(errors)) {
        // Format field name: snake_case to Title Case
        const fieldName = field === 'non_field_errors' 
          ? '' 
          : `${field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: `;
        fieldErrors.push(`${fieldName}${(errors as string[]).join(', ')}`);
      } else if (typeof errors === 'string') {
        const fieldName = field === 'non_field_errors' 
          ? '' 
          : `${field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: `;
        fieldErrors.push(`${fieldName}${errors}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('\n');
    }
    
    return `Request failed (HTTP ${status})`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(this.parseApiError(errorData, response.status));
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  /** Send OTP to phone (for signup). No auth required. */
  async sendOtp(phone: string) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.trim() }),
    });
  }

  /** Verify OTP for phone. No auth required. */
  async verifyOtp(phone: string, otp: string) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
    });
  }

  async register(userData: any) {
    const phoneFirst = userData.phone && !userData.email;
    const payload: Record<string, string> = {
      username: userData.username,
      password: userData.password,
      referral_code: userData.referral_code || userData.referralCode || '',
    };
    if (phoneFirst) {
      payload.phone = userData.phone.trim();
      payload.email = '';
    } else {
      payload.email = userData.email ?? '';
      payload.phone = userData.phone || '';
    }
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async logout() {
    const refresh = localStorage.getItem('refresh_token');
    await this.request('/auth/logout', { 
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
    this.setToken(null);
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }

  // =============================================================================
  // POWERHOUSE ENDPOINTS
  // =============================================================================
  
  // Dashboard
  async getPowerhouseDashboard() {
    return this.request('/powerhouse/dashboard');
  }

  // Super Management
  async getPowerhouseSupers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/supers/${query}`);
  }

  async createPowerhouseSuper(data: any) {
    return this.request('/powerhouse/supers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPowerhouseSuperDetail(userId: string) {
    return this.request(`/powerhouse/supers/${userId}/`);
  }

  async updatePowerhouseSuper(userId: string, data: any) {
    return this.request(`/powerhouse/supers/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async suspendPowerhouseSuper(userId: string) {
    return this.request(`/powerhouse/supers/${userId}/suspend/`, { method: 'POST' });
  }

  async activatePowerhouseSuper(userId: string) {
    return this.request(`/powerhouse/supers/${userId}/activate/`, { method: 'POST' });
  }

  // Master Management (Powerhouse)
  async getPowerhouseMasters(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/masters/${query}`);
  }

  async createPowerhouseMaster(data: any) {
    return this.request('/powerhouse/masters/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPowerhouseMasterDetail(userId: string) {
    return this.request(`/powerhouse/masters/${userId}/`);
  }

  async updatePowerhouseMaster(userId: string, data: any) {
    return this.request(`/powerhouse/masters/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async suspendPowerhouseMaster(userId: string) {
    return this.request(`/powerhouse/masters/${userId}/suspend/`, { method: 'POST' });
  }

  async activatePowerhouseMaster(userId: string) {
    return this.request(`/powerhouse/masters/${userId}/activate/`, { method: 'POST' });
  }

  // User Management (Powerhouse)
  async getPowerhouseUsers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/users/${query}`);
  }

  async createPowerhouseUser(data: any) {
    return this.request('/powerhouse/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPowerhouseUserDetail(userId: string) {
    return this.request(`/powerhouse/users/${userId}/`);
  }

  async suspendPowerhouseUser(userId: string) {
    return this.request(`/powerhouse/users/${userId}/suspend/`, { method: 'POST' });
  }

  async activatePowerhouseUser(userId: string) {
    return this.request(`/powerhouse/users/${userId}/activate/`, { method: 'POST' });
  }

  async adjustUserBalance(userId: string, amount: number, type: string, remarks?: string) {
    return this.request(`/powerhouse/users/${userId}/adjust-balance/`, {
      method: 'POST',
      body: JSON.stringify({ amount, type, remarks }),
    });
  }

  // Statements (Powerhouse)
  async getPowerhouseAccountStatement(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/statements/account/${query}`);
  }

  async getPowerhouseBonusStatement(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/statements/bonus/${query}`);
  }

  async grantBonus(userId: string, bonusType: string, amount: number, rolloverRequirement?: number) {
    return this.request('/powerhouse/statements/grant-bonus/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, bonus_type: bonusType, amount, rollover_requirement: rolloverRequirement }),
    });
  }

  async grantPowerhouseBonus(formData: { user_id: string; bonus_type: string; amount: number | string; rollover_requirement?: number }) {
    const amount = typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount;
    const rollover = formData.rollover_requirement ?? 0;
    return this.grantBonus(
      String(formData.user_id),
      formData.bonus_type,
      amount,
      rollover
    );
  }

  async adjustPowerhouseUserBalance(userId: string, data: { amount: number; type: string; remarks?: string }) {
    return this.adjustUserBalance(userId, data.amount, data.type, data.remarks);
  }

  // Client Requests (Powerhouse)
  async getPowerhouseDeposits(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/requests/deposit/${query}`);
  }

  async getPowerhouseWithdrawals(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/requests/withdraw/${query}`);
  }

  async getPowerhouseTotalDW(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/requests/total-dw/${query}`);
  }

  async getPowerhouseSuperMasterDW() {
    return this.request('/powerhouse/requests/super-master-dw/');
  }

  async approveRequest(requestId: string, remarks?: string, role: string = 'powerhouse') {
    return this.request(`/${role}/requests/${requestId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async rejectRequest(requestId: string, remarks: string, role: string = 'powerhouse') {
    return this.request(`/${role}/requests/${requestId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  // Game Provider (Powerhouse)
  async getPowerhouseProviders(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/providers/${query}`);
  }

  async createPowerhouseProvider(data: any) {
    return this.request('/powerhouse/providers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePowerhouseProvider(providerId: string, data: any) {
    return this.request(`/powerhouse/providers/${providerId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async togglePowerhouseProvider(providerId: string) {
    return this.request(`/powerhouse/providers/${providerId}/toggle/`, { method: 'POST' });
  }

  // Game Management (Powerhouse)
  async getPowerhouseGames(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/games/${query}`);
  }

  async createPowerhouseGame(data: any) {
    return this.request('/powerhouse/games/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePowerhouseGame(gameId: string, data: any) {
    return this.request(`/powerhouse/games/${gameId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleGameStatus(gameId: string) {
    return this.request(`/powerhouse/games/${gameId}/toggle/`, { method: 'POST' });
  }

  // KYC (Powerhouse)
  async getPowerhouseKYC(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/kyc/${query}`);
  }

  async approveKYC(kycId: string, role: string = 'powerhouse') {
    return this.request(`/${role}/kyc/${kycId}/approve/`, { method: 'POST' });
  }

  async rejectKYC(kycId: string, role: string = 'powerhouse', remarks?: string) {
    return this.request(`/${role}/kyc/${kycId}/reject/`, {
      method: 'POST',
      body: JSON.stringify(remarks != null ? { remarks } : {}),
    });
  }

  async approvePowerhouseKYC(kycId: string) {
    return this.approveKYC(kycId, 'powerhouse');
  }

  async rejectPowerhouseKYC(kycId: string, options?: { remarks?: string }) {
    return this.rejectKYC(kycId, 'powerhouse', options?.remarks);
  }

  // Support Tickets (Powerhouse)
  async getPowerhouseTickets(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/tickets/${query}`);
  }

  async getPowerhouseTicketDetail(ticketId: string) {
    return this.request(`/powerhouse/tickets/${ticketId}/`);
  }

  async getPowerhouseTicketDetails(ticketId: string) {
    return this.getPowerhouseTicketDetail(ticketId);
  }

  async replyPowerhouseTicket(ticketId: string, payload: { message: string }) {
    return this.replyToTicket(ticketId, payload.message, 'powerhouse');
  }

  async closePowerhouseTicket(ticketId: string) {
    return this.closeTicket(ticketId, 'powerhouse');
  }

  async assignPowerhouseTicket(ticketId: string, payload: { assigned_to: number | string }) {
    return this.request(`/powerhouse/tickets/${ticketId}/assign/`, {
      method: 'POST',
      body: JSON.stringify({ assigned_to: payload.assigned_to }),
    });
  }

  async replyToTicket(ticketId: string, message: string, role: string = 'powerhouse') {
    return this.request(`/${role}/tickets/${ticketId}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async closeTicket(ticketId: string, role: string = 'powerhouse') {
    return this.request(`/${role}/tickets/${ticketId}/close/`, { method: 'POST' });
  }

  // Super Settings (Powerhouse)
  async getPowerhouseSettings() {
    return this.request('/powerhouse/settings/');
  }

  async getPowerhouseSettingDetail(userId: string) {
    return this.request(`/powerhouse/settings/${userId}/`);
  }

  async updatePowerhouseSettings(userId: string, data: any) {
    return this.request(`/powerhouse/settings/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Site Content (Powerhouse)
  async getPowerhouseSiteContent() {
    return this.request('/powerhouse/content/');
  }

  async getPowerhouseSiteContentByKey(key: string) {
    return this.request(`/powerhouse/content/${encodeURIComponent(key)}/`);
  }

  async updatePowerhouseSiteContent(key: string, data: Record<string, unknown> | unknown[]) {
    return this.request(`/powerhouse/content/${encodeURIComponent(key)}/`, {
      method: 'PATCH',
      body: JSON.stringify({ data }),
    });
  }

  // Bonus Rules (Powerhouse)
  async getPowerhouseBonusRules() {
    return this.request('/powerhouse/bonus-rules/');
  }

  async createPowerhouseBonusRule(data: any) {
    return this.request('/powerhouse/bonus-rules/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPowerhouseBonusRule(ruleId: string) {
    return this.request(`/powerhouse/bonus-rules/${ruleId}/`);
  }

  async updatePowerhouseBonusRule(ruleId: string, data: any) {
    return this.request(`/powerhouse/bonus-rules/${ruleId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePowerhouseBonusRule(ruleId: string) {
    return this.request(`/powerhouse/bonus-rules/${ruleId}/`, { method: 'DELETE' });
  }

  async togglePowerhouseBonusRule(ruleId: string) {
    return this.request(`/powerhouse/bonus-rules/${ruleId}/toggle/`, { method: 'POST' });
  }

  // =============================================================================
  // SUPER ENDPOINTS
  // =============================================================================
  
  async getSuperDashboard() {
    return this.request('/super/dashboard');
  }

  async getSuperMasters(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/masters/${query}`);
  }

  async createSuperMaster(data: any) {
    return this.request('/super/masters/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSuperUsers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/users/${query}`);
  }

  async createSuperUser(data: any) {
    return this.request('/super/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSuperAccountStatement(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/statements/account/${query}`);
  }

  async getSuperBonusStatement(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/statements/bonus/${query}`);
  }

  async getSuperDeposits(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/requests/deposit/${query}`);
  }

  async getSuperWithdrawals(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/requests/withdraw/${query}`);
  }

  async getSuperTotalDW(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/requests/total-dw/${query}`);
  }

  async getSuperMasterDW() {
    return this.request('/super/requests/master-dw/');
  }

  async getSuperKYC(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/kyc/${query}`);
  }

  async getSuperTickets(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/tickets/${query}`);
  }

  async getSuperTicketDetail(ticketId: string) {
    return this.request(`/super/tickets/${ticketId}/`);
  }

  async getSuperTicketDetails(ticketId: string) {
    return this.getSuperTicketDetail(ticketId);
  }

  async replySuperTicket(ticketId: string, payload: { message: string }) {
    return this.replyToTicket(ticketId, payload.message, 'super');
  }

  async closeSuperTicket(ticketId: string) {
    return this.closeTicket(ticketId, 'super');
  }

  async approveSuperRequest(requestId: string, remarks?: string) {
    return this.approveRequest(requestId, remarks, 'super');
  }

  async rejectSuperRequest(requestId: string, remarks: string = '') {
    return this.rejectRequest(requestId, remarks, 'super');
  }

  async getSuperMasterDetail(userId: string) {
    return this.request(`/super/masters/${userId}/`);
  }

  async updateSuperMaster(userId: string, data: any) {
    return this.request(`/super/masters/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async suspendSuperMaster(userId: string) {
    return this.request(`/super/masters/${userId}/suspend/`, { method: 'POST' });
  }

  async activateSuperMaster(userId: string) {
    return this.request(`/super/masters/${userId}/activate/`, { method: 'POST' });
  }

  async getSuperUserDetail(userId: string) {
    return this.request(`/super/users/${userId}/`);
  }

  async suspendSuperUser(userId: string) {
    return this.request(`/super/users/${userId}/suspend/`, { method: 'POST' });
  }

  async activateSuperUser(userId: string) {
    return this.request(`/super/users/${userId}/activate/`, { method: 'POST' });
  }

  async approveSuperKYC(kycId: string) {
    return this.approveKYC(kycId, 'super');
  }

  async rejectSuperKYC(kycId: string, options?: { remarks?: string }) {
    return this.rejectKYC(kycId, 'super', options?.remarks);
  }

  // =============================================================================
  // MASTER ENDPOINTS
  // =============================================================================
  
  async getMasterDashboard() {
    return this.request('/master/dashboard');
  }

  async getMasterUsers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/users/${query}`);
  }

  async createMasterUser(data: any) {
    return this.request('/master/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMasterUserDetail(userId: string) {
    return this.request(`/master/users/${userId}/`);
  }

  async suspendMasterUser(userId: string) {
    return this.request(`/master/users/${userId}/suspend/`, { method: 'POST' });
  }

  async activateMasterUser(userId: string) {
    return this.request(`/master/users/${userId}/activate/`, { method: 'POST' });
  }

  async approveMasterRequest(requestId: string, remarks?: string) {
    return this.approveRequest(requestId, remarks, 'master');
  }

  async rejectMasterRequest(requestId: string, remarks: string = '') {
    return this.rejectRequest(requestId, remarks, 'master');
  }

  async getMasterAccountStatement(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/statements/account/${query}`);
  }

  async getMasterBonusStatement(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/statements/bonus/${query}`);
  }

  async getMasterDeposits(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/requests/deposit/${query}`);
  }

  async getMasterWithdrawals(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/requests/withdraw/${query}`);
  }

  async getMasterTotalDW(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/requests/total-dw/${query}`);
  }

  async getMasterProfitLossSports(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/profit-loss/sports/${query}`);
  }

  async getMasterProfitLossClient(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/profit-loss/client/${query}`);
  }

  async getMasterTopWinners(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/profit-loss/winners/${query}`);
  }

  async getMasterActivityLog(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/activity/${query}`);
  }

  async getMasterUserActivity(userId: string, params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/activity/${userId}/${query}`);
  }

  async getMasterProfile() {
    return this.request('/master/profile/');
  }

  async updateMasterProfile(data: any) {
    return this.request('/master/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changeMasterPassword(oldPassword: string, newPassword: string) {
    return this.request('/master/profile/change-password/', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }

  async getMasterPaymentModes(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/master/payment-modes/${query}`);
  }

  async createMasterPaymentMode(data: any) {
    return this.request('/master/payment-modes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMasterPaymentMode(paymentId: string, data: any) {
    return this.request(`/master/payment-modes/${paymentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleMasterPaymentMode(paymentId: string) {
    return this.request(`/master/payment-modes/${paymentId}/toggle/`, { method: 'POST' });
  }

  async getSuperPaymentModes(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/super/payment-modes/${query}`);
  }

  async createSuperPaymentMode(data: any) {
    return this.request('/super/payment-modes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSuperPaymentMode(paymentId: string, data: any) {
    return this.request(`/super/payment-modes/${paymentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleSuperPaymentMode(paymentId: string) {
    return this.request(`/super/payment-modes/${paymentId}/toggle/`, { method: 'POST' });
  }

  async getPowerhousePaymentModes(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/powerhouse/payment-modes/${query}`);
  }

  async createPowerhousePaymentMode(data: any) {
    return this.request('/powerhouse/payment-modes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePowerhousePaymentMode(paymentId: string, data: any) {
    return this.request(`/powerhouse/payment-modes/${paymentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async togglePowerhousePaymentMode(paymentId: string) {
    return this.request(`/powerhouse/payment-modes/${paymentId}/toggle/`, { method: 'POST' });
  }

  // =============================================================================
  // USER ENDPOINTS
  // =============================================================================
  
  async getUserDashboard() {
    return this.request('/user/dashboard');
  }

  async getUserAccountStatement(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/statements/account/${query}`);
  }

  async getUserBets(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/bets/${query}`);
  }

  async getUserBetDetail(betId: string) {
    return this.request(`/user/bets/${betId}/`);
  }

  async getUserProfitLoss(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/profit-loss/${query}`);
  }

  async changeUserPassword(
    oldPasswordOrObj: string | { old_password: string; new_password: string; confirm_password?: string },
    newPassword?: string,
    confirmPassword?: string
  ) {
    const body =
      typeof oldPasswordOrObj === 'object'
        ? {
            old_password: oldPasswordOrObj.old_password,
            new_password: oldPasswordOrObj.new_password,
            confirm_password: oldPasswordOrObj.confirm_password ?? oldPasswordOrObj.new_password,
          }
        : {
            old_password: oldPasswordOrObj,
            new_password: newPassword!,
            confirm_password: confirmPassword ?? newPassword!,
          };
    return this.request('/user/change-password/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getUserActivityLog(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/activity/${query}`);
  }

  async getUserResults(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/results/${query}`);
  }

  async getUserDeposits(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/deposit/${query}`);
  }

  async createUserDeposit(data: any) {
    return this.request('/user/deposit/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAvailablePaymentModes() {
    return this.request('/user/deposit/payment-modes/');
  }

  async getUserWithdrawals(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/withdraw/${query}`);
  }

  async createUserWithdrawal(data: any) {
    return this.request('/user/withdraw/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserPaymentModes() {
    return this.request('/user/withdraw/payment-modes/');
  }

  async getUserWithdrawPaymentModes() {
    return this.getUserPaymentModes();
  }

  async createUserPaymentMode(data: any) {
    return this.request('/user/withdraw/payment-modes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteUserPaymentMode(paymentId: string) {
    return this.request(`/user/withdraw/payment-modes/${paymentId}/`, { method: 'DELETE' });
  }

  async getUserTransactions(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/transactions/${query}`);
  }

  // =============================================================================
  // ADMIN ALIASES (Master Admin panel uses Powerhouse APIs)
  // =============================================================================
  async getAdminDashboardStats() {
    return this.getPowerhouseDashboard();
  }
  async getUsers(params?: Record<string, string>) {
    return this.getPowerhouseUsers(params);
  }
  async getGames(params?: Record<string, string>) {
    return this.getPowerhouseGames(params);
  }
  async getAllGames(params?: Record<string, string>) {
    return this.getPowerhouseGames(params);
  }
  async getGameProviders(params?: Record<string, string>) {
    return this.getPowerhouseProviders(params);
  }
  async getDeposits(params?: Record<string, string>) {
    return this.getPowerhouseDeposits(params);
  }
  async getWithdrawals(params?: Record<string, string>) {
    return this.getPowerhouseWithdrawals(params);
  }
  async getAllKYC(params?: Record<string, string>) {
    return this.getPowerhouseKYC(params);
  }
  async getTickets(params?: Record<string, string>) {
    return this.getPowerhouseTickets(params);
  }
  async getTransactions(params?: Record<string, string>) {
    return this.getPowerhouseAccountStatement(params);
  }
  async getAllBets(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await this.request(`/powerhouse/bets/${query}`);
    return res?.results ?? res ?? [];
  }
  async getBonusRules() {
    const res = await this.getPowerhouseBonusRules();
    return res?.results ?? res ?? [];
  }
  async mintCoins(userId: string, amount: number, description: string) {
    return this.adjustUserBalance(userId, amount, 'BONUS', description);
  }
  async suspendUser(userId: string) {
    return this.suspendPowerhouseUser(userId);
  }
  async approveDeposit(requestId: string) {
    return this.approveRequest(requestId, undefined, 'powerhouse');
  }

  // =============================================================================
  // PUBLIC (unauthenticated) - for website
  // =============================================================================
  async getPublicGames(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/public/games/${query}`);
  }

  async getPublicGameDetail(gameId: string) {
    return this.request(`/public/games/${gameId}/`);
  }

  async getPublicProviders(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/public/providers/${query}`);
  }

  async getPublicCategories() {
    return this.request('/public/categories/');
  }

  async getPublicContent() {
    return this.request('/public/content/');
  }

  // =============================================================================
  // USER PROFILE, REFERRAL, BONUSES, TICKETS, SETTINGS
  // =============================================================================
  async getUserProfile() {
    return this.request('/user/profile/');
  }

  async updateUserProfile(data: any) {
    return this.request('/user/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserReferral() {
    return this.request('/user/referral/');
  }

  async getUserBonuses(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/bonuses/${query}`);
  }

  async applyPromoCode(code: string) {
    return this.request('/user/bonuses/apply/', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
  }

  async claimBonus(bonusId: string) {
    return this.request(`/user/bonuses/${bonusId}/claim/`, { method: 'POST' });
  }

  async getUserTickets(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/user/tickets/${query}`);
  }

  async createUserTicket(data: { subject: string; category: string; priority?: string; message?: string }) {
    return this.request('/user/tickets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserTicketDetail(ticketId: string) {
    return this.request(`/user/tickets/${ticketId}/`);
  }

  async replyUserTicket(ticketId: string, message: string) {
    return this.request(`/user/tickets/${ticketId}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /** Live chat: list users the current user can chat with (parent for USER; parent + children for MASTER; etc.). */
  async getChatPartners() {
    return this.request('/user/chat/partners/');
  }

  /** Live chat: paginated history with another user. */
  async getChatHistory(otherUserId: number | string, params?: { page?: number; page_size?: number }) {
    const search = new URLSearchParams({ other_user_id: String(otherUserId) });
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.page_size != null) search.set('page_size', String(params.page_size));
    return this.request(`/user/chat/history/?${search.toString()}`);
  }

  /** Base URL for WebSocket (e.g. ws://127.0.0.1:8000). */
  getWsBaseUrl(): string {
    const base = this.baseURL.replace(/^http/, 'ws');
    return base;
  }

  async getUserSettings() {
    return this.request('/user/settings/');
  }

  async updateUserSettings(data: Record<string, unknown>) {
    return this.request('/user/settings/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Submit KYC documents (multipart/form-data).
   * FormData should include: document_type, document_number, document_front (File), document_back (File, optional).
   */
  async submitUserKyc(formData: FormData) {
    const url = `${this.baseURL}/api/user/kyc/`;
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(this.parseApiError(errorData, response.status));
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
