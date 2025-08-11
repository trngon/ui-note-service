import React from 'react';
import { Note } from '@/types/note';
import { NoteCard } from './note-card';

interface NoteListProps {
  notes: Note[];
  onNoteEdit: (note: Note) => void;
  onNoteDelete: (noteId: string) => void;
  onNoteSelect: (note: Note) => void;
  isLoading?: boolean;
}

export const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  onNoteEdit, 
  onNoteDelete, 
  onNoteSelect,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-lg h-64 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg 
          className="mx-auto h-16 w-16 text-gray-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first note.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onNoteEdit}
          onDelete={onNoteDelete}
          onSelect={onNoteSelect}
        />
      ))}
    </div>
  );
};