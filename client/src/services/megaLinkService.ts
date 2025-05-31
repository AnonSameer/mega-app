// src/services/megaLinkService.ts
import { apiClient } from './api';
import { 
  MegaLink, 
  CreateMegaLinkRequest, 
  UpdateMegaLinkRequest,
  LinkFilters,
  PaginationParams,
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

  static async updateLink(id: number, link: UpdateMegaLinkRequest): Promise<MegaLink> {
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
}