'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSession } from '@/types/auth';
import { Note, Label, CreateNoteFormData, UpdateNoteRequest } from '@/types/note';
import { noteApi, labelApi, fileApi } from '@/lib/api/notes';

// Components
import { Sidebar } from '@/components/ui/sidebar';
import { NoteList } from '@/components/notes/note-list';
import { NoteForm } from '@/components/notes/note-form';
import { NoteDetail } from '@/components/notes/note-detail';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LabelFilter } from '@/components/labels/label-filter';

interface ViewState {
  type: 'list' | 'form' | 'detail';
  note?: Note | null;
}

/**
 * Notes page - Note management interface for authenticated users
 */
export default function NotePage() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState<LoginSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Data state
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  
  // UI state
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Loading states
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isLabelsLoading, setIsLabelsLoading] = useState(false);
  const [isNoteActionLoading, setIsNoteActionLoading] = useState(false);

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

  // Load initial data
  useEffect(() => {
    if (user) {
      loadLabels();
      loadNotes();
    }
  }, [user]); // loadNotes and loadLabels are recreated on every render, so we don't include them

  // Reload notes when label filter changes
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [selectedLabelId, user]); // loadNotes is recreated on every render, so we don't include it

  const loadNotes = async () => {
    try {
      setIsNotesLoading(true);
      const fetchedNotes = await noteApi.getNotes(selectedLabelId || undefined);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsNotesLoading(false);
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.labels.some(label => label.name.toLowerCase().includes(query))
    );
  });

  const loadLabels = async () => {
    try {
      setIsLabelsLoading(true);
      const fetchedLabels = await labelApi.getLabels();
      setLabels(fetchedLabels);
    } catch (error) {
      console.error('Error loading labels:', error);
    } finally {
      setIsLabelsLoading(false);
    }
  };

  const handleCreateNote = async (data: CreateNoteFormData) => {
    try {
      setIsNoteActionLoading(true);
      
      // Create the note first
      const { pendingFiles, ...noteData } = data;
      const newNote = await noteApi.createNote(noteData);
      
      // If there are pending files, upload them to the newly created note
      if (pendingFiles && pendingFiles.length > 0) {
        try {
          await fileApi.uploadMultipleFiles(newNote.id, pendingFiles);
          // Get the updated note with files
          const updatedNote = await noteApi.getNote(newNote.id);
          setNotes(prev => [updatedNote, ...prev]);
        } catch (fileError) {
          console.error('Error uploading files to new note:', fileError);
          // Still add the note even if file upload fails
          setNotes(prev => [newNote, ...prev]);
        }
      } else {
        setNotes(prev => [newNote, ...prev]);
      }
      
      setViewState({ type: 'list' });
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    } finally {
      setIsNoteActionLoading(false);
    }
  };

  const handleUpdateNote = async (data: UpdateNoteRequest) => {
    if (!viewState.note) return;
    
    try {
      setIsNoteActionLoading(true);
      const updatedNote = await noteApi.updateNote(viewState.note.id, data);
      setNotes(prev => prev.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
      setViewState({ type: 'detail', note: updatedNote });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    } finally {
      setIsNoteActionLoading(false);
    }
  };

  const handleFormSave = async (data: CreateNoteFormData | UpdateNoteRequest) => {
    if (viewState.note) {
      await handleUpdateNote(data as UpdateNoteRequest);
    } else {
      await handleCreateNote(data as CreateNoteFormData);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteApi.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      setViewState({ type: 'list' });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleFileUpload = async (noteId: string, file: File) => {
    try {
      await fileApi.uploadFile(noteId, file);
      // Reload notes to get updated file list
      await loadNotes();
      // Update the current view if it's showing the note detail
      if (viewState.type === 'detail' && viewState.note?.id === noteId) {
        const updatedNotes = await noteApi.getNotes();
        const updatedNote = updatedNotes.find(n => n.id === noteId);
        if (updatedNote) {
          setViewState({ type: 'detail', note: updatedNote });
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleMultipleFileUpload = async (files: File[]) => {
    if (viewState.type === 'form' && viewState.note) {
      try {
        await fileApi.uploadMultipleFiles(viewState.note.id, files);
        // Reload notes to get updated file list
        await loadNotes();
        // Update the current view if it's showing the note detail
        const updatedNotes = await noteApi.getNotes();
        const updatedNote = updatedNotes.find(n => n.id === viewState.note!.id);
        if (updatedNote) {
          setViewState({ type: 'form', note: updatedNote });
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
      }
    }
  };

  const handleFileDelete = async (noteId: string, fileId: string) => {
    try {
      const updatedNote = await fileApi.deleteFile(noteId, fileId);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      // Update the current view if it's showing the note detail
      if (viewState.type === 'detail' && viewState.note?.id === noteId) {
        setViewState({ type: 'detail', note: updatedNote });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  // Calculate note count by label
  const noteCountByLabel = labels.reduce((acc, label) => {
    acc[label.id] = notes.filter(note => 
      note.labels.some(noteLabel => noteLabel.id === label.id)
    ).length;
    return acc;
  }, {} as Record<string, number>);

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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {viewState.type === 'form' 
                  ? (viewState.note ? 'Edit Note' : 'Create Note')
                  : viewState.type === 'detail' 
                  ? 'Note Details'
                  : selectedLabelId 
                  ? `Notes - ${labels.find(l => l.id === selectedLabelId)?.name}`
                  : 'All Notes'
                }
              </h1>
              <p className="text-gray-600">
                {viewState.type === 'list' && (
                  `${filteredNotes.length} note${filteredNotes.length !== 1 ? 's' : ''}`
                )}
              </p>
            </div>

            {viewState.type === 'list' && (
              <button
                onClick={() => setViewState({ type: 'form', note: null })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + New Note
              </button>
            )}
          </div>

          {/* Search and Filter */}
          {viewState.type === 'list' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search notes by title, content, or labels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Label Filter - Full Width */}
              <LabelFilter
                labels={labels}
                selectedLabelId={selectedLabelId}
                onLabelSelect={setSelectedLabelId}
                noteCountByLabel={noteCountByLabel}
              />
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {viewState.type === 'list' && (
            <NoteList
              notes={filteredNotes}
              onNoteEdit={(note) => setViewState({ type: 'form', note })}
              onNoteDelete={handleDeleteNote}
              onNoteSelect={(note) => setViewState({ type: 'detail', note })}
              isLoading={isNotesLoading}
            />
          )}

          {viewState.type === 'form' && (
            <div className="max-w-2xl mx-auto">
              <NoteForm
                note={viewState.note}
                labels={labels}
                onSave={handleFormSave}
                onCancel={() => setViewState({ type: 'list' })}
                onFileUpload={handleMultipleFileUpload}
                isLoading={isNoteActionLoading}
              />
            </div>
          )}

          {viewState.type === 'detail' && viewState.note && (
            <div className="max-w-4xl mx-auto h-full">
              <NoteDetail
                note={viewState.note}
                onEdit={(note) => setViewState({ type: 'form', note })}
                onDelete={handleDeleteNote}
                onClose={() => setViewState({ type: 'list' })}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
                isLoading={isNoteActionLoading}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}