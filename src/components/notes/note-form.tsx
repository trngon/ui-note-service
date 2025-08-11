import React, { useState, useEffect } from 'react';
import { Note, Label, CreateNoteFormData, UpdateNoteRequest } from '@/types/note';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';

interface NoteFormProps {
  note?: Note | null;
  labels: Label[];
  onSave: (data: CreateNoteFormData | UpdateNoteRequest) => Promise<void>;
  onCancel: () => void;
  onFileUpload?: (files: File[]) => Promise<void>;
  isLoading?: boolean;
}

export const NoteForm: React.FC<NoteFormProps> = ({ 
  note, 
  labels, 
  onSave, 
  onCancel, 
  onFileUpload,
  isLoading = false 
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    note?.labels.map(label => label.id) || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedLabelIds(note.labels.map(label => label.id));
    } else {
      // Reset pending files when switching to new note mode
      setPendingFiles([]);
    }
  }, [note]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data = {
      title: title.trim(),
      content: content.trim(),
      labelIds: selectedLabelIds,
      ...(note ? {} : { pendingFiles }), // Only include files for new notes
    };

    try {
      await onSave(data);
      if (!note) {
        // Reset form for new notes
        setTitle('');
        setContent('');
        setSelectedLabelIds([]);
        setPendingFiles([]);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleLabelToggle = (labelId: string) => {
    setSelectedLabelIds(prev => 
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleFileUpload = async (files: File[]) => {
    if (note && onFileUpload) {
      // For existing notes, upload files immediately
      await onFileUpload(files);
    } else {
      // For new notes, store files temporarily until note is created
      setPendingFiles(prev => [...prev, ...files]);
    }
  };

  const handleClipboardPaste = async (files: File[]) => {
    await handleFileUpload(files);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {note ? 'Edit Note' : 'Create New Note'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter note title"
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${
              errors.content ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter note content"
            disabled={isLoading}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Attachments
          </label>
          <DragDropUpload
            onFileUpload={handleFileUpload}
            onClipboardPaste={handleClipboardPaste}
            maxFiles={5}
            disabled={isLoading}
            className="min-h-32"
          />
          <p className="mt-2 text-xs text-gray-500">
            {note 
              ? "You can drag and drop files or paste images from clipboard."
              : "Files will be attached after the note is created. You can drag and drop files or paste images from clipboard."
            }
          </p>

          {/* Pending Files List (for new notes) */}
          {!note && pendingFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Files to attach:</p>
              {pendingFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center min-w-0 flex-1">
                    <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-2"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => handleLabelToggle(label.id)}
                  disabled={isLoading}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedLabelIds.includes(label.id)
                      ? 'text-white'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={selectedLabelIds.includes(label.id) ? { backgroundColor: label.color } : {}}
                >
                  {label.name}
                  {selectedLabelIds.includes(label.id) && (
                    <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            <span>{note ? 'Update Note' : 'Create Note'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};