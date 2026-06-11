import React, { useState } from 'react';
import { Plus, Database, FileText, Globe, Link, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export function DataSources() {
  const [sources] = useState([
    {
      id: 1,
      name: 'Research Papers Collection',
      type: 'documents',
      status: 'active',
      lastSync: '2 hours ago',
      itemCount: 247,
      size: '1.2 GB'
    },
    {
      id: 2,
      name: 'Personal Website',
      type: 'web',
      status: 'syncing',
      lastSync: 'In progress',
      itemCount: 89,
      size: '340 MB'
    },
    {
      id: 3,
      name: 'Knowledge Base API',
      type: 'api',
      status: 'active',
      lastSync: '15 minutes ago',
      itemCount: 156,
      size: '890 MB'
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'documents': return FileText;
      case 'web': return Globe;
      case 'api': return Link;
      default: return Database;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'syncing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'syncing': return Upload;
      case 'error': return AlertCircle;
      default: return Database;
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Data Sources</h1>
            <p className="text-gray-400">Manage your knowledge sources and data connections</p>
          </div>
          
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
            <Plus className="w-4 h-4 mr-2" />
            Add Source
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Sources', value: '3', change: '+2', color: 'cyan' },
            { label: 'Documents', value: '492', change: '+47', color: 'purple' },
            { label: 'Storage Used', value: '2.4 GB', change: '+340 MB', color: 'green' },
            { label: 'Last Sync', value: '2h ago', change: 'Active', color: 'yellow' }
          ].map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`text-${stat.color}-400 text-sm`}>
                  {stat.change}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Sources List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Connected Sources</h2>
          
          <div className="grid gap-6">
            {sources.map((source) => {
              const Icon = getIcon(source.type);
              const StatusIcon = getStatusIcon(source.status);
              
              return (
                <Card 
                  key={source.id} 
                  className="group relative overflow-hidden bg-gray-900/50 border-gray-700 hover:border-cyan-500/50 transition-all p-6"
                >
                  {/* Glassmorphism effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white">{source.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(source.status)}`} />
                            <span className={`text-sm ${getStatusColor(source.status)}`}>
                              {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            Last sync: {source.lastSync}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Items</p>
                        <p className="text-lg font-semibold text-white">{source.itemCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Size</p>
                        <p className="text-lg font-semibold text-white">{source.size}</p>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {source.type}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
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
            ].map((option, index) => (
              <Card 
                key={index}
                className="group relative overflow-hidden bg-gray-900/50 border-gray-700 hover:border-cyan-500/50 transition-all p-6 cursor-pointer"
              >
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 text-center">
                  <div className="p-4 bg-gray-800/50 rounded-lg mb-4 mx-auto w-fit">
                    <option.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{option.type}</h3>
                  <p className="text-gray-400 text-sm">{option.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}