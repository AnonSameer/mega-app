import { MegaUrlParts, MegaFileUrlParts, MegaNode, MegaApiResponse, MegaLinkInfo } from '../types/mega';

/**
 * Parse MEGA folder URL and extract components
 */
export const parseFolderUrl = (url: string): MegaUrlParts => {
  console.log('Parsing URL:', url);
  
  // Try multiple regex patterns for MEGA URLs
  const patterns = [
    /mega\.nz\/folder\/([0-9a-zA-Z-_]+)#([0-9a-zA-Z-_]+)/,
    /mega\.nz\/#F!([0-9a-zA-Z-_]+)!([0-9a-zA-Z-_]+)/,
    /mega\.co\.nz\/folder\/([0-9a-zA-Z-_]+)#([0-9a-zA-Z-_]+)/,
    /mega\.co\.nz\/#F!([0-9a-zA-Z-_]+)!([0-9a-zA-Z-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('Matched pattern:', pattern, 'Result:', match);
      return {
        rootFolder: match[1],
        key: match[2]
      };
    }
  }
  
  throw new Error(`No valid MEGA folder pattern found in URL: ${url}`);
};

/**
 * Parse MEGA file URL and extract components
 */
export const parseFileUrl = (url: string): MegaFileUrlParts => {
  const patterns = [
    /mega\.nz\/file\/([0-9a-zA-Z-_]+)#([0-9a-zA-Z-_]+)/,
    /mega\.nz\/#!([0-9a-zA-Z-_]+)!([0-9a-zA-Z-_]+)/,
    /mega\.co\.nz\/file\/([0-9a-zA-Z-_]+)#([0-9a-zA-Z-_]+)/,
    /mega\.co\.nz\/#!([0-9a-zA-Z-_]+)!([0-9a-zA-Z-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        fileId: match[1],
        key: match[2]
      };
    }
  }
  
  throw new Error(`No valid MEGA file pattern found in URL: ${url}`);
};

/**
 * Check if URL is a valid MEGA URL
 */
export const isMegaUrl = (url: string): boolean => {
  return url.includes('mega.nz') || url.includes('mega.co.nz');
};

/**
 * Get nodes from shared folder using MEGA API
 */
export const getNodesInSharedFolder = async (rootFolder: string): Promise<MegaNode[]> => {
  const data = [{ "a": "f", "c": 1, "ca": 1, "r": 1 }];
  
  try {
    const url = `https://g.api.mega.co.nz/cs?id=0&n=${rootFolder}`;
    console.log('Fetching from MEGA API:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`MEGA API error: ${response.status} ${response.statusText}`);
    }
    
    const jsonResp: MegaApiResponse[] = await response.json();
    console.log('MEGA API response:', jsonResp);
    
    if (jsonResp[0] && jsonResp[0].f) {
      return jsonResp[0].f;
    } else {
      throw new Error('Invalid response from MEGA API');
    }
  } catch (error) {
    console.error('MEGA API fetch error:', error);
    throw new Error(`Failed to fetch MEGA data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file extension is a video
 */
export const isVideoFile = (extension: string): boolean => {
  const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg'];
  return videoExts.includes(extension.toLowerCase());
};

/**
 * Check if file extension is an image
 */
export const isImageFile = (extension: string): boolean => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico'];
  return imageExts.includes(extension.toLowerCase());
};

/**
 * Smart file type classification based on file size
 */
const classifyFileBySize = (node: MegaNode): { isVideo: boolean; isImage: boolean; confidence: number } => {
  const size = node.s || 0;
  const sizeMB = size / (1024 * 1024);
  
  // Video file classification based on size patterns
  if (size > 500 * 1024 * 1024) { // > 500MB
    return { isVideo: true, isImage: false, confidence: 0.95 };
  }
  
  if (size > 100 * 1024 * 1024) { // 100-500MB
    return { isVideo: true, isImage: false, confidence: 0.85 };
  }
  
  if (size > 50 * 1024 * 1024) { // 50-100MB
    return { isVideo: true, isImage: false, confidence: 0.75 };
  }
  
  if (size > 20 * 1024 * 1024) { // 20-50MB
    return { isVideo: true, isImage: false, confidence: 0.60 };
  }
  
  if (size > 10 * 1024 * 1024) { // 10-20MB
    return { isVideo: true, isImage: false, confidence: 0.45 };
  }
  
  // Image file classification
  if (size >= 100 * 1024 && size <= 10 * 1024 * 1024) { // 100KB-10MB
    if (size > 5 * 1024 * 1024) { // 5-10MB
      return { isVideo: false, isImage: true, confidence: 0.70 };
    }
    if (size > 1 * 1024 * 1024) { // 1-5MB
      return { isVideo: false, isImage: true, confidence: 0.80 };
    }
    if (size > 500 * 1024) { // 500KB-1MB
      return { isVideo: false, isImage: true, confidence: 0.75 };
    }
    return { isVideo: false, isImage: true, confidence: 0.65 };
  }
  
  // Files that are too small or don't fit patterns
  return { isVideo: false, isImage: false, confidence: 0.90 };
};

/**
 * Analyze MEGA link and extract metadata
 */
export const analyzeMegaLink = async (megaUrl: string): Promise<MegaLinkInfo | null> => {
  if (!isMegaUrl(megaUrl)) {
    return null;
  }

  let linkInfo: MegaLinkInfo = {
    name: '',
    size: 0,
    type: 'unknown',
    fileCount: 0,
    videoCount: 0,
    imageCount: 0,
    formattedSize: '0 Bytes'
  };

  try {
    // Try to parse as folder first
    console.log('Trying to parse as folder...');
    const { rootFolder, key } = parseFolderUrl(megaUrl);
    console.log('Parsed folder:', rootFolder, key);
    
    const nodes = await getNodesInSharedFolder(rootFolder);
    console.log('Got nodes:', nodes);
    
    linkInfo.type = 'folder';
    linkInfo.name = 'MEGA Folder'; // Default name for now
    
    let totalSize = 0;
    let fileCount = 0;
    let videoCount = 0;
    let imageCount = 0;
    
    // Process all nodes
    for (const node of nodes) {
      console.log('Processing node:', node);
      
      if (node.t === 0) { // File
        fileCount++;
        totalSize += node.s || 0;
        
        // Use smart size-based classification for videos and images
        const classification = classifyFileBySize(node);
        const sizeMB = (node.s || 0) / (1024 * 1024);
        
        if (classification.isVideo) {
          videoCount++;
          console.log(`🎥 Video detected: ${node.h} (${sizeMB.toFixed(1)}MB, ${(classification.confidence * 100).toFixed(0)}% confidence)`);
        } else if (classification.isImage) {
          imageCount++;
          console.log(`🖼️ Image detected: ${node.h} (${sizeMB.toFixed(1)}MB, ${(classification.confidence * 100).toFixed(0)}% confidence)`);
        } else {
          console.log(`📄 Other file: ${node.h} (${sizeMB.toFixed(1)}MB)`);
        }
        
      } else if (node.t === 1) { // Folder
        // This might be the root folder name
        if (node.h === rootFolder) {
          // Try to get folder name (without decryption for now)
          linkInfo.name = `MEGA Folder (${rootFolder.substring(0, 8)}...)`;
        }
      }
    }
    
    linkInfo.size = totalSize;
    linkInfo.fileCount = fileCount;
    linkInfo.videoCount = videoCount;
    linkInfo.imageCount = imageCount;
    linkInfo.formattedSize = formatFileSize(totalSize);
    
    console.log('📊 Final classification results:');
    console.log(`   📁 Total files: ${fileCount}`);
    console.log(`   🎥 Videos: ${videoCount} (${((videoCount/fileCount)*100).toFixed(1)}%)`);
    console.log(`   🖼️ Images: ${imageCount} (${((imageCount/fileCount)*100).toFixed(1)}%)`);
    console.log(`   📦 Total size: ${linkInfo.formattedSize}`);
    console.log('Final link info:', linkInfo);
    
    return linkInfo;
    
  } catch (folderError) {
    console.log('Folder parsing failed:', folderError);
    
    // Try to parse as single file
    try {
      console.log('Trying to parse as file...');
      const { fileId, key } = parseFileUrl(megaUrl);
      console.log('Parsed file:', fileId, key);
      
      linkInfo.type = 'file';
      linkInfo.name = `MEGA File (${fileId.substring(0, 8)}...)`;
      linkInfo.fileCount = 1;
      linkInfo.size = 0; // Would need additional API call
      linkInfo.formattedSize = 'Unknown size';
      
      return linkInfo;
      
    } catch (fileError) {
      console.log('File parsing failed:', fileError);
      const folderMsg = folderError instanceof Error ? folderError.message : 'Unknown folder error';
      const fileMsg = fileError instanceof Error ? fileError.message : 'Unknown file error';
      throw new Error(`Invalid MEGA URL format. Folder error: ${folderMsg}, File error: ${fileMsg}`);
    }
  }
};