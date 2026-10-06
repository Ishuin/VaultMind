import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Wifi, Globe, Server, Activity, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogsPanel } from '@/components/logs/LogsPanel';

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
      case 'connected': return 'text-chartreuse';
      case 'warning': return 'text-slate-ink';
      case 'error': return 'text-red-500';
      default: return 'text-slate-ink/60';
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
      <div className="min-h-screen bg-ghost-canvas p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-midnight-navy mb-2">Network</h1>
            <p className="text-slate-ink">Monitor network connections and performance</p>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
          {/* Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {networkStats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-midnight-navy/5 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-midnight-navy" />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      stat.status === 'excellent' ? 'border-chartreuse text-midnight-navy bg-chartreuse/10' :
                      stat.status === 'good' ? 'border-midnight-navy/20 text-midnight-navy bg-midnight-navy/5' :
                      'border-slate-ink/20 text-slate-ink bg-slate-ink/5'
                    }`}
                  >
                    {stat.status}
                  </Badge>
                </div>
                <p className="text-slate-ink text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-midnight-navy">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Network Topology */}
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm mb-8">
            <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Network Topology</h3>
            
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="relative">
                {/* Central Hub */}
                <div className="w-20 h-20 bg-midnight-navy rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-chartreuse" />
                </div>
                
                {/* Connection Lines and Nodes */}
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-white border-2 border-chartreuse rounded-full flex items-center justify-center">
                    <Server className="w-6 h-6 text-chartreuse" />
                  </div>
                  <div className="absolute top-12 left-1/2 w-px h-24 bg-fog-border transform -translate-x-1/2"></div>
                </div>
                
                <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-white border-2 border-midnight-navy rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-midnight-navy" />
                  </div>
                  <div className="absolute bottom-12 left-1/2 w-px h-24 bg-fog-border transform -translate-x-1/2"></div>
                </div>
                
                <div className="absolute top-1/2 -left-24 transform -translate-y-1/2">
                  <div className="w-12 h-12 bg-white border-2 border-slate-ink/40 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-slate-ink" />
                  </div>
                  <div className="absolute top-1/2 left-12 w-24 h-px bg-fog-border transform -translate-y-1/2"></div>
                </div>
                
                <div className="absolute top-1/2 -right-24 transform -translate-y-1/2">
                  <div className="w-12 h-12 bg-white border-2 border-slate-ink/60 rounded-full flex items-center justify-center">
                    <Server className="w-6 h-6 text-slate-ink/60" />
                  </div>
                  <div className="absolute top-1/2 right-12 w-24 h-px bg-fog-border transform -translate-y-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Connections */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold text-midnight-navy">Active Connections</h2>
            
            <div className="grid gap-4">
              {connections.map((connection) => {
                const StatusIcon = getStatusIcon(connection.status);
                const TypeIcon = getTypeIcon(connection.type);
                
                return (
                  <div 
                    key={connection.id}
                    className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-ghost-canvas rounded-xl">
                          <TypeIcon className="w-6 h-6 text-midnight-navy" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-midnight-navy">{connection.name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(connection.status)}`} />
                              <span className={`text-sm ${getStatusColor(connection.status)}`}>
                                {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                              </span>
                            </div>
                            <span className="text-sm text-slate-ink/60">
                              {connection.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm text-slate-ink/60">Latency</p>
                          <p className="text-lg font-semibold text-midnight-navy">{connection.latency}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-ink/60">Bandwidth</p>
                          <p className="text-lg font-semibold text-midnight-navy">{connection.bandwidth}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-ink/60">Uptime</p>
                          <p className="text-lg font-semibold text-midnight-navy">{connection.uptime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Network Health */}
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm mt-8">
            <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Network Health</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: 'Connection Quality', 
                  value: 95, 
                  description: 'Excellent connection stability'
                },
                { 
                  label: 'Response Time', 
                  value: 88, 
                  description: 'Good average response times'
                },
                { 
                  label: 'Error Rate', 
                  value: 12, 
                  description: 'Low error occurrence rate'
                }
              ].map((metric, index) => (
                <div 
                  key={index}
                  className="p-4 bg-ghost-canvas rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-midnight-navy font-medium">{metric.label}</p>
                    <span className="text-midnight-navy font-bold">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-fog-border rounded-full h-2 mb-2">
                    <div 
                      className="bg-midnight-navy h-2 rounded-full transition-all duration-500"
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-ink/60 text-sm">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
                <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Application Logs</h3>
                <LogsPanel />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

export default Network;
