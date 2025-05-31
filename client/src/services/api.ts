// src/services/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiError } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp for cache busting in development
    if (process.env.REACT_APP_ENV === 'development') {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    // Add auth token when implemented
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      details: error.message,
    };

    if (error.response?.data) {
      const errorData = error.response.data as any;
      apiError.message = errorData.message || errorData.title || apiError.message;
    }

    // Global error handling
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login when implemented
      console.warn('Unauthorized access detected');
    }

    if (error.response!?.status >= 500) {
      // Log server errors
      console.error('Server error:', apiError);
    }

    return Promise.reject(apiError);
  }
);