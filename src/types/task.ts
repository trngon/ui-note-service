/**
 * Task-related TypeScript types
 */

export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  content: string;
  userId: string;
  status: TaskStatus;
  dueDate: string;
  labels: TaskLabel[];
  files: TaskFile[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  content: string;
  status?: TaskStatus;
  dueDate?: string;
  labelIds?: string[];
}

export interface CreateTaskFormData extends CreateTaskRequest {
  pendingFiles?: File[];
}

export interface UpdateTaskRequest {
  title?: string;
  content?: string;
  status?: TaskStatus;
  dueDate?: string;
  labelIds?: string[];
}

export interface CreateTaskLabelRequest {
  name: string;
  color: string;
}

export interface UpdateTaskLabelRequest {
  name?: string;
  color?: string;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  task?: Task;
  tasks?: Task[];
}

export interface TaskLabelResponse {
  success: boolean;
  message: string;
  label?: TaskLabel;
  labels?: TaskLabel[];
}

export interface TaskFileUploadResponse {
  success: boolean;
  message: string;
  file?: TaskFile;
}

/**
 * Task statistics for dashboard/overview
 */
export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

/**
 * Task filter options
 */
export interface TaskFilter {
  status?: TaskStatus;
  labelId?: string;
  dueDate?: 'overdue' | 'today' | 'week' | 'month';
}