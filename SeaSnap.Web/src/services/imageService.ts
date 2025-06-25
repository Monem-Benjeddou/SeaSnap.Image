import { AxiosRequestConfig, CancelToken , AxiosProgressEvent} from 'axios';
import { BaseService } from './baseService';
import { ImageItem, ImageListResponse, PresignedUrlResponse, UploadRequest } from '../types/ImageItem';
import {PaginatedResponse} from "../types/index"
export class ImageService extends BaseService {
  constructor() {
    super('https://localhost:7136/api/image');
  }

  async uploadImage(
    file: File,
    description?: string,
    tags?: string,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void, // Use AxiosProgressEvent here
    cancelToken?: CancelToken
  ): Promise<{ url: string }> {
    const formData = new FormData();
    if (!(file instanceof File)) {
      throw new Error('Invalid file');
    }
    formData.append('FileFormFile', file);
  
    const queryParams = new URLSearchParams();
    if (description) queryParams.append('description', description);
    if (tags) queryParams.append('tags', tags);
  
    const urlWithParams = "upload" + `?${queryParams.toString()}`;
  
    const config: AxiosRequestConfig = {
      cancelToken,
      onUploadProgress
    };
  
    const response = await this.postImage<{ url: string }>(urlWithParams, formData, config);
    return response.data;
  }
  
  async bulkUpload(
    files: File[],
    description?: string,
    tags?: string,
    cancelToken?: CancelToken
  ): Promise<ImageItem[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (description) formData.append('description', description);
    if (tags) formData.append('tags', tags);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      cancelToken,
    };

    const response = await this.post<ImageItem[]>('/bulk', formData, config);
    return response.data;
  }

  async getAll(
    page: number = 1,
    pageSize: number = 20,
    search?: string
  ): Promise<PaginatedResponse<ImageItem>> {
    const config: AxiosRequestConfig = {
      params: {
        page,
        pageSize,
        ...(search ? { search } : {}),
      },
    };
  
    const response = await this.get<PaginatedResponse<ImageItem>>('/all', config);
    return response.data;
  }

  async getImage(filename: string): Promise<ImageItem> {
    const response = await this.get<ImageItem>(`/${filename}`);
    return response.data;
  }

  async deleteImage(filename: string): Promise<void> {
    await this.delete(`/${filename}`);
  }

  async getPresignedUrl(
    filename: string,
    minutes: number = 60
  ): Promise<PresignedUrlResponse> {
    const config: AxiosRequestConfig = {
      params: { minutes },
    };

    const response = await this.get<PresignedUrlResponse>(
      `/presigned/${filename}`,
      config
    );
    return response.data;
  }

  async listAll(): Promise<ImageItem[]> {
    const response = await this.get<ImageItem[]>('/all');
    return response.data;
  }

  async updateImage(
    filename: string,
    updates: {
      description?: string;
      tags?: string[];
    }
  ): Promise<ImageItem> {
    const response = await this.patch<ImageItem>(`/${filename}`, updates);
    return response.data;
  }
}

// Create a singleton instance
export const imageService = new ImageService();