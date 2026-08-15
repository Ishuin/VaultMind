import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Shield, Lock, Key, AlertTriangle, Eye, Users, Clock } from 'lucide-react';
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
      case 'success': return 'text-chartreuse';
      case 'warning': return 'text-slate-ink';
      case 'error': return 'text-red-500';
      default: return 'text-midnight-navy';
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
      <div className="min-h-screen bg-ghost-canvas p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-midnight-navy mb-2">Security</h1>
            <p className="text-slate-ink">Monitor and configure security settings</p>
          </div>

          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {securityMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-midnight-navy/5 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-midnight-navy" />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        metric.status === 'excellent' ? 'border-chartreuse text-midnight-navy bg-chartreuse/10' :
                        metric.status === 'good' ? 'border-midnight-navy/20 text-midnight-navy bg-midnight-navy/5' :
                        'border-slate-ink/20 text-slate-ink bg-slate-ink/5'
                      }`}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <p className="text-slate-ink text-sm">{metric.label}</p>
                  <p className="text-2xl font-bold text-midnight-navy">{metric.value}</p>
                </div>
              );
            })}
          </div>

          {/* Security Settings */}
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm mb-8">
            <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Security Settings</h3>
            
            <div className="space-y-4">
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
                    className="flex items-center justify-between p-4 bg-ghost-canvas rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-midnight-navy/5 rounded-lg">
                        <Icon className="w-5 h-5 text-midnight-navy" />
                      </div>
                      <div>
                        <h4 className="text-midnight-navy font-medium">{setting.title}</h4>
                        <p className="text-slate-ink/60 text-sm">{setting.description}</p>
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
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
            <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Recent Security Events</h3>
            
            <div className="space-y-4">
              {securityEvents.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div 
                    key={event.id}
                    className="flex items-start justify-between p-4 bg-ghost-canvas rounded-xl"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-midnight-navy/5 rounded-lg">
                        <Icon className={`w-5 h-5 ${getSeverityColor(event.severity)}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-midnight-navy font-medium">{event.description}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-slate-ink/60 text-sm">{event.location}</span>
                          <span className="text-slate-ink/40 text-sm">{event.timestamp}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          event.severity === 'success' ? 'border-chartreuse text-midnight-navy bg-chartreuse/10' :
                          event.severity === 'warning' ? 'border-slate-ink/20 text-slate-ink bg-slate-ink/5' :
                          event.severity === 'error' ? 'border-red-500/20 text-red-500 bg-red-500/5' :
                          'border-midnight-navy/20 text-midnight-navy bg-midnight-navy/5'
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
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm mt-8">
            <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Security Recommendations</h3>
            
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
                  className="p-4 bg-ghost-canvas rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-midnight-navy font-medium">{recommendation.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`${
                        recommendation.priority === 'high' ? 'border-red-500/20 text-red-500 bg-red-500/5' :
                        recommendation.priority === 'medium' ? 'border-slate-ink/20 text-slate-ink bg-slate-ink/5' :
                        'border-chartreuse text-midnight-navy bg-chartreuse/10'
                      }`}
                    >
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-ink/60 text-sm mb-3">{recommendation.description}</p>
                  <button className="text-midnight-navy text-sm font-medium hover:underline transition-colors">
                    {recommendation.action} →
                  </button>
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
