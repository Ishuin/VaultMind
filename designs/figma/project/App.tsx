import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DataSources } from './components/DataSources';
import { Analytics } from './components/Analytics';
import { Network } from './components/Network';
import { Security } from './components/Security';
import { Settings } from './components/Settings';
import { PricingDashboard } from './components/PricingDashboard';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'data-sources':
        return <DataSources />;
      case 'analytics':
        return <Analytics />;
      case 'network':
        return <Network />;
      case 'security':
        return <Security />;
      case 'settings':
        return <Settings />;
      case 'pricing':
        return <PricingDashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {renderContent()}
      </main>
    </div>
  );
}