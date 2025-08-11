import React from 'react';
import { Label } from '@/types/note';

interface LabelFilterProps {
  labels: Label[];
  selectedLabelId: string | null;
  onLabelSelect: (labelId: string | null) => void;
  noteCountByLabel?: Record<string, number>;
}

export const LabelFilter: React.FC<LabelFilterProps> = ({ 
  labels, 
  selectedLabelId, 
  onLabelSelect,
  noteCountByLabel = {}
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Label</h3>
      
      <div className="space-y-2">
        {/* All Notes */}
        <button
          onClick={() => onLabelSelect(null)}
          className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            selectedLabelId === null
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            All Notes
          </span>
          <span className="text-sm text-gray-500">
            {Object.values(noteCountByLabel).reduce((total, count) => total + count, 0)}
          </span>
        </button>

        {/* Individual Labels */}
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => onLabelSelect(label.id)}
            className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              selectedLabelId === label.id
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: label.color }}
              />
              <span className="truncate">{label.name}</span>
            </span>
            <span className="text-sm text-gray-500 ml-2">
              {noteCountByLabel[label.id] || 0}
            </span>
          </button>
        ))}

        {labels.length === 0 && (
          <p className="text-gray-500 text-sm italic px-3 py-2">
            No labels created yet
          </p>
        )}
      </div>
    </div>
  );
};