import React, { useState } from 'react';
import MegaLinkAnalyzer from '../components/MegaLinkAnalyzer';
import { MegaLinkInfo } from '../types/mega';

const TestMega: React.FC = () => {
  const [testUrl, setTestUrl] = useState<string>('');
  const [linkInfo, setLinkInfo] = useState<MegaLinkInfo | null>(null);

  const handleInfoLoaded = (info: MegaLinkInfo): void => {
    setLinkInfo(info);
    console.log('Got MEGA info:', info);
  };

  const handleClearTest = (): void => {
    setTestUrl('');
    setLinkInfo(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MEGA Link Analyzer Test
        </h1>
        <p className="text-gray-600 mb-6">
          Test the MEGA link analyzer component with your URLs
        </p>
        
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="mega-url" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              MEGA URL
            </label>
            <div className="flex space-x-2">
              <input
                id="mega-url"
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://mega.nz/folder/... or https://mega.nz/file/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleClearTest}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Analyzer Component */}
          <MegaLinkAnalyzer 
            url={testUrl} 
            onInfoLoaded={handleInfoLoaded}
          />
        </div>
      </div>

      {/* Results Display */}
      {linkInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Extracted Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Name:</span>
              <span className="ml-2 text-blue-700">{linkInfo.name}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Type:</span>
              <span className="ml-2 text-blue-700 capitalize">{linkInfo.type}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Size:</span>
              <span className="ml-2 text-blue-700">{linkInfo.formattedSize}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Total Files:</span>
              <span className="ml-2 text-blue-700">{linkInfo.fileCount}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Videos:</span>
              <span className="ml-2 text-blue-700">{linkInfo.videoCount}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Images:</span>
              <span className="ml-2 text-blue-700">{linkInfo.imageCount}</span>
            </div>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-800 font-medium">
              Raw Data (JSON)
            </summary>
            <pre className="mt-2 text-xs text-blue-700 bg-blue-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(linkInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          How to Test
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Paste a MEGA folder or file URL in the input field above</li>
          <li>The analyzer will automatically attempt to extract metadata</li>
          <li>Check the browser console (F12) for detailed logs</li>
          <li>Results will appear below if successful</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Some MEGA links may require additional decryption 
            which is not yet implemented. File counts and sizes should work for most public folders.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestMega;