import React, { useState } from 'react';
import { Label, CreateLabelRequest } from '@/types/note';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LabelManagerProps {
  labels: Label[];
  onCreateLabel: (data: CreateLabelRequest) => Promise<void>;
  onDeleteLabel: (labelId: string) => Promise<void>;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#2ed573', '#ffa502', '#3742fa', '#2f3542', '#ff3838'
];

export const LabelManager: React.FC<LabelManagerProps> = ({ 
  labels, 
  onCreateLabel, 
  onDeleteLabel,
  isLoading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Label name is required';
    } else if (labels.some(label => label.name.toLowerCase() === name.trim().toLowerCase())) {
      newErrors.name = 'A label with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onCreateLabel({
        name: name.trim(),
        color: selectedColor,
      });
      
      // Reset form
      setName('');
      setSelectedColor(PRESET_COLORS[0]);
      setErrors({});
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating label:', error);
    }
  };

  const handleDelete = async (labelId: string, labelName: string) => {
    if (window.confirm(`Are you sure you want to delete the label "${labelName}"? This will remove it from all notes.`)) {
      try {
        await onDeleteLabel(labelId);
      } catch (error) {
        console.error('Error deleting label:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setName('');
    setSelectedColor(PRESET_COLORS[0]);
    setErrors({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Labels</h3>
        <button
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          + Add Label
        </button>
      </div>

      {/* Label List */}
      <div className="space-y-2 mb-4">
        {labels.map((label) => (
          <div key={label.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: label.color }}
              />
              <span className="text-gray-900">{label.name}</span>
            </div>
            <button
              onClick={() => handleDelete(label.id, label.name)}
              disabled={isLoading}
              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete label"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        
        {labels.length === 0 && (
          <p className="text-gray-500 text-sm italic py-4 text-center">
            No labels created yet
          </p>
        )}
      </div>

      {/* Create Label Form */}
      {isOpen && (
        <div className="border-t pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="labelName" className="block text-sm font-medium text-gray-700 mb-1">
                Label Name
              </label>
              <input
                type="text"
                id="labelName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter label name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <LoadingSpinner size="sm" />}
                <span>Create</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};