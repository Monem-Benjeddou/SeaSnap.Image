import { AxiosRequestConfig } from 'axios';
import { BaseService } from './baseService';
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user?: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CurrentUser {
  id: string;
  userName: string;
  email: string;
  roles: string[];
}

export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class AuthService extends BaseService {
  private static instance: AuthService;
  private currentUser: CurrentUser | null = null;

  constructor() {
    super('https://localhost:7136', '/refresh');
    if (this.getAccessToken()) {
      this.getCurrentUser().catch(console.error);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/login', { email, password });
    const { accessToken, refreshToken } = response.data;
    this.setTokens(accessToken, refreshToken);
    return response.data;
  }

  public async register(email: string, password: string): Promise<void> {
    await this.post('/register', { email, password });
  }

  public async getCurrentUser(): Promise<CurrentUser> {
    try {
      const response = await this.get<CurrentUser>('/api/auth/me');
      this.currentUser = response.data;
      return this.currentUser;
    } catch (error) {
      this.currentUser = null;
      throw error;
    }
  }

  public async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await this.post('/logout', { refreshToken });
      } catch (error) {
        console.error('Error during logout API call:', error);
      }
    }
    this.clearTokens();
    this.currentUser = null;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const authService = AuthService.getInstance();
