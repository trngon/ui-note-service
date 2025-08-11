import fs from 'fs';
import path from 'path';
import { Note, Label, NoteFile } from '@/types/note';

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const LABELS_FILE = path.join(DATA_DIR, 'labels.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

/**
 * Utility functions for managing note data in JSON files
 */

/**
 * Ensure the data directory and files exist
 */
function ensureDataFiles(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(LABELS_FILE)) {
    fs.writeFileSync(LABELS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Read all notes from the JSON file
 */
export function readNotes(): Note[] {
  ensureDataFiles();
  
  try {
    const data = fs.readFileSync(NOTES_FILE, 'utf8');
    return JSON.parse(data) as Note[];
  } catch (error) {
    console.error('Error reading notes file:', error);
    return [];
  }
}

/**
 * Write notes array to the JSON file
 */
export function writeNotes(notes: Note[]): void {
  ensureDataFiles();
  
  try {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
  } catch (error) {
    console.error('Error writing notes file:', error);
    throw new Error('Failed to save note data');
  }
}

/**
 * Read all labels from the JSON file
 */
export function readLabels(): Label[] {
  ensureDataFiles();
  
  try {
    const data = fs.readFileSync(LABELS_FILE, 'utf8');
    return JSON.parse(data) as Label[];
  } catch (error) {
    console.error('Error reading labels file:', error);
    return [];
  }
}

/**
 * Write labels array to the JSON file
 */
export function writeLabels(labels: Label[]): void {
  ensureDataFiles();
  
  try {
    fs.writeFileSync(LABELS_FILE, JSON.stringify(labels, null, 2));
  } catch (error) {
    console.error('Error writing labels file:', error);
    throw new Error('Failed to save label data');
  }
}

/**
 * Find notes by user ID
 */
export function findNotesByUserId(userId: string): Note[] {
  const notes = readNotes();
  return notes.filter(note => note.userId === userId);
}

/**
 * Find a note by ID
 */
export function findNoteById(id: string): Note | null {
  const notes = readNotes();
  return notes.find(note => note.id === id) || null;
}

/**
 * Find a note by ID and user ID (for authorization)
 */
export function findNoteByIdAndUserId(id: string, userId: string): Note | null {
  const notes = readNotes();
  return notes.find(note => note.id === id && note.userId === userId) || null;
}

/**
 * Create a new note
 */
export function createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const notes = readNotes();
  
  const newNote: Note = {
    ...noteData,
    id: generateNoteId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  notes.push(newNote);
  writeNotes(notes);
  
  return newNote;
}

/**
 * Update an existing note
 */
export function updateNote(id: string, userId: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>): Note | null {
  const notes = readNotes();
  const noteIndex = notes.findIndex(note => note.id === id && note.userId === userId);
  
  if (noteIndex === -1) {
    return null;
  }
  
  const updatedNote: Note = {
    ...notes[noteIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  notes[noteIndex] = updatedNote;
  writeNotes(notes);
  
  return updatedNote;
}

/**
 * Delete a note
 */
export function deleteNote(id: string, userId: string): boolean {
  const notes = readNotes();
  const noteIndex = notes.findIndex(note => note.id === id && note.userId === userId);
  
  if (noteIndex === -1) {
    return false;
  }
  
  // Delete associated files
  const note = notes[noteIndex];
  note.files.forEach(file => {
    try {
      const filePath = path.join(UPLOADS_DIR, file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  });
  
  notes.splice(noteIndex, 1);
  writeNotes(notes);
  
  return true;
}

/**
 * Find a label by ID
 */
export function findLabelById(id: string): Label | null {
  const labels = readLabels();
  return labels.find(label => label.id === id) || null;
}

/**
 * Find labels by IDs
 */
export function findLabelsByIds(ids: string[]): Label[] {
  const labels = readLabels();
  return labels.filter(label => ids.includes(label.id));
}

/**
 * Create a new label
 */
export function createLabel(labelData: Omit<Label, 'id' | 'createdAt' | 'updatedAt'>): Label {
  const labels = readLabels();
  
  // Check if label with same name already exists
  if (labels.some(label => label.name.toLowerCase() === labelData.name.toLowerCase())) {
    throw new Error('Label with this name already exists');
  }
  
  const newLabel: Label = {
    ...labelData,
    id: generateLabelId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  labels.push(newLabel);
  writeLabels(labels);
  
  return newLabel;
}

/**
 * Update an existing label
 */
export function updateLabel(id: string, updates: Partial<Omit<Label, 'id' | 'createdAt'>>): Label | null {
  const labels = readLabels();
  const labelIndex = labels.findIndex(label => label.id === id);
  
  if (labelIndex === -1) {
    return null;
  }
  
  // Check if new name conflicts with existing label
  if (updates.name) {
    const existingLabel = labels.find(label => 
      label.id !== id && label.name.toLowerCase() === updates.name!.toLowerCase()
    );
    if (existingLabel) {
      throw new Error('Label with this name already exists');
    }
  }
  
  const updatedLabel: Label = {
    ...labels[labelIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  labels[labelIndex] = updatedLabel;
  writeLabels(labels);
  
  return updatedLabel;
}

/**
 * Delete a label
 */
export function deleteLabel(id: string): boolean {
  const labels = readLabels();
  const labelIndex = labels.findIndex(label => label.id === id);
  
  if (labelIndex === -1) {
    return false;
  }
  
  // Remove label from all notes
  const notes = readNotes();
  const updatedNotes = notes.map(note => ({
    ...note,
    labels: note.labels.filter(label => label.id !== id),
    updatedAt: new Date().toISOString(),
  }));
  writeNotes(updatedNotes);
  
  labels.splice(labelIndex, 1);
  writeLabels(labels);
  
  return true;
}

/**
 * Add file to note
 */
export function addFileToNote(noteId: string, userId: string, file: NoteFile): Note | null {
  const notes = readNotes();
  const noteIndex = notes.findIndex(note => note.id === noteId && note.userId === userId);
  
  if (noteIndex === -1) {
    return null;
  }
  
  const updatedNote: Note = {
    ...notes[noteIndex],
    files: [...notes[noteIndex].files, file],
    updatedAt: new Date().toISOString(),
  };
  
  notes[noteIndex] = updatedNote;
  writeNotes(notes);
  
  return updatedNote;
}

/**
 * Remove file from note
 */
export function removeFileFromNote(noteId: string, userId: string, fileId: string): Note | null {
  const notes = readNotes();
  const noteIndex = notes.findIndex(note => note.id === noteId && note.userId === userId);
  
  if (noteIndex === -1) {
    return null;
  }
  
  const note = notes[noteIndex];
  const fileToRemove = note.files.find(file => file.id === fileId);
  
  if (fileToRemove) {
    // Delete physical file
    try {
      const filePath = path.join(UPLOADS_DIR, fileToRemove.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  
  const updatedNote: Note = {
    ...note,
    files: note.files.filter(file => file.id !== fileId),
    updatedAt: new Date().toISOString(),
  };
  
  notes[noteIndex] = updatedNote;
  writeNotes(notes);
  
  return updatedNote;
}

/**
 * Get uploads directory path
 */
export function getUploadsDir(): string {
  ensureDataFiles();
  return UPLOADS_DIR;
}

/**
 * Generate a simple note ID
 */
function generateNoteId(): string {
  return 'note_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a simple label ID
 */
function generateLabelId(): string {
  return 'label_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a simple file ID
 */
export function generateFileId(): string {
  return 'file_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}