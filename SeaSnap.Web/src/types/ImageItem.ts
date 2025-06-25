export interface ImageItem {
  id: string;
  filename: string;
  description?: string;
  tags?: string[];
  url: string;
  thumbnailUrl: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
}
  export interface ImageItem {
      id: string;
      filename: string;
      description?: string;
      tags?: string[];
      url: string;
      thumbnailUrl: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
      uploadedBy: {
        id: string;
        email: string;
        userName: string;
        role: string;
        createdAt: string;
      };
    }

export interface ImageListResponse {
    items: ImageItem[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
  }
  export interface PresignedUrlResponse {
    url: string;
    expiresAt: string;
  }
  export interface UploadRequest {
    fileName?: string;
    fileDescription?: string;
    file: File | null;
    description: string;
    tags: string;
  }