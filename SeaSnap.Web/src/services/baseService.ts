import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface TokenRefreshResponse {
  accessToken: string;
}

type RefreshTokenCallback = (token: string) => void;

export class BaseService {
  protected readonly instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: RefreshTokenCallback[] = [];
  private refreshTokenEndpoint: string;

  constructor(baseURL: string, refreshTokenEndpoint: string = '/refresh') {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    });
    this.refreshTokenEndpoint = refreshTokenEndpoint;
    this.setupInterceptors();
  }

  protected getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  protected getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }
  protected async postImage<T>(
    url: string,
    formData: FormData,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    var axiosInstance = this.instance;
    const headers = {
      ...config.headers,
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data'
    };
    
    return axiosInstance.post<T>(url, formData, {
      ...config,
      headers,
    });
  }
  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  private addRefreshSubscriber(callback: RefreshTokenCallback): void {
    this.refreshSubscribers.push(callback);
  }

  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  protected async refreshToken(): Promise<TokenRefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.instance.post<TokenRefreshResponse>(
      this.refreshTokenEndpoint,
      { refreshToken }
    );
    return response.data;
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise<AxiosResponse>((resolve) => {
              this.addRefreshSubscriber((token: string) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(this.instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await this.refreshToken();
            const { accessToken } = response;
            localStorage.setItem('accessToken', accessToken);
            
            this.onRefreshed(accessToken);
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            
            return this.instance(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }
}