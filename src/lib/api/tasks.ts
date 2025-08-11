import { 
  Task, 
  TaskLabel, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  CreateTaskLabelRequest,
  TaskResponse,
  TaskLabelResponse,
  TaskFileUploadResponse,
  TaskStatus
} from '@/types/task';

// Helper function to get headers with user ID from localStorage
function getAuthHeaders(): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  // Get user from localStorage for authentication
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      // Handle both userId and id fields for backwards compatibility
      const userId = userData.userId || userData.id || '';
      if (userId) {
        headers.set('x-user-id', userId);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  return headers;
}

// Task API functions
export const taskApi = {
  async getTasks(status?: TaskStatus, labelId?: string): Promise<Task[]> {
    const url = new URL('/api/tasks', window.location.origin);
    if (status) {
      url.searchParams.append('status', status);
    }
    if (labelId) {
      url.searchParams.append('labelId', labelId);
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const data: TaskResponse = await response.json();
    return data.tasks || [];
  },

  async getTask(id: string): Promise<Task> {
    const response = await fetch(`/api/tasks/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }

    const data: TaskResponse = await response.json();
    if (!data.task) {
      throw new Error('Task not found');
    }
    
    return data.task;
  },

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData: TaskResponse = await response.json();
      throw new Error(errorData.message || 'Failed to create task');
    }

    const data: TaskResponse = await response.json();
    if (!data.task) {
      throw new Error('No task returned from server');
    }
    
    return data.task;
  },

  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData: TaskResponse = await response.json();
      throw new Error(errorData.message || 'Failed to update task');
    }

    const data: TaskResponse = await response.json();
    if (!data.task) {
      throw new Error('No task returned from server');
    }
    
    return data.task;
  },

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData: TaskResponse = await response.json();
      throw new Error(errorData.message || 'Failed to delete task');
    }
  },

  async deleteAllDoneTasks(): Promise<number> {
    const response = await fetch('/api/tasks?status=Done', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData: TaskResponse = await response.json();
      throw new Error(errorData.message || 'Failed to delete done tasks');
    }

    const data = await response.json();
    return data.deletedCount || 0;
  },
};

// Task Label API functions
export const taskLabelApi = {
  async getLabels(): Promise<TaskLabel[]> {
    const response = await fetch('/api/tasks/labels', {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch task labels');
    }

    const data: TaskLabelResponse = await response.json();
    return data.labels || [];
  },

  async createLabel(labelData: CreateTaskLabelRequest): Promise<TaskLabel> {
    const response = await fetch('/api/tasks/labels', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(labelData),
    });

    if (!response.ok) {
      const errorData: TaskLabelResponse = await response.json();
      throw new Error(errorData.message || 'Failed to create task label');
    }

    const data: TaskLabelResponse = await response.json();
    if (!data.label) {
      throw new Error('No label returned from server');
    }
    
    return data.label;
  },
};

// Task File API functions (placeholder for future implementation)
export const taskFileApi = {
  async uploadFile(taskId: string, file: File): Promise<any> {
    // This would be implemented similar to the notes file upload
    // For now, return a placeholder
    throw new Error('Task file upload not yet implemented');
  },

  async deleteFile(taskId: string, fileId: string): Promise<void> {
    // This would be implemented similar to the notes file delete
    // For now, return a placeholder
    throw new Error('Task file delete not yet implemented');
  },
};