
import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Brain, AlertCircle, Sparkles, FileText, Lightbulb, GitCompare, Globe, FileStack, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { PRODUCT_NAME } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Index = () => {
  const { 
    query, 
    setQuery, 
    submitQuery, 
    isQuerying, 
    availableModels,
    selectedModel,
    setSelectedModel,
    apiKeys,
    searchInternet,
    setSearchInternet,
    conversations,
    currentConversationId,
    currentMessages,
    fetchConversations,
    createConversation,
    loadConversation,
    deleteConversation,
  } = useAppContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didAutoLoad = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-load most recent conversation on mount (only once)
  useEffect(() => {
    if (!didAutoLoad.current && conversations.length > 0 && !currentConversationId) {
      didAutoLoad.current = true;
      loadConversation(conversations[0].id);
    }
  }, [conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSubmit = () => {
    if (!query.trim() || isQuerying || !selectedModel) return;
    submitQuery();
  };

  const handleNewChat = async () => {
    lastQueryResult.current = null;
    await createConversation();
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

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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

          <div className="flex items-center gap-3">
            {/* New Chat Button */}
            <Button
              onClick={handleNewChat}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs border-fog-border text-midnight-navy hover:bg-ghost-canvas"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Chat
            </Button>

            {/* Conversations Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs border-fog-border text-midnight-navy hover:bg-ghost-canvas min-w-[140px] justify-start"
                >
                  <MessageSquare className="w-3 h-3 mr-2" />
                  {currentConversationId 
                    ? conversations.find(c => c.id === currentConversationId)?.title || 'Current Chat'
                    : 'Select Chat'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-white border-fog-border" align="end">
                <div className="max-h-[400px] overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-ink">
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map((convo) => (
                      <div
                        key={convo.id}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-ghost-canvas cursor-pointer border-b border-fog-border last:border-0 ${
                          currentConversationId === convo.id ? 'bg-ghost-canvas' : ''
                        }`}
                        onClick={() => loadConversation(convo.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-midnight-navy truncate">
                            {convo.title}
                          </p>
                          <p className="text-xs text-slate-ink">
                            {formatRelativeTime(convo.updated_at || convo.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(convo.id);
                          }}
                          className="ml-2 p-1 text-slate-ink hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

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
