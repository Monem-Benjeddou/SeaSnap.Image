import {ImageItem} from '../types/ImageItem';
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface DashboardStats {
  totalImages: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
  uploadsThisMonth: number;
  downloadsThisMonth: number;
  activeUsers: number;
  recentUploads: ImageItem[]; 
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