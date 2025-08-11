import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './task-card';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  isLoading?: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  isLoading = false,
}) => {
  const columns: { status: TaskStatus; title: string; bgColor: string }[] = [
    { status: 'Todo', title: 'To Do', bgColor: 'bg-gray-50' },
    { status: 'In Progress', title: 'In Progress', bgColor: 'bg-blue-50' },
    { status: 'Done', title: 'Done', bgColor: 'bg-green-50' },
  ];

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const getColumnIcon = (status: TaskStatus) => {
    switch (status) {
      case 'Todo':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'In Progress':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Done':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        
        return (
          <div key={column.status} className="flex-1 min-w-0">
            {/* Column Header */}
            <div className={`${column.bgColor} rounded-lg p-4 mb-4 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getColumnIcon(column.status)}
                  <h2 className="font-semibold text-gray-900">{column.title}</h2>
                </div>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="space-y-3 min-h-96">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <div className="mb-3 opacity-50">
                    {getColumnIcon(column.status)}
                  </div>
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                    onStatusChange={onTaskStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};