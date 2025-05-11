
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ModelSelector from '@/components/llm/ModelSelector';
import QueryInterface from '@/components/query/QueryInterface';
import { Brain } from 'lucide-react';

const Index = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4"> {/* Adjusted container for consistency */}
        <div className="mb-8 text-center">
          <div className="inline-block relative mb-4">
            {/* Conditional gradient glow for dark mode only */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00f6ff] via-[#ff00e5] to-[#3300ff] blur-xl opacity-0 dark:opacity-30 animate-pulse"></div>
            <div className="relative flex items-center justify-center h-16 w-16 mx-auto">
              <Brain size={32} className="text-primary dark:text-[#00f6ff] dark:glow-text" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary dark:text-[#00f6ff] dark:glow-text mb-2">ThoughtWeb Navigator</h1>
          <p className="text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Your AI-powered second brain that helps you navigate through your personal web of knowledge from various sources.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass-panel p-6 rounded-3xl"> {/* Added glass-panel styling */}
            <ModelSelector />
          </div>
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl"> {/* Added glass-panel styling */}
            <QueryInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
