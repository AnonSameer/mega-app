// client/src/services/authService.ts
import { apiClient } from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export class AuthService {
  private static readonly AUTH_PATH = '/auth';

  static async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.AUTH_PATH}/login`, request);
    
    // Save user info to localStorage for UI purposes (display name, etc.)
    // The actual authentication is handled by the session cookie
    this.saveUser({
      userId: response.data.userId,
      displayName: response.data.displayName
    });
    
    return response.data;
  }

  static async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.AUTH_PATH}/register`, request);
    return response.data;
  }

  static async logout(): Promise<void> {
    try {
      // Call the backend logout endpoint to clear the session
      await apiClient.post(`${this.AUTH_PATH}/logout`);
    } catch (error) {
      // Even if the backend call fails, we should clear local state
      console.warn('Backend logout failed, clearing local state anyway');
    } finally {
      // Always clear local storage
      this.clearLocalAuth();
    }
  }

  static async getCurrentUser(): Promise<{ userId: number } | null> {
    try {
      // Check with the backend if the session is still valid
      const response = await apiClient.get(`${this.AUTH_PATH}/me`);
      return response.data;
    } catch (error) {
      // Session is invalid, clear local storage
      this.clearLocalAuth();
      return null;
    }
  }

  static async checkPinAvailability(pin: string): Promise<boolean> {
    const response = await apiClient.get<{ available: boolean }>(`${this.AUTH_PATH}/check-pin/${pin}`);
    return response.data.available;
  }

  // Local storage helpers for UI state only
  static saveUser(user: { userId: number; displayName: string }): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  static getLocalUser(): { userId: number; displayName: string } | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  static clearLocalAuth(): void {
    localStorage.removeItem('currentUser');
  }

  static isLocallyAuthenticated(): boolean {
    return this.getLocalUser() !== null;
  }

  // Verify authentication with backend
  static async verifyAuthentication(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}