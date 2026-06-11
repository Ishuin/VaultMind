import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  Network, 
  Shield, 
  Settings, 
  CreditCard, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data-sources', label: 'Data Sources', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-900/90 backdrop-blur-sm border-r border-gray-800 transition-all duration-300 z-50 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-cyan-400 font-semibold">ThoughtWeb</h1>
              <p className="text-xs text-gray-400">SYSTEM ONLINE • 15:34:07</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4">
        {!collapsed && <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Navigation</p>}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                
                {/* Glassmorphism hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ${collapsed ? 'hidden' : ''}`}></div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status */}
      {!collapsed && (
        <div className="absolute bottom-20 left-4 right-4">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">System Status</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">System Load</span>
                <span className="text-sm text-cyan-400">42%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-cyan-400 h-1 rounded-full w-[42%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Storage</span>
                <span className="text-sm text-purple-400">28%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-purple-400 h-1 rounded-full w-[28%]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Ishu Kumar</p>
              <p className="text-xs text-gray-400 truncate">ishu.kumar@gmail.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}