'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSession } from '@/types/auth';
import { Note, Label, CreateNoteRequest, UpdateNoteRequest } from '@/types/note';
import { noteApi, labelApi, fileApi } from '@/lib/api/notes';

// Components
import { Sidebar } from '@/components/ui/sidebar';
import { NoteList } from '@/components/notes/note-list';
import { NoteForm } from '@/components/notes/note-form';
import { NoteDetail } from '@/components/notes/note-detail';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LabelFilter } from '@/components/labels/label-filter';
import { LabelManager } from '@/components/labels/label-manager';

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

  const handleCreateNote = async (data: CreateNoteRequest) => {
    try {
      setIsNoteActionLoading(true);
      const newNote = await noteApi.createNote(data);
      setNotes(prev => [newNote, ...prev]);
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

  const handleFormSave = async (data: CreateNoteRequest | UpdateNoteRequest) => {
    if (viewState.note) {
      await handleUpdateNote(data as UpdateNoteRequest);
    } else {
      await handleCreateNote(data as CreateNoteRequest);
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

  const handleCreateLabel = async (data: { name: string; color: string }) => {
    try {
      const newLabel = await labelApi.createLabel(data);
      setLabels(prev => [...prev, newLabel]);
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    try {
      await labelApi.deleteLabel(labelId);
      setLabels(prev => prev.filter(label => label.id !== labelId));
      // Reload notes to reflect label removal
      await loadNotes();
    } catch (error) {
      console.error('Error deleting label:', error);
      throw error;
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
                  `${notes.length} note${notes.length !== 1 ? 's' : ''}`
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

          {/* Label Filter and Management */}
          {viewState.type === 'list' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LabelFilter
                labels={labels}
                selectedLabelId={selectedLabelId}
                onLabelSelect={setSelectedLabelId}
                noteCountByLabel={noteCountByLabel}
              />
              <LabelManager
                labels={labels}
                onCreateLabel={handleCreateLabel}
                onDeleteLabel={handleDeleteLabel}
                isLoading={isLabelsLoading}
              />
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {viewState.type === 'list' && (
            <NoteList
              notes={notes}
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