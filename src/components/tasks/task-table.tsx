import React from 'react';
import { Task, TaskStatus } from '@/types/task';

interface TaskTableProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskViewDetails?: (task: Task) => void;
  isLoading?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskViewDetails,
  isLoading = false,
}) => {
  const getStatusBadge = (status: TaskStatus) => {
    const statusStyles = {
      'Todo': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Done': 'bg-green-100 text-green-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };

  const getDueDateStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, className: 'text-red-600 font-medium' };
    } else if (diffDays === 0) {
      return { text: 'Due today', className: 'text-orange-600 font-medium' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', className: 'text-yellow-600' };
    } else {
      return { text: `Due in ${diffDays} days`, className: 'text-gray-600' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-1/3 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task
            </th>
            <th scope="col" className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th scope="col" className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Labels
            </th>
            <th scope="col" className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              Created
            </th>
            <th scope="col" className="w-1/12 relative px-3 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => {
            const dueDateStatus = getDueDateStatus(task.dueDate);
            
            return (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <div className="min-w-0">
                    <button
                      onClick={() => onTaskViewDetails?.(task)}
                      className="text-left block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md w-full"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate hover:text-indigo-600" title={task.title}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1" title={task.content}>
                        {task.content.substring(0, 50)}{task.content.length > 50 ? '...' : ''}
                      </p>
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => onTaskStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-full"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </td>
                <td className="px-3 py-3">
                  <div className="text-xs min-w-0">
                    <p className={`${dueDateStatus.className} truncate`} title={dueDateStatus.text}>
                      {dueDateStatus.text}
                    </p>
                    <p className="text-gray-500 truncate">{formatDate(task.dueDate)}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="min-w-0">
                    {task.labels.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <span
                          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: task.labels[0].color }}
                          title={task.labels.map(l => l.name).join(', ')}
                        />
                        <span className="text-xs text-gray-600 truncate">
                          {task.labels.length === 1 ? task.labels[0].name : `${task.labels.length} labels`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No labels</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500 hidden sm:table-cell">
                  <div className="truncate" title={formatDate(task.createdAt)}>
                    {formatDate(task.createdAt).replace(/,.*/, '')}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onTaskEdit(task)}
                      className="text-indigo-600 hover:text-indigo-900 text-xs p-1"
                      title="Edit task"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="text-red-600 hover:text-red-900 text-xs p-1"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
};