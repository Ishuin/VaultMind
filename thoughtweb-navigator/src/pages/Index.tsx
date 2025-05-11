
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ModelSelector from '@/components/llm/ModelSelector';
import QueryInterface from '@/components/query/QueryInterface';
import { Brain } from 'lucide-react';

const Index = () => {
  return (
    <MainLayout>
      <div className="container max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-thoughtweb-blue/10 rounded-full">
              <Brain size={48} className="text-thoughtweb-purple" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">ThoughtWeb Navigator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your AI-powered second brain that helps you navigate through your personal web of knowledge from various sources.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ModelSelector />
          </div>
          <div className="lg:col-span-2">
            <QueryInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
