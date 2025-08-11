import React from 'react';
import { LoginSession } from '@/types/auth';
import { Label } from '@/types/note';
import { LabelFilter } from '@/components/labels/label-filter';
import { LabelManager } from '@/components/labels/label-manager';

interface SidebarProps {
  user: LoginSession;
  labels: Label[];
  selectedLabelId: string | null;
  noteCountByLabel: Record<string, number>;
  onLabelSelect: (labelId: string | null) => void;
  onCreateLabel: (data: { name: string; color: string }) => Promise<void>;
  onDeleteLabel: (labelId: string) => Promise<void>;
  onSignOut: () => void;
  isLabelsLoading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  labels,
  selectedLabelId,
  noteCountByLabel,
  onLabelSelect,
  onCreateLabel,
  onDeleteLabel,
  onSignOut,
  isLabelsLoading = false,
}) => {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          UI Note Service
        </h1>
        <p className="text-sm text-gray-600">
          Organize your thoughts
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Label Filter */}
        <LabelFilter
          labels={labels}
          selectedLabelId={selectedLabelId}
          onLabelSelect={onLabelSelect}
          noteCountByLabel={noteCountByLabel}
        />

        {/* Label Manager */}
        <LabelManager
          labels={labels}
          onCreateLabel={onCreateLabel}
          onDeleteLabel={onDeleteLabel}
          isLoading={isLabelsLoading}
        />
      </div>

      {/* User Profile & Sign Out */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};