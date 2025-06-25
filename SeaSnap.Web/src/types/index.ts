export type UserRole = 'admin' | 'editor' | 'viewer';
export interface User {
  id: string;
  email: string;
  userName: string;
  roles: string[];
  avatar: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Image {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: User;
  tags?: string[];
  description?: string;
}

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}