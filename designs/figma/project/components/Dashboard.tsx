import React, { useState } from 'react';
import { ChevronDown, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export function Dashboard() {
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [query, setQuery] = useState('');

  const models = [
    {
      name: 'GPT-4o',
      provider: 'OpenAI',
      tags: ['large', 'text', 'vision', 'code'],
      description: 'Latest multimodal model with vision capabilities and strong reasoning.'
    }
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-2">
          ThoughtWeb Navigator
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Your AI-powered second brain that helps you navigate through your personal web of knowledge from various sources.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Model Selection */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Select AI Model</h2>
          
          {/* Provider Dropdown */}
          <div className="mb-4">
            <div className="relative">
              <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors">
                <span>{selectedProvider}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            {models.map((model) => (
              <div 
                key={model.name}
                className="group relative overflow-hidden bg-gray-800/30 border border-gray-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-green-400">{model.provider}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {model.tags.map((tag) => (
                      <span 
                        key={tag}
                        className={`px-2 py-1 text-xs rounded-full ${
                          tag === 'large' ? 'bg-red-500/20 text-red-400' :
                          tag === 'text' ? 'bg-blue-500/20 text-blue-400' :
                          tag === 'vision' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-400">{model.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ask Your Second Brain */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Ask Your Second Brain</h2>
          
          <div className="space-y-4">
            <Textarea
              placeholder="What would you like to know about your sources?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[200px] bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>Using Llama 3 (Ollama)</span>
              </div>
              
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium">
                <Send className="w-4 h-4 mr-2" />
                Ask
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto mt-12">
        <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Import Documents', desc: 'Add new sources to your knowledge base', color: 'cyan' },
            { title: 'Analyze Patterns', desc: 'Discover insights from your data', color: 'purple' },
            { title: 'Generate Reports', desc: 'Create comprehensive summaries', color: 'green' }
          ].map((action, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
            >
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <h4 className="text-lg font-semibold text-white mb-2">{action.title}</h4>
                <p className="text-gray-400 text-sm">{action.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}