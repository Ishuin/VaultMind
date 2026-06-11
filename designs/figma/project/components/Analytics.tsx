import React from 'react';
import { BarChart3, TrendingUp, Eye, Search, Clock, Users } from 'lucide-react';
import { Card } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
    { name: 'AI/ML', value: 35, color: '#06b6d4' },
    { name: 'Research', value: 25, color: '#8b5cf6' },
    { name: 'Technology', value: 20, color: '#10b981' },
    { name: 'Business', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#ef4444' }
  ];

  const performanceData = [
    { metric: 'Response Time', value: '1.2s', change: '-15%', trend: 'down' },
    { metric: 'Accuracy', value: '94.7%', change: '+2.3%', trend: 'up' },
    { metric: 'Sources Used', value: '247', change: '+12', trend: 'up' },
    { metric: 'User Satisfaction', value: '4.8/5', change: '+0.2', trend: 'up' }
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Insights into your knowledge navigation patterns</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Search, label: 'Total Queries', value: '1,247', change: '+12%', color: 'cyan' },
            { icon: Eye, label: 'Documents Viewed', value: '89', change: '+8%', color: 'purple' },
            { icon: Clock, label: 'Avg. Session', value: '24m', change: '+5%', color: 'green' },
            { icon: Users, label: 'Knowledge Score', value: '94%', change: '+3%', color: 'yellow' }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="group relative overflow-hidden bg-gray-900/50 border-gray-700 p-6">
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 text-${metric.color}-400`} />
                    <div className={`text-${metric.color}-400 text-sm flex items-center gap-1`}>
                      <TrendingUp className="w-4 h-4" />
                      {metric.change}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{metric.label}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Trends */}
          <Card className="bg-gray-900/50 border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Usage Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line type="monotone" dataKey="queries" stroke="#06b6d4" strokeWidth={2} />
                <Line type="monotone" dataKey="documents" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Topic Distribution */}
          <Card className="bg-gray-900/50 border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Query Topics</h3>
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
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
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
                  <span className="text-sm text-gray-300">{topic.name}</span>
                  <span className="text-sm text-gray-400">{topic.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-gray-900/50 border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {performanceData.map((metric, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all"
              >
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <p className="text-gray-400 text-sm mb-2">{metric.metric}</p>
                  <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                  <div className={`text-sm flex items-center gap-1 ${
                    metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    {metric.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900/50 border-gray-700 p-6 mt-8">
          <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { time: '2 hours ago', action: 'Queried about machine learning algorithms', result: '5 relevant sources found' },
              { time: '4 hours ago', action: 'Uploaded new research paper', result: 'Successfully indexed 47 pages' },
              { time: '6 hours ago', action: 'Analyzed data patterns', result: '3 new insights generated' },
              { time: '1 day ago', action: 'Connected new data source', result: 'API integration completed' }
            ].map((activity, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all"
              >
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-sm">{activity.result}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}