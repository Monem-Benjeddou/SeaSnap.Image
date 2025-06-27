import { User } from '../types';

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
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

export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}


export interface CurrentUser {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  companyId: string;
}

export interface InviteUserRequest {
  email: string;
  fullName: string;
  role: string;
  password: string;
}

export interface UpdateUserRoleRequest {
  userId: string;
  newRole: string;
}

export interface CompanyUser {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  roles: string[];
  createdAt: string;
  companyId: string;
}