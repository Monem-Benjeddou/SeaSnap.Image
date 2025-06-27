import { BaseService } from './baseService';
import {DashboardStats} from '../types'


export class DashboardService extends BaseService {
  private static instance: DashboardService;

  constructor() {
    super('https://localhost:7136/api/dashboard', ''); 
  }

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Fetches dashboard statistics and recent uploads for the current company.
   * @returns A promise that resolves to DashboardStatsDto.
   */
  public async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.get<DashboardStats>('/stats');
    return response.data;
  }
}

export const dashboardService = DashboardService.getInstance();

