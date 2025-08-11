'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LoginSession } from '@/types/auth';
import { Task, TaskLabel, UpdateTaskRequest, TaskStatus } from '@/types/task';
import { taskApi } from '@/lib/api/tasks';

// Components
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Sidebar } from '@/components/ui/sidebar';

/**
 * Task detail page - View and edit individual task
 */
export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  // Authentication state
  const [user, setUser] = useState<LoginSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Data state
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UpdateTaskRequest>>({});

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

  // Load task
  const loadTask = async () => {
    if (!user || !taskId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTask = await taskApi.getTask(taskId);
      setTask(fetchedTask);
      setEditData({
        title: fetchedTask.title,
        content: fetchedTask.content,
        status: fetchedTask.status,
        dueDate: fetchedTask.dueDate,
      });
    } catch (error) {
      console.error('Error loading task:', error);
      setError('Failed to load task');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when user is available
  useEffect(() => {
    if (user && taskId) {
      loadTask();
    }
  }, [user, taskId]);

  // Event handlers
  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!task || !editData) return;
    
    try {
      await taskApi.updateTask(task.id, editData);
      await loadTask();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleCancel = () => {
    if (task) {
      setEditData({
        title: task.title,
        content: task.content,
        status: task.status,
        dueDate: task.dueDate,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskApi.deleteTask(task.id);
        router.push('/tasks');
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Todo':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar
          user={user}
          onSignOut={handleSignOut}
          currentPath="/tasks"
        />
        <div className="flex-1 flex flex-col ml-64">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Task not found'}
              </h1>
              <button
                onClick={() => router.push('/tasks')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dueDateInfo = formatDueDate(task.dueDate);

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/tasks')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-gray-900">{task.title}</h2>
                )}
              </div>

              {/* Status and Due Date */}
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.status || task.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value as TaskStatus })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={editData.dueDate ? new Date(editData.dueDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {dueDateInfo.text}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.content || ''}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{task.content}</p>
                  </div>
                )}
              </div>

              {/* Labels */}
              {task.labels.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Labels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map((label) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {task.files.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="space-y-2">
                    {task.files.map((file) => (
                      <div key={file.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {file.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
                  </div>
                  {task.updatedAt !== task.createdAt && (
                    <div>
                      <span className="font-medium">Updated:</span> {formatDate(task.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}