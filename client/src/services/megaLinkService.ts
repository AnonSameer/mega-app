// src/services/megaLinkService.ts
import { apiClient } from './api';
import { 
  MegaLink, 
  CreateMegaLinkRequest, 
  UpdateMegaLinkRequest,
  LinkFilters,
  PaginationParams,
  MegaAnalysisStatus, // Add this new type
} from '@/types';

export class MegaLinkService {
  private static readonly BASE_PATH = '/megalinks';

  static async getAllLinks(
    filters?: LinkFilters,
    pagination?: PaginationParams
  ): Promise<MegaLink[]> {
    const params = new URLSearchParams();
    
    if (filters?.searchTerm) {
      params.append('search', filters.searchTerm);
    }
    
    if (filters?.tags?.length) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    // Add new filter for active status
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
    }

    const response = await apiClient.get<MegaLink[]>(
      `${this.BASE_PATH}${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data;
  }

  static async getLinkById(id: number): Promise<MegaLink> {
    const response = await apiClient.get<MegaLink>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async createLink(link: CreateMegaLinkRequest): Promise<MegaLink> {
    const response = await apiClient.post<MegaLink>(this.BASE_PATH, link);
    return response.data;
  }

  static async updateLink(id: number, link: UpdateMegaLinkRequest | CreateMegaLinkRequest): Promise<MegaLink> {
    const response = await apiClient.put<MegaLink>(`${this.BASE_PATH}/${id}`, link);
    return response.data;
  }

  static async deleteLink(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  static async getLinksByTag(tag: string): Promise<MegaLink[]> {
    const response = await apiClient.get<MegaLink[]>(`${this.BASE_PATH}/bytag/${tag}`);
    return response.data;
  }

  // === NEW MEGA ANALYSIS METHODS ===

  /**
   * Refresh analysis for a specific MEGA link
   */
  static async refreshLink(id: number): Promise<MegaLink> {
    const response = await apiClient.post<MegaLink>(`${this.BASE_PATH}/${id}/refresh`);
    return response.data;
  }

  /**
   * Refresh analysis for all user's MEGA links
   */
  static async refreshAllLinks(): Promise<{ message: string; linkCount: number }> {
    const response = await apiClient.post<{ message: string; linkCount: number }>(`${this.BASE_PATH}/refresh-all`);
    return response.data;
  }

  /**
   * Get analysis status/statistics for user's links
   */
  static async getAnalysisStatus(): Promise<MegaAnalysisStatus> {
    const response = await apiClient.get<MegaAnalysisStatus>(`${this.BASE_PATH}/analysis-status`);
    return response.data;
  }
}