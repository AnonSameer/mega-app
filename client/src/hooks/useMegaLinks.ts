// src/hooks/useMegaLinks.ts
import { useState, useEffect, useCallback } from 'react';
import { MegaLink, CreateMegaLinkRequest, LinkFilters, ApiError, MegaAnalysisStatus } from '@/types';
import { MegaLinkService } from '@/services/megaLinkService';

interface UseMegaLinksState {
  links: MegaLink[];
  loading: boolean;
  error: ApiError | null;
  selectedTags: string[];
  searchTerm: string;
  analysisStatus: MegaAnalysisStatus | null;
  refreshingAll: boolean;
}

interface UseMegaLinksActions {
  fetchLinks: () => Promise<void>;
  createLink: (linkData: CreateMegaLinkRequest) => Promise<MegaLink>;
  updateLink: (id: number, linkData: CreateMegaLinkRequest) => Promise<MegaLink>;
  deleteLink: (id: number) => Promise<void>;
  refreshLink: (id: number) => Promise<void>;
  refreshAllLinks: () => Promise<void>;
  filterByTags: (tags: string[]) => void;
  searchLinks: (term: string) => void;
  clearFilters: () => void;
  fetchAnalysisStatus: () => Promise<void>;
}

export const useMegaLinks = (): UseMegaLinksState & UseMegaLinksActions => {
  const [state, setState] = useState<UseMegaLinksState>({
    links: [],
    loading: false,
    error: null,
    selectedTags: [],
    searchTerm: '',
    analysisStatus: null,
    refreshingAll: false,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: ApiError | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setRefreshingAll = (refreshingAll: boolean) => {
    setState(prev => ({ ...prev, refreshingAll }));
  };

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: LinkFilters = {};
      if (state.selectedTags.length > 0) {
        filters.tags = state.selectedTags;
      }
      if (state.searchTerm) {
        filters.searchTerm = state.searchTerm;
      }

      const data = await MegaLinkService.getAllLinks(filters);
      setState(prev => ({ ...prev, links: data }));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      
      if (apiError.statusCode === 401) {
        setState(prev => ({ ...prev, links: [] }));
      }
    } finally {
      setLoading(false);
    }
  }, [state.selectedTags, state.searchTerm]);

  const fetchAnalysisStatus = async () => {
    try {
      const status = await MegaLinkService.getAnalysisStatus();
      setState(prev => ({ ...prev, analysisStatus: status }));
    } catch (err) {
      // Don't show error for missing analysis endpoints during development
      const apiError = err as ApiError;
      if (apiError.statusCode !== 404) {
        console.warn('Failed to fetch analysis status:', err);
      }
      // Set default empty status if endpoint doesn't exist yet
      setState(prev => ({ 
        ...prev, 
        analysisStatus: {
          totalLinks: prev.links.length,
          analyzedLinks: 0,
          activeLinks: 0,
          totalVideos: 0,
          totalImages: 0,
          totalFiles: 0,
          totalSizeBytes: 0
        }
      }));
    }
  };

  const createLink = async (linkData: CreateMegaLinkRequest): Promise<MegaLink> => {
    try {
      setLoading(true);
      setError(null);
      const newLink = await MegaLinkService.createLink(linkData);
      setState(prev => ({ ...prev, links: [newLink, ...prev.links] }));
      
      // Refresh analysis status after creating a link
      await fetchAnalysisStatus();
      
      return newLink;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLink = async (id: number, linkData: CreateMegaLinkRequest): Promise<MegaLink> => {
    try {
      setLoading(true);
      setError(null);
      const updatedLink = await MegaLinkService.updateLink(id, linkData);
      setState(prev => ({
        ...prev,
        links: prev.links.map(link => link.id === id ? updatedLink : link)
      }));
      
      await fetchAnalysisStatus();
      
      return updatedLink;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await MegaLinkService.deleteLink(id);
      setState(prev => ({
        ...prev,
        links: prev.links.filter(link => link.id !== id)
      }));
      
      await fetchAnalysisStatus();
      
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshLink = async (id: number): Promise<void> => {
    try {
      setError(null);
      const updatedLink = await MegaLinkService.refreshLink(id);
      setState(prev => ({
        ...prev,
        links: prev.links.map(link => link.id === id ? updatedLink : link)
      }));
      
      await fetchAnalysisStatus();
      
    } catch (err) {
      const apiError = err as ApiError;
      
      // If the endpoint doesn't exist yet (404), show a helpful message
      if (apiError.statusCode === 404) {
        setError({ message: "Refresh feature not yet available - please complete database migration first", statusCode: 404 });
        return;
      }
      
      setError(apiError);
      
      // Update the link to show it failed
      setState(prev => ({
        ...prev,
        links: prev.links.map(link => 
          link.id === id 
            ? { ...link, isActive: false, analysisError: apiError.message, lastAnalyzedAt: new Date().toISOString() }
            : link
        )
      }));
      
      throw err;
    }
  };

  const refreshAllLinks = async (): Promise<void> => {
    try {
      setRefreshingAll(true);
      setError(null);
      
      console.log('Starting synchronous refresh of all links...');
      const result = await MegaLinkService.refreshAllLinks();
      console.log('Refresh all completed:', result);
      
      // Refresh the UI data since all links were processed synchronously
      await fetchLinks();
      await fetchAnalysisStatus();
      
      console.log(`✅ Completed refresh for ${result.linkCount} links`);
      
    } catch (err) {
      console.error('Refresh all failed:', err);
      const apiError = err as ApiError;
      
      if (apiError.statusCode === 404) {
        setError({ message: "Refresh all feature not yet available - please complete database migration first", statusCode: 404 });
      } else {
        setError(apiError);
      }
      
      throw err;
    } finally {
      setRefreshingAll(false);
    }
  };

  const filterByTags = (tags: string[]) => {
    setState(prev => ({ ...prev, selectedTags: tags }));
  };

  const searchLinks = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  };

  const clearFilters = () => {
    setState(prev => ({ ...prev, selectedTags: [], searchTerm: '' }));
  };

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    fetchAnalysisStatus();
  }, []);

  return {
    ...state,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    refreshLink,
    refreshAllLinks,
    filterByTags,
    searchLinks,
    clearFilters,
    fetchAnalysisStatus,
  };
};