export interface MegaLink {
  id: number;
  title: string;
  url: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMegaLinkRequest {
  title: string;
  url: string;
  description: string;
  tags: string[];
}

export interface UpdateMegaLinkRequest extends CreateMegaLinkRequest {}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: string;
}

// Filtering and search types
export interface LinkFilters {
  tags?: string[];
  searchTerm?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface LoginRequest {
  pin: string;
}

export interface RegisterRequest {
  pin: string;
  displayName?: string;
}

export interface AuthResponse {
  userId: number;
  displayName: string;
  message: string;
}