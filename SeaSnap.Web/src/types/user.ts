export type UserRole = 'admin' | 'moderator' | 'user';

export interface User {
  id: string;
  userName: string;
  email: string;
  roles: UserRole[];
  createdAt: string;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 