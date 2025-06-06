// src/types/index.ts - Add these to your existing types

export interface MegaLink {
  id: number;
  title: string;
  url: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: number;
  
  // New MEGA analysis fields
  fileCount?: number;
  videoCount?: number;
  imageCount?: number;
  totalSizeBytes?: number;
  formattedSize?: string;
  isActive: boolean;
  lastAnalyzedAt?: string;
  analysisError?: string;
  linkType?: string;
  megaName?: string;
}

export interface MegaAnalysisStatus {
  totalLinks: number;
  analyzedLinks: number;
  activeLinks: number;
  totalVideos: number;
  totalImages: number;
  totalFiles: number;
  totalSizeBytes: number;
}

// Keep your existing types as well
export interface CreateMegaLinkRequest {
  title: string;
  url: string;
  description?: string;
  tags?: string[];
}

export interface LinkFilters {
  tags?: string[];
  searchTerm?: string;
  isActive?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface UpdateMegaLinkRequest {
  title: string;
  url: string;
  description?: string;
  tags?: string[];
}

export interface ApiError {
  message: string;
  statusCode: number;
}