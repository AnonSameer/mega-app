export interface MegaLinkInfo {
  name: string;
  size: number;
  type: 'file' | 'folder' | 'unknown';
  fileCount: number;
  videoCount: number;
  imageCount: number;
  formattedSize: string;
}

export interface MegaUrlParts {
  rootFolder: string;
  key: string;
  subfolder?: string;
}

export interface MegaFileUrlParts {
  fileId: string;
  key: string;
}

export interface MegaNode {
  h: string;           // Node handle/ID
  t: number;           // Type (0 = file, 1 = folder)
  s?: number;          // Size in bytes
  a: string;           // Encrypted attributes
  k: string;           // Encrypted key
  p?: string;          // Parent node ID
}

export interface MegaApiResponse {
  f: MegaNode[];       // Files/folders array
}

export interface MegaLinkAnalyzerProps {
  url: string;
  onInfoLoaded?: (info: MegaLinkInfo) => void;
}