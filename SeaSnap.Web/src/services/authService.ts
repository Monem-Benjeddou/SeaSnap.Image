import { BaseService } from './baseService';
import { CurrentUser, LoginResponse, InviteUserRequest, CompanyUser, UpdateUserRoleRequest } from '../types/auth';


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
    await this.getCurrentUser();
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
      this.clearTokens(); 
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

  public async inviteUser(request: InviteUserRequest): Promise<void> {
    await this.post('/api/Company/users/invite', request);
  }

  public async getCompanyUsers(): Promise<CompanyUser[]> {
    const response = await this.get<CompanyUser[]>('/api/Company/users');
    return response.data;
  }

  public async deleteUser(userId: string): Promise<void> {
    await this.delete(`/api/Company/users/${userId}`);
  }

  public async updateUserRole(request: UpdateUserRoleRequest): Promise<void> {
    await this.put('/api/Company/users/role', request);
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
