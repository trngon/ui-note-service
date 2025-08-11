'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSession } from '@/types/auth';
import { Label } from '@/types/note';
import { labelApi } from '@/lib/api/notes';

// Components
import { Sidebar } from '@/components/ui/sidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange (darker)
  '#84cc16', // lime
];

/**
 * Label management page - Dedicated page for managing labels
 */
export default function LabelPage() {
  const router = useRouter();
  
  // Authentication state
  const [user, setUser] = useState<LoginSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Data state
  const [labels, setLabels] = useState<Label[]>([]);
  
  // UI state
  const [isLabelsLoading, setIsLabelsLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  
  // Form state
  const [labelName, setLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Load labels
  useEffect(() => {
    if (user) {
      loadLabels();
    }
  }, [user]);

  const loadLabels = async () => {
    try {
      setIsLabelsLoading(true);
      const fetchedLabels = await labelApi.getLabels();
      setLabels(fetchedLabels);
    } catch (error) {
      console.error('Error loading labels:', error);
    } finally {
      setIsLabelsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!labelName.trim()) {
      newErrors.name = 'Label name is required';
    } else if (labels.some(label => label.name.toLowerCase() === labelName.trim().toLowerCase())) {
      newErrors.name = 'A label with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsCreateLoading(true);
      const newLabel = await labelApi.createLabel({
        name: labelName.trim(),
        color: selectedColor,
      });
      
      setLabels(prev => [...prev, newLabel]);
      
      // Reset form
      setLabelName('');
      setSelectedColor(PRESET_COLORS[0]);
      setErrors({});
    } catch (error) {
      console.error('Error creating label:', error);
      setErrors({ general: 'Failed to create label. Please try again.' });
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleDeleteLabel = async (labelId: string, labelName: string) => {
    if (window.confirm(`Are you sure you want to delete the label "${labelName}"? This will remove it from all notes.`)) {
      try {
        await labelApi.deleteLabel(labelId);
        setLabels(prev => prev.filter(label => label.id !== labelId));
      } catch (error) {
        console.error('Error deleting label:', error);
      }
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        onSignOut={handleSignOut}
        currentPath="/note/label"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Labels</h1>
              <p className="text-gray-600 mt-1">
                Manage your note labels and organize your content
              </p>
            </div>
            
            <button
              onClick={() => router.push('/note')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Notes
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Add Label Button */}
            <div className="mb-8">
              <button
                onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Add Label
              </button>
            </div>

            {/* Existing Labels */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Labels</h2>
              
              {isLabelsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : labels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {labels.map((label) => (
                    <div key={label.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <span
                          className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-gray-900 font-medium">{label.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteLabel(label.id, label.name)}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                        title="Delete label"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No labels created yet</p>
                  <p className="text-gray-400 text-sm mt-1">Create your first label below</p>
                </div>
              )}
            </div>

            {/* Create New Label */}
            <div id="create-form" className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Label</h2>
              
              {errors.general && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleCreateLabel} className="space-y-6">
                <div>
                  <label htmlFor="labelName" className="block text-sm font-medium text-gray-700 mb-2">
                    Label name
                  </label>
                  <input
                    type="text"
                    id="labelName"
                    value={labelName}
                    onChange={(e) => setLabelName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter label name"
                    disabled={isCreateLoading}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        disabled={isCreateLoading}
                        className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                          selectedColor === color 
                            ? 'border-gray-800 scale-110' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isCreateLoading}
                    className="w-full bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCreateLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Creating...</span>
                      </>
                    ) : (
                      'Create Label'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}