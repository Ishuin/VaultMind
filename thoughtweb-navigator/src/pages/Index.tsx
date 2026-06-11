
import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Brain, AlertCircle, Sparkles, FileText, Lightbulb, GitCompare } from 'lucide-react';
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
      case 'openai': return 'text-emerald-600';
      case 'anthropic': return 'text-violet-600';
      case 'ollama': return 'text-indigo-600';
      case 'nvidia nim': return 'text-lime-600';
      default: return 'text-slate-ink';
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-white rounded-xl border border-fog-border shadow-ant-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-fog-border bg-ghost-canvas">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-midnight-navy rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-chartreuse" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-midnight-navy">{PRODUCT_NAME}</h1>
              <p className="text-xs text-slate-ink">Neural Query Interface</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedModel && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${isApiKeySet() ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className={getProviderColor(selectedModel.provider)}>{selectedModel.provider}</span>
                <span className="text-slate-ink">|</span>
                <span className="text-midnight-navy">{selectedModel.name}</span>
              </div>
            )}

            <Select 
              value={selectedModel?.id || ''} 
              onValueChange={(value) => {
                const model = availableModels.find(m => m.id === value);
                if (model) setSelectedModel(model);
              }}
            >
              <SelectTrigger className="w-[200px] h-9 bg-white border-fog-border text-midnight-navy text-sm">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="bg-white border-fog-border shadow-ant-xl">
                {availableModels.map(model => (
                  <SelectItem key={model.id} value={model.id} className="text-midnight-navy focus:bg-ghost-canvas focus:text-midnight-navy">
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-ghost-canvas rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-midnight-navy" />
              </div>
              <h2 className="text-xl font-display font-semibold text-midnight-navy mb-2">What can I help you with?</h2>
              <p className="text-slate-ink max-w-md">
                Ask questions about your knowledge base, sources, or any topic you'd like to explore.
              </p>
              <div className="flex gap-2 mt-6">
                {[
                  { text: 'Summarize my documents', icon: FileText },
                  { text: 'Find key insights', icon: Lightbulb },
                  { text: 'Compare sources', icon: GitCompare }
                ].map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => setQuery(suggestion.text)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-ink bg-ghost-canvas rounded-full hover:bg-midnight-navy hover:text-white transition-colors"
                  >
                    <suggestion.icon className="w-3 h-3" />
                    {suggestion.text}
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
                      ? 'bg-midnight-navy text-white'
                      : 'bg-ghost-canvas text-midnight-navy border border-fog-border'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-ink">
                      <Sparkles className="w-3 h-3 text-chartreuse" />
                      <span>{selectedModel?.name || 'AI'}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/50' : 'text-slate-ink'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isQuerying && (
            <div className="flex justify-start">
              <div className="bg-ghost-canvas rounded-2xl px-4 py-3 border border-fog-border">
                <div className="flex items-center gap-2 text-slate-ink">
                  <Loader2 className="w-4 h-4 animate-spin text-chartreuse" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-fog-border bg-ghost-canvas">
          {!selectedModel && (
            <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>Select a model to start chatting</span>
            </div>
          )}
          {!isApiKeySet() && selectedModel && !['ollama', 'meta', 'google', 'mistral'].includes(selectedModel.provider.toLowerCase()) && (
            <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
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
              className="flex-1 min-h-[48px] max-h-[120px] bg-white border-fog-border text-midnight-navy placeholder:text-slate-ink resize-none rounded-xl px-4 py-3 text-sm focus:border-chartreuse disabled:opacity-50"
              rows={1}
            />
            <Button
              onClick={handleSubmit}
              disabled={!query.trim() || isQuerying || !selectedModel}
              className="h-[48px] w-[48px] rounded-xl bg-chartreuse hover:bg-chartreuse/90 text-midnight-navy p-0 disabled:opacity-50 disabled:hover:bg-chartreuse"
            >
              {isQuerying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-ink mt-2 text-center">
            {selectedModel ? `Using ${selectedModel.name} via ${selectedModel.provider}` : 'Select a model in the dropdown above'}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
