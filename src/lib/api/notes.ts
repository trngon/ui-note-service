import { 
  Note, 
  Label, 
  CreateNoteRequest, 
  UpdateNoteRequest, 
  CreateLabelRequest,
  NoteResponse,
  LabelResponse,
  FileUploadResponse
} from '@/types/note';

// Helper function to get headers with user ID from localStorage
function getAuthHeaders(): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  // Get user from localStorage for authentication
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      headers.set('x-user-id', userData.userId);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  return headers;
}

// Note API functions
export const noteApi = {
  async getNotes(labelId?: string): Promise<Note[]> {
    const url = new URL('/api/notes', window.location.origin);
    if (labelId) {
      url.searchParams.append('labelId', labelId);
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }

    const data: NoteResponse = await response.json();
    return data.notes || [];
  },

  async createNote(noteData: CreateNoteRequest): Promise<Note> {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    const data: NoteResponse = await response.json();
    if (!data.note) {
      throw new Error('No note returned from server');
    }
    return data.note;
  },

  async updateNote(noteId: string, updates: UpdateNoteRequest): Promise<Note> {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update note');
    }

    const data: NoteResponse = await response.json();
    if (!data.note) {
      throw new Error('No note returned from server');
    }
    return data.note;
  },

  async deleteNote(noteId: string): Promise<void> {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
  },
};

// Label API functions
export const labelApi = {
  async getLabels(): Promise<Label[]> {
    const response = await fetch('/api/labels', {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch labels');
    }

    const data: LabelResponse = await response.json();
    return data.labels || [];
  },

  async createLabel(labelData: CreateLabelRequest): Promise<Label> {
    const response = await fetch('/api/labels', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(labelData),
    });

    if (!response.ok) {
      const errorData: LabelResponse = await response.json();
      throw new Error(errorData.message || 'Failed to create label');
    }

    const data: LabelResponse = await response.json();
    if (!data.label) {
      throw new Error('No label returned from server');
    }
    return data.label;
  },

  async deleteLabel(labelId: string): Promise<void> {
    const response = await fetch(`/api/labels/${labelId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete label');
    }
  },
};

// File API functions
export const fileApi = {
  async uploadFile(noteId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('noteId', noteId);

    // Get user ID for auth
    const storedUser = localStorage.getItem('user');
    let userId = '';
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        userId = userData.userId;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    const headers = new Headers();
    headers.set('x-user-id', userId);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData: FileUploadResponse = await response.json();
      throw new Error(errorData.message || 'Failed to upload file');
    }
  },

  async uploadMultipleFiles(noteId: string, files: File[]): Promise<void> {
    // Upload files sequentially to avoid overwhelming the server
    for (const file of files) {
      await this.uploadFile(noteId, file);
    }
  },

  async deleteFile(noteId: string, fileId: string): Promise<Note> {
    const response = await fetch(`/api/notes/${noteId}/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    const data: NoteResponse = await response.json();
    if (!data.note) {
      throw new Error('No note returned from server');
    }
    return data.note;
  },

  getDownloadUrl(noteId: string, fileId: string): string {
    return `/api/files/${fileId}/download?noteId=${noteId}`;
  },

  getViewUrl(noteId: string, fileId: string): string {
    return `/api/files/${fileId}/view?noteId=${noteId}`;
  },

  async downloadFile(noteId: string, fileId: string, fileName: string): Promise<void> {
    // Get user ID for auth
    const storedUser = localStorage.getItem('user');
    let userId = '';
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        userId = userData.userId;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    const headers = new Headers();
    headers.set('x-user-id', userId);

    const response = await fetch(this.getDownloadUrl(noteId, fileId), {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    // Create download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  isViewable(fileType: string): boolean {
    const viewableTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf'
    ];
    return viewableTypes.some(type => fileType.startsWith(type.split('/')[0]) || fileType === type);
  },
};