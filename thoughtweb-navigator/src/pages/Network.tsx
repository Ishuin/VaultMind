import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Wifi, Globe, Server, Activity, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Network() {
  const [connections] = useState([
    {
      id: 1,
      name: 'Primary Data Center',
      type: 'server',
      status: 'connected',
      latency: '12ms',
      bandwidth: '1.2 Gbps',
      location: 'US East',
      uptime: '99.9%'
    },
    {
      id: 2,
      name: 'OpenAI API',
      type: 'api',
      status: 'connected',
      latency: '45ms',
      bandwidth: '500 Mbps',
      location: 'Global',
      uptime: '99.8%'
    },
    {
      id: 3,
      name: 'Document Storage',
      type: 'storage',
      status: 'connected',
      latency: '8ms',
      bandwidth: '2.1 Gbps',
      location: 'US West',
      uptime: '100%'
    },
    {
      id: 4,
      name: 'Backup Server',
      type: 'server',
      status: 'warning',
      latency: '156ms',
      bandwidth: '200 Mbps',
      location: 'EU Central',
      uptime: '98.2%'
    }
  ]);

  const networkStats = [
    { label: 'Total Connections', value: '4', status: 'good' },
    { label: 'Avg. Latency', value: '55ms', status: 'good' },
    { label: 'Total Bandwidth', value: '4.0 Gbps', status: 'excellent' },
    { label: 'Network Uptime', value: '99.7%', status: 'good' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Activity;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return Server;
      case 'api': return Globe;
      case 'storage': return Activity;
      default: return Wifi;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Network</h1>
            <p className="text-gray-400">Monitor network connections and performance</p>
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {networkStats.map((stat, index) => (
              <div key={index} className="group relative overflow-hidden glass-panel p-6 rounded-3xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-cyan-400" />
                    <Badge 
                      variant="outline" 
                      className={`${
                        stat.status === 'excellent' ? 'border-green-500 text-green-400' :
                        stat.status === 'good' ? 'border-cyan-500 text-cyan-400' :
                        'border-yellow-500 text-yellow-400'
                      }`}
                    >
                      {stat.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Network Topology */}
          <div className="glass-panel p-6 rounded-3xl mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">Network Topology</h3>
            
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="relative">
                {/* Central Hub */}
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                
                {/* Connection Lines and Nodes */}
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gray-800 border-2 border-green-400 rounded-full flex items-center justify-center">
                    <Server className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="absolute top-12 left-1/2 w-px h-24 bg-green-400 transform -translate-x-1/2"></div>
                </div>
                
                <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gray-800 border-2 border-cyan-400 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="absolute bottom-12 left-1/2 w-px h-24 bg-cyan-400 transform -translate-x-1/2"></div>
                </div>
                
                <div className="absolute top-1/2 -left-24 transform -translate-y-1/2">
                  <div className="w-12 h-12 bg-gray-800 border-2 border-purple-400 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="absolute top-1/2 left-12 w-24 h-px bg-purple-400 transform -translate-y-1/2"></div>
                </div>
                
                <div className="absolute top-1/2 -right-24 transform -translate-y-1/2">
                  <div className="w-12 h-12 bg-gray-800 border-2 border-yellow-400 rounded-full flex items-center justify-center">
                    <Server className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="absolute top-1/2 right-12 w-24 h-px bg-yellow-400 transform -translate-y-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Connections */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Active Connections</h2>
            
            <div className="grid gap-4">
              {connections.map((connection) => {
                const StatusIcon = getStatusIcon(connection.status);
                const TypeIcon = getTypeIcon(connection.type);
                
                return (
                  <div 
                    key={connection.id}
                    className="group relative overflow-hidden glass-panel hover:border-cyan-500/50 transition-all p-6 rounded-3xl"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                          <TypeIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-white">{connection.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(connection.status)}`} />
                              <span className={`text-sm ${getStatusColor(connection.status)}`}>
                                {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">
                              {connection.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Latency</p>
                          <p className="text-lg font-semibold text-white">{connection.latency}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Bandwidth</p>
                          <p className="text-lg font-semibold text-white">{connection.bandwidth}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Uptime</p>
                          <p className="text-lg font-semibold text-white">{connection.uptime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Network Health */}
          <div className="glass-panel p-6 rounded-3xl mt-8">
            <h3 className="text-xl font-semibold text-white mb-6">Network Health</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: 'Connection Quality', 
                  value: 95, 
                  color: 'green',
                  description: 'Excellent connection stability'
                },
                { 
                  label: 'Response Time', 
                  value: 88, 
                  color: 'cyan',
                  description: 'Good average response times'
                },
                { 
                  label: 'Error Rate', 
                  value: 12, 
                  color: 'yellow',
                  description: 'Low error occurrence rate'
                }
              ].map((metric, index) => (
                <div 
                  key={index}
                  className="group relative overflow-hidden glass-panel rounded-lg p-4"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{metric.label}</p>
                      <span className={`text-${metric.color}-400 font-bold`}>{metric.value}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`bg-${metric.color}-400 h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-sm">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Network;
