import React from 'react';
import { Task, TaskStatus } from '@/types/task';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!isOpen || !task) return null;

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

  const getAvailableStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
    const allStatuses: TaskStatus[] = ['Todo', 'In Progress', 'Done'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const handleEdit = () => {
    onEdit(task);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(task.id, newStatus);
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h3>
          </div>

          {/* Status and Due Date */}
          <div className="flex items-center space-x-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative group">
                <button className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {getAvailableStatuses(task.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${getStatusColor(status)}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dueDateInfo.text}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{task.content}</p>
            </div>
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
          <div className="pt-6 border-t border-gray-200 mb-6">
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

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Edit Task
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Task
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};