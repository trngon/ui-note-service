'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSession } from '@/types/auth';
import { Task, TaskLabel, CreateTaskFormData, UpdateTaskRequest, TaskStatus } from '@/types/task';
import { taskApi, taskLabelApi } from '@/lib/api/tasks';

// Components
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Sidebar } from '@/components/ui/sidebar';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskLabelManager } from '@/components/tasks/task-label-manager';

interface ViewState {
  type: 'board' | 'form';
  task?: Task | null;
}

/**
 * Tasks page - Task management interface for authenticated users
 */
export default function TasksPage() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState<LoginSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  
  // UI state
  const [viewState, setViewState] = useState<ViewState>({ type: 'board' });
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  
  // Loading states
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isLabelsLoading, setIsLabelsLoading] = useState(false);
  const [isTaskActionLoading, setIsTaskActionLoading] = useState(false);

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

  // Load tasks
  const loadTasks = async () => {
    if (!user) return;
    
    setIsTasksLoading(true);
    try {
      const fetchedTasks = await taskApi.getTasks(undefined, selectedLabelId || undefined);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsTasksLoading(false);
    }
  };

  // Load labels
  const loadLabels = async () => {
    if (!user) return;
    
    setIsLabelsLoading(true);
    try {
      const fetchedLabels = await taskLabelApi.getLabels();
      setLabels(fetchedLabels);
    } catch (error) {
      console.error('Error loading task labels:', error);
    } finally {
      setIsLabelsLoading(false);
    }
  };

  // Load data when user is available
  useEffect(() => {
    if (user) {
      loadTasks();
      loadLabels();
    }
  }, [user, selectedLabelId]);

  // Event handlers
  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleFormSave = async (data: CreateTaskFormData | UpdateTaskRequest) => {
    setIsTaskActionLoading(true);
    try {
      if (viewState.task) {
        // Update existing task
        await taskApi.updateTask(viewState.task.id, data as UpdateTaskRequest);
      } else {
        // Create new task
        await taskApi.createTask(data as CreateTaskFormData);
      }
      
      // Reload tasks and return to board view
      await loadTasks();
      setViewState({ type: 'board' });
    } catch (error) {
      console.error('Error saving task:', error);
      throw error; // Re-throw to show error in form
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  const handleFormCancel = () => {
    setViewState({ type: 'board' });
  };

  const handleTaskEdit = (task: Task) => {
    setViewState({ type: 'form', task });
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await taskApi.updateTask(taskId, { status });
      await loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateLabel = async (labelData: { name: string; color: string }) => {
    try {
      await taskLabelApi.createLabel(labelData);
      await loadLabels();
    } catch (error) {
      console.error('Error creating task label:', error);
      throw error;
    }
  };

  const handleLabelFilter = (labelId: string | null) => {
    setSelectedLabelId(labelId);
  };

  // Filter tasks based on selected label
  const filteredTasks = selectedLabelId 
    ? tasks.filter(task => task.labels.some(label => label.id === selectedLabelId))
    : tasks;

  // Task statistics
  const taskStats = {
    total: filteredTasks.length,
    todo: filteredTasks.filter(task => task.status === 'Todo').length,
    inProgress: filteredTasks.filter(task => task.status === 'In Progress').length,
    done: filteredTasks.filter(task => task.status === 'Done').length,
    overdue: filteredTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      return dueDate < now && task.status !== 'Done';
    }).length,
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
        currentPath="/tasks"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>{taskStats.total} total</span>
                {taskStats.overdue > 0 && (
                  <span className="text-red-600 font-medium">
                    {taskStats.overdue} overdue
                  </span>
                )}
              </div>
            </div>
            
            {viewState.type === 'board' && (
              <button
                onClick={() => setViewState({ type: 'form', task: null })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + New Task
              </button>
            )}
          </div>

          {/* Stats Bar */}
          {viewState.type === 'board' && (
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>{taskStats.todo} To Do</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>{taskStats.inProgress} In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>{taskStats.done} Done</span>
              </div>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Main Content */}
          <main className="flex-1 p-6">
            {viewState.type === 'board' && (
              <KanbanBoard
                tasks={filteredTasks}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
                onTaskStatusChange={handleTaskStatusChange}
                isLoading={isTasksLoading}
              />
            )}

            {viewState.type === 'form' && (
              <div className="max-w-2xl mx-auto">
                <TaskForm
                  task={viewState.task}
                  labels={labels}
                  onSave={handleFormSave}
                  onCancel={handleFormCancel}
                  isLoading={isTaskActionLoading}
                />
              </div>
            )}
          </main>

          {/* Sidebar - Labels */}
          {viewState.type === 'board' && (
            <aside className="w-80 bg-white border-l border-gray-200 p-6">
              <TaskLabelManager
                labels={labels}
                onCreateLabel={handleCreateLabel}
                onLabelFilter={handleLabelFilter}
                selectedLabelId={selectedLabelId}
                isLoading={isLabelsLoading}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}