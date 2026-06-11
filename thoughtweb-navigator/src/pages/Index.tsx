
import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Brain, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { PRODUCT_NAME } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const Index = () => {
  const { 
    query, 
    setQuery, 
    submitQuery, 
    isQuerying, 
    queryResult,
    availableModels,
    selectedModel,
    setSelectedModel,
    apiKeys
  } = useAppContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (queryResult) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'user' && lastMessage.content === query) {
          newMessages.push({
            id: Date.now().toString(),
            role: 'assistant',
            content: queryResult,
            timestamp: new Date()
          });
        }
        return newMessages;
      });
    }
  }, [queryResult, query]);

  const handleSubmit = () => {
    if (!query.trim() || isQuerying || !selectedModel) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    submitQuery();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isApiKeySet = () => {
    if (!selectedModel) return false;
    switch (selectedModel.provider.toLowerCase()) {
      case 'openai': return !!apiKeys.openai;
      case 'anthropic': return !!apiKeys.anthropic;
      case 'huggingface': return !!apiKeys.huggingface;
      case 'openrouter': return !!apiKeys.openrouter;
      case 'mistral ai': return !!apiKeys.mistral;
      case 'nvidia nim': return !!apiKeys.nvidia;
      case 'ollama':
      case 'meta':
      case 'google':
      case 'mistral':
        return true;
      default:
        return false;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return 'text-green-400';
      case 'anthropic': return 'text-purple-400';
      case 'ollama': return 'text-indigo-400';
      case 'nvidia nim': return 'text-lime-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0B0F19]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">{PRODUCT_NAME}</h1>
              <p className="text-xs text-gray-500">Neural Query Interface</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedModel && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${isApiKeySet() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={getProviderColor(selectedModel.provider)}>{selectedModel.provider}</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">{selectedModel.name}</span>
              </div>
            )}

            <Select 
              value={selectedModel?.id || ''} 
              onValueChange={(value) => {
                const model = availableModels.find(m => m.id === value);
                if (model) setSelectedModel(model);
              }}
            >
              <SelectTrigger className="w-[200px] h-9 bg-white/5 border-white/10 text-white text-sm">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10">
                {availableModels.map(model => (
                  <SelectItem key={model.id} value={model.id} className="text-white focus:bg-white/10 focus:text-white">
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <span className={`text-xs ${getProviderColor(model.provider)}`}>
                        {model.provider}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">What can I help you with?</h2>
              <p className="text-gray-500 max-w-md">
                Ask questions about your knowledge base, sources, or any topic you'd like to explore.
              </p>
              <div className="flex gap-2 mt-6">
                {['Summarize my documents', 'Find key insights', 'Compare sources'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-4 py-2 text-sm text-gray-400 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-cyan-500/20 text-white'
                      : 'bg-white/5 text-gray-200'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-cyan-400">
                      <Brain className="w-3 h-3" />
                      <span>{selectedModel?.name || 'AI'}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-cyan-400/50' : 'text-gray-600'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isQuerying && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-white/5">
          {!selectedModel && (
            <div className="flex items-center gap-2 text-yellow-500 text-sm mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>Select a model to start chatting</span>
            </div>
          )}
          {!isApiKeySet() && selectedModel && !['ollama', 'meta', 'google', 'mistral'].includes(selectedModel.provider.toLowerCase()) && (
            <div className="flex items-center gap-2 text-yellow-500 text-sm mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>API key required for {selectedModel.provider}. Add it in Settings.</span>
            </div>
          )}
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              placeholder={selectedModel ? "Message..." : "Select a model to start..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedModel || isQuerying}
              className="flex-1 min-h-[48px] max-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 resize-none rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 disabled:opacity-50"
              rows={1}
            />
            <Button
              onClick={handleSubmit}
              disabled={!query.trim() || isQuerying || !selectedModel}
              className="h-[48px] w-[48px] rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black p-0 disabled:opacity-50 disabled:hover:bg-cyan-500"
            >
              {isQuerying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            {selectedModel ? `Using ${selectedModel.name} via ${selectedModel.provider}` : 'Select a model in the dropdown above'}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
