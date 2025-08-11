import React, { useState } from 'react';
import { NoteFile } from '@/types/note';
import { fileApi } from '@/lib/api/notes';

interface FilePreviewProps {
  file: NoteFile;
  noteId: string;
  onClose: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, noteId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const viewUrl = fileApi.getViewUrl(noteId, file.id);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = (errorEvent: any) => {
    setIsLoading(false);
    console.error('File preview error:', errorEvent);
    console.error('Failed URL:', viewUrl);
    setError('Failed to load file');
  };

  const handleDownload = async () => {
    try {
      await fileApi.downloadFile(noteId, file.id, file.name);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-full w-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {file.name}
            </h3>
            <p className="text-sm text-gray-500">
              {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleDownload}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="Download file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-0">
          {error ? (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}

              {isImage && (
                <img
                  src={viewUrl}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              )}

              {isPdf && (
                <iframe
                  src={viewUrl}
                  title={file.name}
                  className="w-full h-full min-h-96"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
            </p>
            <button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};