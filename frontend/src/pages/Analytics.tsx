import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TrendingUp, Eye, Search, Clock, Users } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';

export function Analytics() {
  const usageData = [
    { name: 'Mon', queries: 45, documents: 12 },
    { name: 'Tue', queries: 52, documents: 19 },
    { name: 'Wed', queries: 48, documents: 16 },
    { name: 'Thu', queries: 61, documents: 23 },
    { name: 'Fri', queries: 55, documents: 18 },
    { name: 'Sat', queries: 38, documents: 14 },
    { name: 'Sun', queries: 42, documents: 11 }
  ];

  const topicsData = [
    { name: 'AI/ML', value: 35, color: '#101729' },
    { name: 'Research', value: 25, color: '#6b7280' },
    { name: 'Technology', value: 20, color: '#d0f100' },
    { name: 'Business', value: 15, color: '#9ca3af' },
    { name: 'Other', value: 5, color: '#e5e7eb' }
  ];

  const performanceData = [
    { metric: 'Response Time', value: '1.2s', change: '-15%', trend: 'down' },
    { metric: 'Accuracy', value: '94.7%', change: '+2.3%', trend: 'up' },
    { metric: 'Sources Used', value: '247', change: '+12', trend: 'up' },
    { metric: 'User Satisfaction', value: '4.8/5', change: '+0.2', trend: 'up' }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-ghost-canvas p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-midnight-navy mb-2">Analytics</h1>
            <p className="text-slate-ink">Insights into your knowledge navigation patterns</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Search, label: 'Total Queries', value: '1,247', change: '+12%' },
              { icon: Eye, label: 'Documents Viewed', value: '89', change: '+8%' },
              { icon: Clock, label: 'Avg. Session', value: '24m', change: '+5%' },
              { icon: Users, label: 'Knowledge Score', value: '94%', change: '+3%' }
            ].map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-midnight-navy/5 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-midnight-navy" />
                    </div>
                    <div className="text-chartreuse text-sm flex items-center gap-1 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {metric.change}
                    </div>
                  </div>
                  <p className="text-slate-ink text-sm">{metric.label}</p>
                  <p className="text-2xl font-bold text-midnight-navy">{metric.value}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Usage Trends */}
            <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
              <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Usage Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#101729'
                    }} 
                  />
                  <Line type="monotone" dataKey="queries" stroke="#101729" strokeWidth={2} />
                  <Line type="monotone" dataKey="documents" stroke="#d0f100" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Topic Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
              <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Query Topics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#101729'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {topicsData.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: topic.color }}
                    ></div>
                    <span className="text-sm text-slate-ink">{topic.name}</span>
                    <span className="text-sm text-slate-ink/60">{topic.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
            <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {performanceData.map((metric, index) => (
                <div 
                  key={index}
                  className="p-4 bg-ghost-canvas rounded-xl"
                >
                  <p className="text-slate-ink text-sm mb-2">{metric.metric}</p>
                  <p className="text-2xl font-bold text-midnight-navy mb-1">{metric.value}</p>
                  <div className={`text-sm flex items-center gap-1 ${
                    metric.trend === 'up' ? 'text-chartreuse' : 'text-slate-ink/60'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    {metric.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm mt-8">
            <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { time: '2 hours ago', action: 'Queried about machine learning algorithms', result: '5 relevant sources found' },
                { time: '4 hours ago', action: 'Uploaded new research paper', result: 'Successfully indexed 47 pages' },
                { time: '6 hours ago', action: 'Analyzed data patterns', result: '3 new insights generated' },
                { time: '1 day ago', action: 'Connected new data source', result: 'API integration completed' }
              ].map((activity, index) => (
                <div 
                  key={index}
                  className="p-4 bg-ghost-canvas rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-midnight-navy font-medium">{activity.action}</p>
                      <p className="text-slate-ink text-sm">{activity.result}</p>
                    </div>
                    <span className="text-sm text-slate-ink/60">{activity.time}</span>
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

export default Analytics;
