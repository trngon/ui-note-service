import React from 'react';
import { Task, TaskStatus } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: TaskStatus) => {
    e.stopPropagation();
    onStatusChange(task.id, newStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border border-gray-200 hover:border-indigo-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
          {task.title}
        </h3>
        <div className="flex items-center space-x-1 ml-2">
          {/* Status Dropdown */}
          <div className="relative group">
            <button className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              {getAvailableStatuses(task.status).map((status) => (
                <button
                  key={status}
                  onClick={(e) => handleStatusChange(e, status)}
                  className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${getStatusColor(status)}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1 w-20 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={handleEdit}
                className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-md"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-b-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
        {task.content}
      </p>

      {/* Due Date */}
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {dueDateInfo.text}
      </div>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Files */}
      {task.files.length > 0 && (
        <div className="flex items-center text-gray-500 text-xs">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {task.files.length} file{task.files.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Created {formatDate(task.createdAt)}
        </span>
        {task.updatedAt !== task.createdAt && (
          <span className="text-xs text-gray-500">
            Updated {formatDate(task.updatedAt)}
          </span>
        )}
      </div>
    </div>
  );
};