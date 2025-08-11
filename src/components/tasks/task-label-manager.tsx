import React, { useState } from 'react';
import { TaskLabel, CreateTaskLabelRequest } from '@/types/task';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TaskLabelManagerProps {
  labels: TaskLabel[];
  onCreateLabel: (labelData: CreateTaskLabelRequest) => Promise<void>;
  onLabelFilter: (labelId: string | null) => void;
  selectedLabelId: string | null;
  isLoading?: boolean;
}

export const TaskLabelManager: React.FC<TaskLabelManagerProps> = ({
  labels,
  onCreateLabel,
  onLabelFilter,
  selectedLabelId,
  isLoading = false,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6');
  const [error, setError] = useState('');

  const predefinedColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#ec4899', // pink
    '#6b7280', // gray
    '#84cc16', // lime
  ];

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newLabelName.trim()) {
      setError('Label name is required');
      return;
    }

    try {
      await onCreateLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
      });
      
      // Reset form
      setNewLabelName('');
      setNewLabelColor('#3b82f6');
      setIsCreating(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create label');
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewLabelName('');
    setNewLabelColor('#3b82f6');
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Task Labels</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
        >
          + Add Label
        </button>
      </div>

      {/* Create Label Form */}
      {isCreating && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <form onSubmit={handleCreateLabel} className="space-y-3">
            <div>
              <label htmlFor="labelName" className="block text-sm font-medium text-gray-700 mb-1">
                Label Name
              </label>
              <input
                type="text"
                id="labelName"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Enter label name..."
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewLabelColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newLabelColor === color 
                        ? 'border-gray-900 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-1" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Labels List */}
      <div className="space-y-2">
        {/* All Tasks Filter */}
        <button
          onClick={() => onLabelFilter(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedLabelId === null
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-gray-700 hover:bg-gray-50 border border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>All Tasks</span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
              {labels.reduce((total, label) => total, 0)}
            </span>
          </div>
        </button>

        {/* Individual Label Filters */}
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => onLabelFilter(label.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedLabelId === label.id
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-gray-700 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span>{label.name}</span>
              </div>
              {/* This would show task count per label if we had that data */}
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                0
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {labels.length === 0 && !isCreating && (
        <div className="text-center py-6 text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-sm">No labels created yet</p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-1"
          >
            Create your first label
          </button>
        </div>
      )}
    </div>
  );
};