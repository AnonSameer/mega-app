// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/services/authService';
import { LoginRequest, RegisterRequest, ApiError } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: { userId: number; displayName: string } | null;
  loading: boolean;
  error: ApiError | null;
}

interface AuthActions {
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: ApiError | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const verifyAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have local user data
      const localUser = AuthService.getLocalUser();
      if (!localUser) {
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: false, 
          user: null,
          loading: false 
        }));
        return;
      }

      // Verify with backend that session is still valid
      const backendUser = await AuthService.getCurrentUser();
      if (backendUser) {
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: true, 
          user: localUser,
          loading: false 
        }));
      } else {
        // Session expired, clear local state
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: false, 
          user: null,
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false, 
        user: null,
        loading: false 
      }));
    }
  }, []);

  const login = async (request: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthService.login(request);
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: { userId: response.userId, displayName: response.displayName },
        loading: false
      }));
    } catch (error) {
      setError(error as ApiError);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const register = async (request: RegisterRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.register(request);
      setLoading(false);
    } catch (error) {
      setError(error as ApiError);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await AuthService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        loading: false
      }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Verify auth on mount and listen for auth events
  useEffect(() => {
    verifyAuth();

    // Listen for logout events from the API interceptor
    const handleLogout = () => {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null
      }));
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [verifyAuth]);

  return {
    ...state,
    login,
    register,
    logout,
    verifyAuth,
    clearError,
  };
};