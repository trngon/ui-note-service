import React, { useState, useCallback, useRef } from 'react';

interface DragDropUploadProps {
  onFileUpload: (files: File[]) => Promise<void>;
  onClipboardPaste?: (files: File[]) => Promise<void>;
  acceptedTypes?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileUpload,
  onClipboardPaste,
  acceptedTypes = "*/*",
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className = "",
  disabled = false,
  children,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (fileArray.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return [];
    }

    for (const file of fileArray) {
      if (file.size > maxFileSize) {
        errors.push(`${file.name} is too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(null), 5000);
      return [];
    }

    return validFiles;
  }, [maxFiles, maxFileSize]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    
    try {
      await onFileUpload(files);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = validateFiles(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  }, [disabled, validateFiles, handleFileUpload]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = validateFiles(e.target.files);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
    
    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Handle clipboard paste for images
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    if (!onClipboardPaste || disabled) return;

    const items = Array.from(e.clipboardData.items);
    const imageFiles: File[] = [];

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      const validFiles = validateFiles(imageFiles);
      if (validFiles.length > 0) {
        setIsUploading(true);
        setError(null);
        try {
          await onClipboardPaste(validFiles);
        } catch (error) {
          console.error('Error uploading pasted files:', error);
          setError(error instanceof Error ? error.message : 'Upload failed');
          setTimeout(() => setError(null), 5000);
        } finally {
          setIsUploading(false);
        }
      }
    }
  }, [onClipboardPaste, disabled, validateFiles]);

  const dragOverStyles = isDragOver
    ? "border-indigo-500 bg-indigo-50"
    : "border-gray-300 hover:border-gray-400";

  const baseStyles = `
    relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
    ${dragOverStyles}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div
      className={baseStyles}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onPaste={onClipboardPaste ? handlePaste : undefined}
      tabIndex={onClipboardPaste ? 0 : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {isUploading ? (
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      ) : children ? (
        children
      ) : (
        <div className="flex flex-col items-center">
          <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500 mb-1">
            Maximum {maxFiles} file{maxFiles > 1 ? 's' : ''}, up to {Math.round(maxFileSize / 1024 / 1024)}MB each
          </p>
          {onClipboardPaste && (
            <p className="text-xs text-gray-400">
              You can also paste images from clipboard
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="absolute inset-x-0 bottom-0 bg-red-50 border border-red-200 rounded-b-lg p-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};