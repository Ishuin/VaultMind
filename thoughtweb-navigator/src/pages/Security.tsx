import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Eye, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export function Security() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    encryptionAtRest: true,
    accessLogging: true,
    apiKeyRotation: false,
    sessionTimeout: true
  });

  const securityMetrics = [
    { label: 'Security Score', value: '94/100', status: 'excellent', icon: Shield },
    { label: 'Active Sessions', value: '3', status: 'good', icon: Users },
    { label: 'Failed Attempts', value: '0', status: 'excellent', icon: AlertTriangle },
    { label: 'Last Scan', value: '2h ago', status: 'good', icon: Clock }
  ];

  const securityEvents = [
    {
      id: 1,
      type: 'login',
      description: 'Successful login from new device',
      location: 'San Francisco, CA',
      timestamp: '2 hours ago',
      severity: 'info'
    },
    {
      id: 2,
      type: 'api',
      description: 'API key accessed from authorized IP',
      location: '192.168.1.100',
      timestamp: '4 hours ago',
      severity: 'info'
    },
    {
      id: 3,
      type: 'security',
      description: 'Security scan completed successfully',
      location: 'System',
      timestamp: '6 hours ago',
      severity: 'success'
    },
    {
      id: 4,
      type: 'warning',
      description: 'Unusual access pattern detected',
      location: 'External API',
      timestamp: '1 day ago',
      severity: 'warning'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-cyan-400';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return Users;
      case 'api': return Key;
      case 'security': return Shield;
      case 'warning': return AlertTriangle;
      default: return Eye;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Security</h1>
            <p className="text-gray-400">Monitor and configure security settings</p>
          </div>

          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {securityMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="group relative overflow-hidden glass-panel p-6 rounded-3xl">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-8 h-8 text-cyan-400" />
                      <Badge 
                        variant="outline" 
                        className={`${
                          metric.status === 'excellent' ? 'border-green-500 text-green-400' :
                          metric.status === 'good' ? 'border-cyan-500 text-cyan-400' :
                          'border-yellow-500 text-yellow-400'
                        }`}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{metric.label}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Settings */}
          <div className="glass-panel p-6 rounded-3xl mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">Security Settings</h3>
            
            <div className="space-y-6">
              {[
                {
                  key: 'twoFactor',
                  title: 'Two-Factor Authentication',
                  description: 'Require additional verification for account access',
                  icon: Lock
                },
                {
                  key: 'encryptionAtRest',
                  title: 'Data Encryption at Rest',
                  description: 'Encrypt stored data using AES-256 encryption',
                  icon: Shield
                },
                {
                  key: 'accessLogging',
                  title: 'Access Logging',
                  description: 'Log all access attempts and API calls',
                  icon: Eye
                },
                {
                  key: 'apiKeyRotation',
                  title: 'Automatic API Key Rotation',
                  description: 'Automatically rotate API keys every 90 days',
                  icon: Key
                },
                {
                  key: 'sessionTimeout',
                  title: 'Session Timeout',
                  description: 'Automatically logout after 24 hours of inactivity',
                  icon: Clock
                }
              ].map((setting) => {
                const Icon = setting.icon;
                return (
                  <div 
                    key={setting.key}
                    className="group relative overflow-hidden flex items-center justify-between p-4 glass-panel rounded-lg hover:border-cyan-500/50 transition-all"
                  >
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="p-2 bg-gray-700/50 rounded-lg">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{setting.title}</h4>
                        <p className="text-gray-400 text-sm">{setting.description}</p>
                      </div>
                    </div>
                    
                    <Switch
                      checked={securitySettings[setting.key as keyof typeof securitySettings]}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, [setting.key]: checked }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Events */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Security Events</h3>
            
            <div className="space-y-4">
              {securityEvents.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div 
                    key={event.id}
                    className="group relative overflow-hidden flex items-start justify-between p-4 glass-panel rounded-lg hover:border-cyan-500/50 transition-all"
                  >
                    <div className="relative z-10 flex items-start gap-4 flex-1">
                      <div className="p-2 bg-gray-700/50 rounded-lg">
                        <Icon className={`w-5 h-5 ${getSeverityColor(event.severity)}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{event.description}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-gray-400 text-sm">{event.location}</span>
                          <span className="text-gray-500 text-sm">{event.timestamp}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          event.severity === 'success' ? 'border-green-500 text-green-400' :
                          event.severity === 'warning' ? 'border-yellow-500 text-yellow-400' :
                          event.severity === 'error' ? 'border-red-500 text-red-400' :
                          'border-cyan-500 text-cyan-400'
                        }`}
                      >
                        {event.severity}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="glass-panel p-6 rounded-3xl mt-8">
            <h3 className="text-xl font-semibold text-white mb-6">Security Recommendations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Enable API Key Rotation',
                  description: 'Improve security by automatically rotating your API keys',
                  action: 'Enable Now',
                  priority: 'medium'
                },
                {
                  title: 'Review Access Permissions',
                  description: 'Audit user permissions and remove unnecessary access',
                  action: 'Review',
                  priority: 'low'
                },
                {
                  title: 'Update Security Policies',
                  description: 'Review and update your security policies',
                  action: 'Update',
                  priority: 'low'
                },
                {
                  title: 'Backup Encryption Keys',
                  description: 'Ensure encryption keys are securely backed up',
                  action: 'Backup',
                  priority: 'high'
                }
              ].map((recommendation, index) => (
                <div 
                  key={index}
                  className="group relative overflow-hidden glass-panel rounded-lg p-4 hover:border-cyan-500/50 transition-all"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{recommendation.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${
                          recommendation.priority === 'high' ? 'border-red-500 text-red-400' :
                          recommendation.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                          'border-green-500 text-green-400'
                        }`}
                      >
                        {recommendation.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{recommendation.description}</p>
                    <button className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                      {recommendation.action} →
                    </button>
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

export default Security;
