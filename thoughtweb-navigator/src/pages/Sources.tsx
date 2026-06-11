
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, FileText, Globe, Link, Upload, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import FileUploader from '@/components/sources/FileUploader';

const Sources = () => {
  const { sources, fetchSources, removeSource } = useAppContext();
  const [showUploader, setShowUploader] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;
    setDeletingId(id);
    try {
      await removeSource(id);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'documents': return FileText;
      case 'web': return Globe;
      case 'api': return Link;
      default: return Database;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Data Sources</h1>
              <p className="text-gray-400">Manage your knowledge sources and data connections</p>
            </div>
            
            <Button 
              className="bg-cyan-500 hover:bg-cyan-600 text-black"
              onClick={() => setShowUploader(!showUploader)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {showUploader ? 'Hide Uploader' : 'Add Source'}
            </Button>
          </div>

          {showUploader && (
            <div className="mb-8">
              <FileUploader />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Sources', value: sources.length.toString(), change: '', color: 'cyan' },
              { label: 'Documents', value: sources.filter(s => s.type === 'file').length.toString(), change: '', color: 'purple' },
              { label: 'Websites', value: sources.filter(s => s.type === 'website').length.toString(), change: '', color: 'green' },
              { label: 'Last Sync', value: sources.length > 0 ? 'Recently' : 'Never', change: 'Active', color: 'yellow' }
            ].map((stat, index) => (
              <div key={index} className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`text-${stat.color}-400 text-sm`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sources List */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Connected Sources</h2>
            
            <div className="grid gap-6">
              {sources.map((source) => {
                const Icon = getIcon(source.type === 'file' ? 'documents' : source.type === 'website' ? 'web' : 'api');
                
                return (
                  <div 
                    key={source.id} 
                    className="group relative overflow-hidden glass-panel hover:border-cyan-500/50 transition-all p-6 rounded-3xl"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                          <Icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-white">{source.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`w-4 h-4 text-green-400`} />
                              <span className={`text-sm text-green-400`}>
                                Active
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">
                              Added: {new Date(source.dateAdded).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {source.type}
                        </Badge>
                        {source.fileType && (
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {source.fileType.toUpperCase()}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(source.id)}
                          disabled={deletingId === source.id}
                          className="text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className={`w-4 h-4 ${deletingId === source.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sources.length === 0 && (
                <div className="text-center py-12 glass-panel rounded-3xl">
                  <p className="text-gray-400">No sources found. Add your first source to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add New Source Section */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-6">Add New Source</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  type: 'Documents', 
                  icon: FileText, 
                  desc: 'Upload PDFs, Word docs, and text files',
                  color: 'cyan'
                },
                { 
                  type: 'Website', 
                  icon: Globe, 
                  desc: 'Connect web pages and RSS feeds',
                  color: 'purple'
                },
                { 
                  type: 'API', 
                  icon: Link, 
                  desc: 'Integrate external data sources',
                  color: 'green'
                }
              ].map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div 
                    key={index}
                    className="group relative overflow-hidden glass-panel hover:border-cyan-500/50 transition-all p-6 cursor-pointer rounded-3xl"
                  >
                    <div className="relative z-10 text-center">
                      <div className="p-4 bg-gray-800/50 rounded-lg mb-4 mx-auto w-fit">
                        <IconComponent className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{option.type}</h3>
                      <p className="text-gray-400 text-sm">{option.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Sources;
