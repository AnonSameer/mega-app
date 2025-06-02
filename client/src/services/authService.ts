// client/src/services/authService.ts
import { apiClient } from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export class AuthService {
  private static readonly AUTH_PATH = '/auth';

  static async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.AUTH_PATH}/login`, request);
    return response.data;
  }

  static async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.AUTH_PATH}/register`, request);
    return response.data;
  }

  static async checkPinAvailability(pin: string): Promise<boolean> {
    const response = await apiClient.get<{ available: boolean }>(`${this.AUTH_PATH}/check-pin/${pin}`);
    return response.data.available;
  }

  // Local storage helpers
  static saveUser(user: { userId: number; displayName: string }): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  static getCurrentUser(): { userId: number; displayName: string } | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  static logout(): void {
    localStorage.removeItem('currentUser');
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}