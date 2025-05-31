// src/hooks/useMegaLinks.ts
import { useState, useEffect, useCallback } from 'react';
import { MegaLink, CreateMegaLinkRequest, LinkFilters, ApiError } from '@/types';
import { MegaLinkService } from '@/services/megaLinkService';

interface UseMegaLinksState {
  links: MegaLink[];
  loading: boolean;
  error: ApiError | null;
  selectedTags: string[];
  searchTerm: string;
}

interface UseMegaLinksActions {
  fetchLinks: () => Promise<void>;
  createLink: (linkData: CreateMegaLinkRequest) => Promise<MegaLink>;
  updateLink: (id: number, linkData: CreateMegaLinkRequest) => Promise<MegaLink>;
  deleteLink: (id: number) => Promise<void>;
  filterByTags: (tags: string[]) => void;
  searchLinks: (term: string) => void;
  clearFilters: () => void;
}

export const useMegaLinks = (): UseMegaLinksState & UseMegaLinksActions => {
  const [state, setState] = useState<UseMegaLinksState>({
    links: [],
    loading: false,
    error: null,
    selectedTags: [],
    searchTerm: '',
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: ApiError | null) => {
    setState(prev => ({ ...prev, error }));
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
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [state.selectedTags, state.searchTerm]);

  const createLink = async (linkData: CreateMegaLinkRequest): Promise<MegaLink> => {
    try {
      setLoading(true);
      setError(null);
      const newLink = await MegaLinkService.createLink(linkData);
      setState(prev => ({ ...prev, links: [...prev.links, newLink] }));
      return newLink;
    } catch (err) {
      setError(err as ApiError);
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
      return updatedLink;
    } catch (err) {
      setError(err as ApiError);
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
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
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

  return {
    ...state,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    filterByTags,
    searchLinks,
    clearFilters,
  };
};