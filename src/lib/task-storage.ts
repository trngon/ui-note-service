import fs from 'fs';
import path from 'path';
import { Task, TaskLabel, TaskFile, TaskStatus } from '@/types/task';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const TASK_LABELS_FILE = path.join(DATA_DIR, 'task-labels.json');
const TASK_UPLOADS_DIR = path.join(DATA_DIR, 'task-uploads');

/**
 * Utility functions for managing task data in JSON files
 */

/**
 * Ensure the data directory and files exist
 */
function ensureTaskDataFiles(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(TASK_UPLOADS_DIR)) {
    fs.mkdirSync(TASK_UPLOADS_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(TASK_LABELS_FILE)) {
    fs.writeFileSync(TASK_LABELS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Read all tasks from the JSON file
 */
export function readTasks(): Task[] {
  ensureTaskDataFiles();
  
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

/**
 * Write tasks array to the JSON file
 */
export function writeTasks(tasks: Task[]): void {
  ensureTaskDataFiles();
  
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error writing tasks file:', error);
    throw new Error('Failed to save task data');
  }
}

/**
 * Read all task labels from the JSON file
 */
export function readTaskLabels(): TaskLabel[] {
  ensureTaskDataFiles();
  
  try {
    const data = fs.readFileSync(TASK_LABELS_FILE, 'utf8');
    return JSON.parse(data) as TaskLabel[];
  } catch (error) {
    console.error('Error reading task labels file:', error);
    return [];
  }
}

/**
 * Write task labels array to the JSON file
 */
export function writeTaskLabels(labels: TaskLabel[]): void {
  ensureTaskDataFiles();
  
  try {
    fs.writeFileSync(TASK_LABELS_FILE, JSON.stringify(labels, null, 2));
  } catch (error) {
    console.error('Error writing task labels file:', error);
    throw new Error('Failed to save task label data');
  }
}

/**
 * Find tasks by user ID
 */
export function findTasksByUserId(userId: string): Task[] {
  const tasks = readTasks();
  return tasks.filter(task => task.userId === userId);
}

/**
 * Find tasks by user ID and status
 */
export function findTasksByUserIdAndStatus(userId: string, status: TaskStatus): Task[] {
  const tasks = readTasks();
  return tasks.filter(task => task.userId === userId && task.status === status);
}

/**
 * Find a task by ID
 */
export function findTaskById(id: string): Task | null {
  const tasks = readTasks();
  return tasks.find(task => task.id === id) || null;
}

/**
 * Find a task by ID and user ID (for authorization)
 */
export function findTaskByIdAndUserId(id: string, userId: string): Task | null {
  const tasks = readTasks();
  return tasks.find(task => task.id === id && task.userId === userId) || null;
}

/**
 * Create a new task
 */
export function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const tasks = readTasks();
  
  const newTask: Task = {
    ...taskData,
    id: generateTaskId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  tasks.push(newTask);
  writeTasks(tasks);
  
  return newTask;
}

/**
 * Update an existing task
 */
export function updateTask(id: string, userId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>): Task | null {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(task => task.id === id && task.userId === userId);
  
  if (taskIndex === -1) {
    return null;
  }
  
  const updatedTask: Task = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  tasks[taskIndex] = updatedTask;
  writeTasks(tasks);
  
  return updatedTask;
}

/**
 * Delete a task
 */
export function deleteTask(id: string, userId: string): boolean {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(task => task.id === id && task.userId === userId);
  
  if (taskIndex === -1) {
    return false;
  }
  
  // Delete associated files
  const task = tasks[taskIndex];
  task.files.forEach(file => {
    try {
      const filePath = path.join(TASK_UPLOADS_DIR, file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting task file:', error);
    }
  });
  
  tasks.splice(taskIndex, 1);
  writeTasks(tasks);
  
  return true;
}

/**
 * Delete all tasks with Done status for a specific user
 */
export function deleteAllDoneTasks(userId: string): number {
  const tasks = readTasks();
  const doneTasks = tasks.filter(task => task.userId === userId && task.status === 'Done');
  
  // Delete associated files for all done tasks
  doneTasks.forEach(task => {
    task.files.forEach(file => {
      try {
        const filePath = path.join(TASK_UPLOADS_DIR, file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting task file:', error);
      }
    });
  });
  
  // Remove all done tasks for the user
  const remainingTasks = tasks.filter(task => !(task.userId === userId && task.status === 'Done'));
  writeTasks(remainingTasks);
  
  return doneTasks.length;
}

/**
 * Find a task label by ID
 */
export function findTaskLabelById(id: string): TaskLabel | null {
  const labels = readTaskLabels();
  return labels.find(label => label.id === id) || null;
}

/**
 * Find task labels by IDs
 */
export function findTaskLabelsByIds(ids: string[]): TaskLabel[] {
  const labels = readTaskLabels();
  return labels.filter(label => ids.includes(label.id));
}

/**
 * Create a new task label
 */
export function createTaskLabel(labelData: Omit<TaskLabel, 'id' | 'createdAt' | 'updatedAt'>): TaskLabel {
  const labels = readTaskLabels();
  
  // Check if label with same name already exists
  if (labels.some(label => label.name.toLowerCase() === labelData.name.toLowerCase())) {
    throw new Error('Task label with this name already exists');
  }
  
  const newLabel: TaskLabel = {
    ...labelData,
    id: generateTaskLabelId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  labels.push(newLabel);
  writeTaskLabels(labels);
  
  return newLabel;
}

/**
 * Update an existing task label
 */
export function updateTaskLabel(id: string, updates: Partial<Omit<TaskLabel, 'id' | 'createdAt'>>): TaskLabel | null {
  const labels = readTaskLabels();
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
      throw new Error('Task label with this name already exists');
    }
  }
  
  const updatedLabel: TaskLabel = {
    ...labels[labelIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  labels[labelIndex] = updatedLabel;
  writeTaskLabels(labels);
  
  return updatedLabel;
}

/**
 * Delete a task label
 */
export function deleteTaskLabel(id: string): boolean {
  const labels = readTaskLabels();
  const labelIndex = labels.findIndex(label => label.id === id);
  
  if (labelIndex === -1) {
    return false;
  }
  
  // Remove label from all tasks
  const tasks = readTasks();
  const updatedTasks = tasks.map(task => ({
    ...task,
    labels: task.labels.filter(label => label.id !== id),
    updatedAt: new Date().toISOString(),
  }));
  writeTasks(updatedTasks);
  
  labels.splice(labelIndex, 1);
  writeTaskLabels(labels);
  
  return true;
}

/**
 * Add file to task
 */
export function addFileToTask(taskId: string, userId: string, file: TaskFile): Task | null {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === userId);
  
  if (taskIndex === -1) {
    return null;
  }
  
  const updatedTask: Task = {
    ...tasks[taskIndex],
    files: [...tasks[taskIndex].files, file],
    updatedAt: new Date().toISOString(),
  };
  
  tasks[taskIndex] = updatedTask;
  writeTasks(tasks);
  
  return updatedTask;
}

/**
 * Remove file from task
 */
export function removeFileFromTask(taskId: string, userId: string, fileId: string): Task | null {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === userId);
  
  if (taskIndex === -1) {
    return null;
  }
  
  const task = tasks[taskIndex];
  const fileToRemove = task.files.find(file => file.id === fileId);
  
  if (fileToRemove) {
    // Delete physical file
    try {
      const filePath = path.join(TASK_UPLOADS_DIR, fileToRemove.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting task file:', error);
    }
  }
  
  const updatedTask: Task = {
    ...task,
    files: task.files.filter(file => file.id !== fileId),
    updatedAt: new Date().toISOString(),
  };
  
  tasks[taskIndex] = updatedTask;
  writeTasks(tasks);
  
  return updatedTask;
}

/**
 * Get task uploads directory path
 */
export function getTaskUploadsDir(): string {
  ensureTaskDataFiles();
  return TASK_UPLOADS_DIR;
}

/**
 * Generate default due date (2 days from now)
 */
export function generateDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString();
}

/**
 * Generate a simple task ID
 */
function generateTaskId(): string {
  return 'task_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a simple task label ID
 */
function generateTaskLabelId(): string {
  return 'task_label_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a simple task file ID
 */
export function generateTaskFileId(): string {
  return 'task_file_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}