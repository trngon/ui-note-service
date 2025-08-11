'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  requestBody?: any;
  responses: any;
  tags: string[];
}

/**
 * API Documentation page with custom UI
 */
export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/docs');
        if (!response.ok) {
          throw new Error('Failed to fetch API specification');
        }
        const data = await response.json();
        setSpec(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpec();
  }, []);

  const parseEndpoints = (spec: any): ApiEndpoint[] => {
    if (!spec || !spec.paths) return [];
    
    const endpoints: ApiEndpoint[] = [];
    
    Object.entries(spec.paths).forEach(([path, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, details]: [string, any]) => {
        endpoints.push({
          method: method.toUpperCase(),
          path,
          summary: details.summary || '',
          description: details.description || '',
          requestBody: details.requestBody,
          responses: details.responses,
          tags: details.tags || [],
        });
      });
    });
    
    return endpoints;
  };

  const getStatusColor = (status: string) => {
    if (status.startsWith('2')) return 'text-green-600 bg-green-50';
    if (status.startsWith('4')) return 'text-red-600 bg-red-50';
    if (status.startsWith('5')) return 'text-red-800 bg-red-100';
    return 'text-gray-600 bg-gray-50';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'POST': return 'text-green-600 bg-green-50 border-green-200';
      case 'PUT': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'DELETE': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-red-800">Error Loading Documentation</h3>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const endpoints = parseEndpoints(spec);
  const tags = spec?.tags || [];
  const filteredEndpoints = selectedTag === 'all' 
    ? endpoints 
    : endpoints.filter(e => e.tags.includes(selectedTag));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{spec?.info?.title || 'API Documentation'}</h1>
              <p className="text-gray-600 mt-2">{spec?.info?.description}</p>
              <div className="flex items-center space-x-4 mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Version {spec?.info?.version}
                </span>
                {spec?.servers && spec.servers.length > 0 && (
                  <span className="text-sm text-gray-500">
                    Base URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{spec.servers[0].url}</code>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Back to App
              </Link>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                View JSON
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tags */}
        {tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Endpoints
              </button>
              {tags.map((tag: any) => (
                <button
                  key={tag.name}
                  onClick={() => setSelectedTag(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* API Endpoints */}
        <div className="space-y-6">
          {filteredEndpoints.map((endpoint, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-mono font-bold border ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
                  </div>
                  {endpoint.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{endpoint.summary}</h4>
                {endpoint.description && (
                  <p className="text-gray-600 mb-4">{endpoint.description}</p>
                )}

                {/* Request Body */}
                {endpoint.requestBody && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Request Body</h5>
                    <div className="bg-gray-50 rounded-md p-3">
                      <pre className="text-xs text-gray-800 overflow-x-auto">
                        {JSON.stringify(endpoint.requestBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Responses */}
                {endpoint.responses && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Responses</h5>
                    <div className="space-y-2">
                      {Object.entries(endpoint.responses).map(([status, response]: [string, any]) => (
                        <div key={status} className="border rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${getStatusColor(status)}`}>
                              {status}
                            </span>
                            <span className="text-sm text-gray-600">{response.description}</span>
                          </div>
                          {response.content && (
                            <div className="bg-gray-50 rounded p-2 mt-2">
                              <pre className="text-xs text-gray-800 overflow-x-auto">
                                {JSON.stringify(response.content, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No endpoints found for the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
