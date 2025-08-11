import React, { useState } from 'react';
import { Note, NoteFile } from '@/types/note';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { FilePreview } from '@/components/ui/file-preview';
import { fileApi } from '@/lib/api/notes';

interface NoteDetailProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onClose: () => void;
  onFileUpload: (noteId: string, file: File) => Promise<void>;
  onFileDelete: (noteId: string, fileId: string) => Promise<void>;
  isLoading?: boolean;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  onEdit,
  onDelete,
  onClose,
  onFileUpload,
  onFileDelete,
  isLoading = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file: NoteFile; noteId: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onFileUpload(note.id, file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragDropUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        await onFileUpload(note.id, file);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleClipboardPaste = async (files: File[]) => {
    await handleDragDropUpload(files);
  };

  const handleFileDelete = async (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await onFileDelete(note.id, fileId);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      await fileApi.downloadFile(note.id, fileId, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleFileView = (file: NoteFile) => {
    if (fileApi.isViewable(file.type)) {
      setPreviewFile({ file, noteId: note.id });
    }
  };

  const handleEdit = () => {
    onEdit(note);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
      onClose();
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0 mr-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {note.title}
            </h1>
            
            {/* Labels */}
            {note.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {note.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="text-sm text-gray-500">
              <p>Created: {formatDate(note.createdAt)}</p>
              {note.updatedAt !== note.createdAt && (
                <p>Updated: {formatDate(note.updatedAt)}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
              title="Edit note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
              {note.content}
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Attachments ({note.files.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                disabled={isUploading || isLoading}
                className="inline-flex items-center px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showFileUpload ? 'Hide Upload' : 'Add Files'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Browse Files'
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
                multiple
              />
            </div>
          </div>

          {/* Drag and Drop Upload Area */}
          {showFileUpload && (
            <div className="mb-4">
              <DragDropUpload
                onFileUpload={handleDragDropUpload}
                onClipboardPaste={handleClipboardPaste}
                maxFiles={5}
                disabled={isLoading || isUploading}
                className="min-h-32"
              />
            </div>
          )}

          {/* File List */}
          <div className="space-y-2">
            {note.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center min-w-0 flex-1">
                  <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => handleFileView(file)}
                      className={`text-sm font-medium text-left truncate block w-full ${
                        fileApi.isViewable(file.type) 
                          ? 'text-indigo-600 hover:text-indigo-800 cursor-pointer'
                          : 'text-gray-900 cursor-default'
                      }`}
                    >
                      {file.name}
                    </button>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      {fileApi.isViewable(file.type) && (
                        <span className="ml-2 text-indigo-600">• Click to preview</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <button
                    onClick={() => handleFileDownload(file.id, file.name)}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                    title="Download file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  {fileApi.isViewable(file.type) && (
                    <button
                      onClick={() => handleFileView(file)}
                      disabled={isLoading}
                      className="text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                      title="Preview file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleFileDelete(file.id, file.name)}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {note.files.length === 0 && (
              <p className="text-gray-500 text-sm italic text-center py-4">
                No files attached
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview
          file={previewFile.file}
          noteId={previewFile.noteId}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
};