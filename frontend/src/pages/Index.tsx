
import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Brain, AlertCircle, Sparkles, FileText, Lightbulb, GitCompare, Globe, FileStack } from 'lucide-react';
import { SourceCitation } from '@/components/chat/SourceCitation';
import { PRODUCT_NAME } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const { 
    query, 
    setQuery, 
    submitQuery, 
    isQuerying, 
    availableModels,
    selectedModel,
    setSelectedModel,
    apiKeyStatus,
    searchInternet,
    setSearchInternet,
    currentMessages,
  } = useAppContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSubmit = () => {
    if (!query.trim() || isQuerying || !selectedModel) return;
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
      case 'openai': return !!apiKeyStatus.openai;
      case 'anthropic': return !!apiKeyStatus.anthropic;
      case 'huggingface': return !!apiKeyStatus.huggingface;
      case 'openrouter': return !!apiKeyStatus.openrouter;
      case 'mistral ai': return !!apiKeyStatus.mistral;
      case 'nvidia nim': return !!apiKeyStatus.nvidia;
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-fog-border bg-ghost-canvas">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-midnight-navy rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-chartreuse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-midnight-navy truncate">{PRODUCT_NAME}</h1>
              <p className="text-xs text-slate-ink">Neural Query Interface</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Info — visible when space allows */}
            {selectedModel && (
              <div className="hidden lg:flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${isApiKeySet() ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className={getProviderColor(selectedModel.provider)}>{selectedModel.provider}</span>
                <span className="text-slate-ink">|</span>
                <span className="text-midnight-navy">{selectedModel.name}</span>
              </div>
            )}

            {/* Model Selector */}
            <Select 
              value={selectedModel?.id || ''} 
              onValueChange={(value) => {
                const model = availableModels.find(m => m.id === value);
                if (model) setSelectedModel(model);
              }}
            >
              <SelectTrigger className="w-[180px] h-8 bg-white border-fog-border text-midnight-navy text-xs flex-shrink-0">
                <SelectValue placeholder="Select model">
                  {selectedModel ? `${selectedModel.name} · ${selectedModel.provider}` : 'Select model'}
                </SelectValue>
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
          {currentMessages.length === 0 && !isQuerying ? (
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
            currentMessages.map((message) => (
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
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <SourceCitation sources={message.sources} />
                  )}
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
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setSearchInternet(!searchInternet)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono border transition-colors ${
                searchInternet
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-fog-border bg-white text-slate-ink hover:border-primary/30"
              }`}
            >
              {searchInternet ? <Globe className="w-3 h-3" /> : <FileStack className="w-3 h-3" />}
              {searchInternet ? "Docs + Internet" : "Docs Only"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
