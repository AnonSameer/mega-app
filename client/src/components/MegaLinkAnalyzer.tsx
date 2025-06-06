import React, { useState, useEffect } from 'react';
import { MegaLinkInfo, MegaLinkAnalyzerProps } from '../types/mega';
import { analyzeMegaLink, isMegaUrl } from '../services/megaService';

const MegaLinkAnalyzer: React.FC<MegaLinkAnalyzerProps> = ({ url, onInfoLoaded }) => {
  const [info, setInfo] = useState<MegaLinkInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (megaUrl: string): Promise<void> => {
    if (!isMegaUrl(megaUrl)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const linkInfo = await analyzeMegaLink(megaUrl);
      
      if (linkInfo) {
        setInfo(linkInfo);
        onInfoLoaded?.(linkInfo);
      }

    } catch (err) {
      console.error('Error analyzing MEGA link:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      handleAnalyze(url);
    }
  }, [url]);

  // Don't render anything if not a MEGA URL
  if (!url || !isMegaUrl(url)) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span>Analyzing MEGA link...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
        <details>
          <summary className="cursor-pointer">Could not analyze MEGA link</summary>
          <div className="mt-1 text-xs font-mono whitespace-pre-wrap">{error}</div>
        </details>
      </div>
    );
  }

  // No info state
  if (!info) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-lg">
          {info.type === 'folder' ? '📁' : '📄'}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 truncate" title={info.name}>
            {info.name}
          </div>
          <div className="text-sm text-gray-600">
            {info.formattedSize}
            {info.type === 'folder' && info.fileCount > 0 && ` • ${info.fileCount} files`}
          </div>
        </div>
      </div>
      
      {info.type === 'folder' && (info.videoCount > 0 || info.imageCount > 0) && (
        <div className="flex space-x-4 text-sm text-gray-600">
          {info.videoCount > 0 && (
            <div className="flex items-center space-x-1">
              <span>🎥</span>
              <span>{info.videoCount} videos</span>
            </div>
          )}
          {info.imageCount > 0 && (
            <div className="flex items-center space-x-1">
              <span>🖼️</span>
              <span>{info.imageCount} images</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MegaLinkAnalyzer;