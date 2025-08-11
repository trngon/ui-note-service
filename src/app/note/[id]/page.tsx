'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LoginSession } from '@/types/auth';
import { Note } from '@/types/note';
import { noteApi, fileApi } from '@/lib/api/notes';

// Components
import { Sidebar } from '@/components/ui/sidebar';
import { NoteDetail } from '@/components/notes/note-detail';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

/**
 * Individual Note Detail Page - Accessible via URL /note/[id]
 */
export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  
  // Authentication state
  const [user, setUser] = useState<LoginSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Data state
  const [note, setNote] = useState<Note | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [isNoteActionLoading, setIsNoteActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as LoginSession;
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        router.push('/signin');
      }
    } else {
      router.push('/signin');
    }
    setIsAuthLoading(false);
  }, [router]);

  // Load note data
  useEffect(() => {
    if (user && noteId) {
      loadNote();
    }
  }, [user, noteId]);

  const loadNote = async () => {
    try {
      setIsNoteLoading(true);
      setError(null);
      const fetchedNote = await noteApi.getNote(noteId);
      setNote(fetchedNote);
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Note not found or you do not have permission to view it.');
    } finally {
      setIsNoteLoading(false);
    }
  };

  const handleEditNote = (note: Note) => {
    router.push(`/note?edit=${note.id}`);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteApi.deleteNote(noteId);
      router.push('/note');
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleClose = () => {
    router.push('/note');
  };

  const handleFileUpload = async (noteId: string, file: File) => {
    try {
      await fileApi.uploadFile(noteId, file);
      // Reload the note to get updated file list
      await loadNote();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleFileDelete = async (noteId: string, fileId: string) => {
    try {
      const updatedNote = await fileApi.deleteFile(noteId, fileId);
      setNote(updatedNote);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        onSignOut={handleSignOut}
        currentPath="/note"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Back to notes"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Note Details</h1>
                {note && (
                  <p className="text-gray-600 text-sm">
                    Last updated: {new Date(note.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>

            {note && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditNote(note)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
                
                {/* Share button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                    alert('Note URL copied to clipboard!');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  title="Copy note URL"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {isNoteLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-16 w-16 text-red-400 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.598 0L5.232 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Note Not Found</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={handleClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Notes
              </button>
            </div>
          ) : note ? (
            <div className="max-w-4xl mx-auto h-full">
              <NoteDetail
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onClose={handleClose}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                isLoading={isNoteActionLoading}
              />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
