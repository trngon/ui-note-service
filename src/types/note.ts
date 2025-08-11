/**
 * Note-related TypeScript types
 */

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  labels: Label[];
  files: NoteFile[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  labelIds?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  labelIds?: string[];
}

export interface CreateLabelRequest {
  name: string;
  color: string;
}

export interface UpdateLabelRequest {
  name?: string;
  color?: string;
}

export interface NoteResponse {
  success: boolean;
  message: string;
  note?: Note;
  notes?: Note[];
}

export interface LabelResponse {
  success: boolean;
  message: string;
  label?: Label;
  labels?: Label[];
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file?: NoteFile;
}