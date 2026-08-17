
import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, FileText, Globe, Link, Upload, CheckCircle, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import FileUploader from '@/components/sources/FileUploader';

const Sources = () => {
  const { sources, fetchSources, removeSource, clearSources } = useAppContext();
  const [showUploader, setShowUploader] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-refresh sources that are still processing
  useEffect(() => {
    const hasProcessingSources = sources.some(s => s.processingStatus === 'processing');
    
    if (hasProcessingSources) {
      // Refresh every 3 seconds while there are processing sources
      refreshIntervalRef.current = setInterval(() => {
        fetchSources();
      }, 3000);
    } else if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [sources, fetchSources]);

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
      <div className="min-h-screen bg-ghost-canvas p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-semibold text-midnight-navy mb-2">Data Sources</h1>
              <p className="text-slate-ink">Manage your knowledge sources and data connections</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => fetchSources()}
                className="border-fog-border"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  if (!confirm('Delete all sources? This cannot be undone.')) return;
                  await clearSources();
                }}
                className="border-fog-border text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
              <Button 
                className="btn-primary"
                onClick={() => setShowUploader(!showUploader)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showUploader ? 'Hide Uploader' : 'Add Source'}
              </Button>
            </div>
          </div>

          {showUploader && (
            <div className="mb-8">
              <FileUploader />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Sources', value: sources.length.toString(), change: '', color: 'bg-midnight-navy' },
              { label: 'Documents', value: sources.filter(s => s.type === 'file').length.toString(), change: '', color: 'bg-violet-600' },
              { label: 'Processing', value: sources.filter(s => s.processingStatus === 'processing').length.toString(), change: '', color: 'bg-amber-600' },
              { label: 'Failed', value: sources.filter(s => s.processingStatus === 'failed').length.toString(), change: '', color: 'bg-red-600' }
            ].map((stat, index) => (
              <div key={index} className="card-section">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-ink text-sm">{stat.label}</p>
                    <p className="text-2xl font-semibold text-midnight-navy">{stat.value}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Sources List */}
          <div className="space-y-6">
            <h2 className="text-xl font-display font-semibold text-midnight-navy">Connected Sources</h2>
            
            <div className="grid gap-6">
              {sources.map((source) => {
                const Icon = getIcon(source.type === 'file' ? 'documents' : source.type === 'website' ? 'web' : 'api');
                
                return (
                  <div 
                    key={source.id} 
                    className="group relative overflow-hidden bg-white border border-fog-border hover:border-chartreuse transition-all p-6 rounded-xl shadow-ant-card"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-ghost-canvas rounded-lg">
                          <Icon className="w-6 h-6 text-midnight-navy" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-midnight-navy">{source.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            {source.processingStatus === 'processing' ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-amber-600">Processing...</span>
                              </div>
                            ) : source.processingStatus === 'failed' ? (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-600">Failed{source.processingError ? `: ${source.processingError}` : ''}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-emerald-600">Active</span>
                              </div>
                            )}
                            <span className="text-sm text-slate-ink">
                              Added: {new Date(source.dateAdded).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <Badge variant="outline" className="border-fog-border text-midnight-navy">
                          {source.type}
                        </Badge>
                        {source.fileType && (
                          <Badge variant="outline" className="border-fog-border text-midnight-navy">
                            {source.fileType.toUpperCase()}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(source.id)}
                          disabled={deletingId === source.id}
                          className="text-slate-ink hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className={`w-4 h-4 ${deletingId === source.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sources.length === 0 && (
                <div className="text-center py-12 bg-white border border-fog-border rounded-xl shadow-ant-card">
                  <p className="text-slate-ink">No sources found. Add your first source to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add New Source Section */}
          <div className="mt-12">
            <h2 className="text-xl font-display font-semibold text-midnight-navy mb-6">Add New Source</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  type: 'Documents', 
                  icon: FileText, 
                  desc: 'Upload PDFs, Word docs, and text files',
                  color: 'bg-midnight-navy'
                },
                { 
                  type: 'Website', 
                  icon: Globe, 
                  desc: 'Connect web pages and RSS feeds',
                  color: 'bg-violet-600'
                },
                { 
                  type: 'API', 
                  icon: Link, 
                  desc: 'Integrate external data sources',
                  color: 'bg-emerald-600'
                }
              ].map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <div 
                    key={index}
                    className="group relative overflow-hidden bg-white border border-fog-border hover:border-chartreuse transition-all p-6 cursor-pointer rounded-xl shadow-ant-card"
                  >
                    <div className="relative z-10 text-center">
                      <div className={`p-4 ${option.color} rounded-lg mb-4 mx-auto w-fit`}>
                        <IconComponent className="w-8 h-8 text-chartreuse" />
                      </div>
                      <h3 className="text-lg font-semibold text-midnight-navy mb-2">{option.type}</h3>
                      <p className="text-slate-ink text-sm">{option.desc}</p>
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
