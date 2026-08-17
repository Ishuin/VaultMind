
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import { useAuth } from './AuthContext';

// Define types for our context
type Source = {
  id: string;
  type: 'website' | 'file' | 'bookmark';
  name: string;
  url?: string;
  filePath?: string;
  fileType?: 'pdf' | 'doc' | 'txt' | 'bookmark';
  dateAdded: Date;
  content?: string;
  processingStatus?: 'processing' | 'completed' | 'failed';
  processingError?: string | null;
};

type LLMModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  parameterSize?: string;
  contextWindow?: number;
  capabilities?: string[];
  apiKey?: string;
  pricing?: {
    input: number;
    output: number;
  };
  apiEndpoint?: string;
  defaultModel?: boolean;
};

type APIKeys = {
  openai: string;
  anthropic: string;
  huggingface: string;
  openrouter: string;
  pinecone: string;
  supabase: { url: string; key: string };
  mistral: string;
  google: string;
  nvidia: string;
};

type Conversation = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string | null;
};

type ChatMessage = {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: CitationSource[];
};

type CitationSource = {
  id: number;
  document_id?: number;
  filename: string;
  source_type: string; // "pdf", "docx", "text", "web"
  page?: number;
  section?: string;
  line_start?: number;
  line_end?: number;
  paragraph_start?: number;
  paragraph_end?: number;
  url?: string;
  snippet?: string;
  relevance_score?: number;
};

type AppContextType = {
  sources: Source[];
  fetchSources: () => Promise<void>;
  fetchOllamaModels: () => Promise<void>;
  fetchNimModels: () => Promise<void>;
  addSource: (source: Omit<Source, 'id' | 'dateAdded'>) => void;
  uploadFile: (file: File) => Promise<void>;
  removeSource: (id: string) => void;
  clearSources: () => Promise<void>;
  availableModels: LLMModel[];
  selectedModel: LLMModel | null;
  setSelectedModel: (model: LLMModel) => void;
  query: string;
  setQuery: (query: string) => void;
  queryResult: string | null;
  isQuerying: boolean;
  submitQuery: () => void;
  apiKeys: APIKeys;
  setApiKey: (provider: keyof APIKeys, value: string | {url: string, key: string}) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  selectedStorage: string;
  setSelectedStorage: (value: string) => void;
  searchInternet: boolean;
  setSearchInternet: (value: boolean) => void;
  conversations: Conversation[];
  currentConversationId: number | null;
  currentMessages: ChatMessage[];
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<void>;
  loadConversation: (id: number) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  setCurrentConversationId: (id: number | null) => void;
  setCurrentMessages: (messages: ChatMessage[]) => void;
};

// Create the context
const AppContext = createContext<AppContextType | null>(null);

// Enhanced models data
const modelsList: LLMModel[] = [
  {
    id: 'gpt4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Latest multimodal model with vision capabilities and strong reasoning.',
    parameterSize: 'large',
    contextWindow: 128000,
    capabilities: ['text', 'vision', 'code'],
    defaultModel: true,
    pricing: { input: 0.01, output: 0.03 }
  },
  {
    id: 'gpt4o_mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Smaller version of GPT-4o with good performance for most tasks.',
    parameterSize: 'medium',
    contextWindow: 128000,
    capabilities: ['text', 'vision', 'code'],
    pricing: { input: 0.005, output: 0.015 }
  },
  {
    id: 'claude3opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable Claude model for complex tasks, reasoning, and creative content.',
    parameterSize: 'large',
    contextWindow: 200000,
    capabilities: ['text', 'vision', 'code'],
    defaultModel: true,
    pricing: { input: 0.015, output: 0.075 }
  },
  {
    id: 'claude3sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced Claude model for everyday tasks and queries.',
    parameterSize: 'medium',
    contextWindow: 200000,
    capabilities: ['text', 'vision'],
    pricing: { input: 0.003, output: 0.015 }
  },
  {
    id: 'claude3haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fastest and most compact Claude model for simple tasks.',
    parameterSize: 'small',
    contextWindow: 200000,
    capabilities: ['text', 'vision'],
    pricing: { input: 0.00025, output: 0.00125 }
  },
  {
    id: 'llama3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'Open-source model with broad capabilities and strong reasoning.',
    parameterSize: 'medium',
    contextWindow: 8192,
    capabilities: ['text', 'code'],
    defaultModel: true
  },
  {
    id: 'llama3-8b',
    name: 'Llama 3 8B',
    provider: 'Meta',
    description: 'Compact Llama 3 model for efficient deployment.',
    parameterSize: 'small',
    contextWindow: 8192,
    capabilities: ['text']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Advanced multimodal capabilities and knowledge.',
    parameterSize: 'medium',
    contextWindow: 32768,
    capabilities: ['text', 'vision', 'code'],
    defaultModel: true
  },
  {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    provider: 'Google',
    description: 'Faster, more efficient model for quick responses.',
    parameterSize: 'small',
    contextWindow: 16384,
    capabilities: ['text', 'code']
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'Strong reasoning capabilities and efficient performance.',
    parameterSize: 'medium',
    contextWindow: 32768,
    capabilities: ['text', 'code'],
    defaultModel: true
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral AI',
    description: 'Mixture of experts model with strong performance for its size.',
    parameterSize: 'medium',
    contextWindow: 32768,
    capabilities: ['text', 'code']
  },
  {
    id: 'huggingface-llama3',
    name: 'Llama 3',
    provider: 'Huggingface',
    description: 'Llama 3 hosted on HuggingFace Inference API.',
    parameterSize: 'medium',
    contextWindow: 8192,
    capabilities: ['text', 'code'],
    apiEndpoint: 'meta-llama/Meta-Llama-3-70B-Instruct',
    defaultModel: true
  },
  {
    id: 'huggingface-mistral',
    name: 'Mistral 7B',
    provider: 'Huggingface',
    description: 'Mistral 7B Instruct model via HuggingFace Inference API.',
    parameterSize: 'small',
    contextWindow: 32768,
    capabilities: ['text', 'code'],
    apiEndpoint: 'mistralai/Mistral-7B-Instruct-v0.2'
  },
  {
    id: 'ollama-llama3',
    name: 'Llama 3 (Ollama)',
    provider: 'Ollama',
    description: 'Run Llama 3 locally with Ollama, no API costs.',
    parameterSize: 'medium',
    contextWindow: 8192,
    capabilities: ['text', 'code'],
    defaultModel: true
  },
  {
    id: 'ollama-mistral',
    name: 'Mistral (Ollama)',
    provider: 'Ollama',
    description: 'Run Mistral locally with Ollama, no API costs.',
    parameterSize: 'small',
    contextWindow: 8192,
    capabilities: ['text', 'code']
  },
  {
    id: 'nim-llama-3.1-8b',
    name: 'Llama 3.1 8B Instruct',
    provider: 'NVIDIA NIM',
    description: 'Meta Llama 3.1 8B via NVIDIA NIM cloud inference.',
    parameterSize: 'small',
    contextWindow: 128000,
    capabilities: ['text', 'code'],
    apiEndpoint: 'meta/llama-3.1-8b-instruct',
    defaultModel: true
  },
  {
    id: 'nim-llama-3.1-70b',
    name: 'Llama 3.1 70B Instruct',
    provider: 'NVIDIA NIM',
    description: 'Meta Llama 3.1 70B via NVIDIA NIM for complex reasoning.',
    parameterSize: 'large',
    contextWindow: 128000,
    capabilities: ['text', 'code'],
    apiEndpoint: 'meta/llama-3.1-70b-instruct'
  },
  {
    id: 'nim-nemotron-nano-9b',
    name: 'Nemotron Nano 9B v2',
    provider: 'NVIDIA NIM',
    description: 'NVIDIA Nemotron Nano 9B — efficient, high-quality responses.',
    parameterSize: 'small',
    contextWindow: 128000,
    capabilities: ['text', 'code'],
    apiEndpoint: 'nvidia/nvidia-nemotron-nano-9b-v2'
  },
  {
    id: 'nim-nemotron-3-nano',
    name: 'Nemotron 3 Nano 30B',
    provider: 'NVIDIA NIM',
    description: 'NVIDIA Nemotron 3 Nano — balanced performance and speed.',
    parameterSize: 'medium',
    contextWindow: 128000,
    capabilities: ['text', 'code'],
    apiEndpoint: 'nvidia/nemotron-3-nano-30b-a3b'
  },
  {
    id: 'nim-phi-3-mini',
    name: 'Phi-3 Mini 128K',
    provider: 'NVIDIA NIM',
    description: 'Microsoft Phi-3 Mini with 128K context via NVIDIA NIM.',
    parameterSize: 'small',
    contextWindow: 128000,
    capabilities: ['text', 'code'],
    apiEndpoint: 'microsoft/phi-3-mini-128k-instruct'
  },
  {
    id: 'nim-gemma-2-9b',
    name: 'Gemma 2 9B IT',
    provider: 'NVIDIA NIM',
    description: 'Google Gemma 2 9B instruction-tuned model via NVIDIA NIM.',
    parameterSize: 'small',
    contextWindow: 8192,
    capabilities: ['text', 'code'],
    apiEndpoint: 'google/gemma-2-9b-it'
  }
];

const sampleWebsites: Source[] = [
  {
    id: '1', type: 'website', name: 'Wikipedia - Artificial Intelligence',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence', dateAdded: new Date('2023-03-15')
  },
  {
    id: '2', type: 'website', name: 'Stanford Encyclopedia - Philosophy of AI',
    url: 'https://plato.stanford.edu/entries/artificial-intelligence/', dateAdded: new Date('2023-04-10')
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  console.log("AppProvider State:", { isAuthenticated, username: user?.username });

  // 1. Core State & Config
  const [sources, setSources] = useState<Source[]>(() => {
    const savedSources = localStorage.getItem('thoughtweb-sources');
    return savedSources ? JSON.parse(savedSources) : sampleWebsites;
  });

  const [apiKeys, setApiKeys] = useState<APIKeys>(() => {
    const savedKeys = localStorage.getItem('thoughtweb-api-keys');
    const defaults: APIKeys = {
      openai: '', anthropic: '', huggingface: '', openrouter: '',
      pinecone: '', supabase: { url: '', key: '' }, mistral: '', google: '', nvidia: ''
    };
    if (!savedKeys) return defaults;
    return { ...defaults, ...JSON.parse(savedKeys) };
  });

  const [temperature, setTemperature] = useState<number>(() => {
    const savedTemp = localStorage.getItem('thoughtweb-temperature');
    return savedTemp ? parseFloat(savedTemp) : 0.7;
  });
  
  const [selectedStorage, setSelectedStorage] = useState<string>(() => {
    const savedStorage = localStorage.getItem('thoughtweb-storage');
    return savedStorage || 'local';
  });

  const [searchInternet, setSearchInternetState] = useState<boolean>(() => {
    const saved = localStorage.getItem('thoughtweb-search-internet');
    return saved ? saved === 'true' : false;
  });

  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [nimModels, setNimModels] = useState<LLMModel[]>([]);
  const [openRouterModels, setOpenRouterModels] = useState<LLMModel[]>([]);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);

  // 2. Data Fetching
  
  const fetchOllamaModels = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const models = await apiFetch('/chat/models');
      setOllamaModels(models);
      console.log("Discovered Ollama models:", models);
    } catch (error) {
      console.error("Failed to fetch Ollama models:", error);
    }
  }, [isAuthenticated]);

  const fetchNimModels = useCallback(async () => {
    if (!isAuthenticated || !apiKeys.nvidia) return;
    try {
      const models = await apiFetch('/chat/nim-models', {
        headers: { 'X-Nvidia-Api-Key': apiKeys.nvidia },
      });
      const dynamicNimModels: LLMModel[] = models.map((m: { id: string; name: string }) => ({
        id: `nim-${m.id.replace(/\//g, '-')}`,
        name: m.name,
        provider: 'NVIDIA NIM',
        description: `NVIDIA NIM hosted model: ${m.id}`,
        parameterSize: 'medium',
        contextWindow: 128000,
        capabilities: ['text', 'code'],
        apiEndpoint: m.id,
      }));
      setNimModels(dynamicNimModels);
      console.log("Discovered NVIDIA NIM models:", dynamicNimModels.length);
    } catch (error) {
      console.error("Failed to fetch NVIDIA NIM models:", error);
    }
  }, [isAuthenticated, apiKeys.nvidia]);

  const fetchOpenRouterModels = useCallback(async () => {
    if (!isAuthenticated || !apiKeys.openrouter) return;
    try {
      const models = await apiFetch('/chat/openrouter-models', {
        headers: { 'X-OpenRouter-Api-Key': apiKeys.openrouter },
      });
      const dynamicOpenRouterModels: LLMModel[] = models.map((m: { id: string; name: string }) => ({
        id: `or-${m.id.replace(/\//g, '-')}`,
        name: m.name,
        provider: 'OpenRouter',
        description: `OpenRouter model: ${m.id}`,
        parameterSize: 'medium',
        contextWindow: 128000,
        capabilities: ['text', 'code'],
        apiEndpoint: m.id,
      }));
      setOpenRouterModels(dynamicOpenRouterModels);
      console.log("Discovered OpenRouter models:", dynamicOpenRouterModels.length);
    } catch (error) {
      console.error("Failed to fetch OpenRouter models:", error);
    }
  }, [isAuthenticated, apiKeys.openrouter]);

  const fetchSources = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiFetch('/sources/');
      const formattedSources = data.map((doc: any) => ({
        id: doc.id.toString(),
        type: 'file',
        name: doc.filename,
        fileType: doc.content_type.includes('pdf')
          ? 'pdf'
          : doc.content_type.includes('word') || doc.filename?.endsWith('.docx')
            ? 'doc'
            : 'txt',
        dateAdded: new Date(doc.created_at),
        processingStatus: doc.processing_status || 'completed',
        processingError: doc.processing_error || null
      }));
      setSources(formattedSources);
    } catch (error: any) {
      console.error('Failed to fetch sources:', error);
    }
  }, [isAuthenticated]);

  // 3. Effects

  // Initial Data Load (Conditional)
  useEffect(() => {
    if (isAuthenticated) {
      fetchSources();
      fetchOllamaModels();
      fetchNimModels();
      fetchOpenRouterModels();
    }
  }, [isAuthenticated, fetchSources, fetchOllamaModels, fetchNimModels, fetchOpenRouterModels]);

  useEffect(() => {
    if (isAuthenticated && apiKeys.nvidia) {
      fetchNimModels();
    } else {
      setNimModels([]);
    }
  }, [apiKeys.nvidia, isAuthenticated, fetchNimModels]);

  useEffect(() => {
    if (isAuthenticated && apiKeys.openrouter) {
      fetchOpenRouterModels();
    } else {
      setOpenRouterModels([]);
    }
  }, [apiKeys.openrouter, isAuthenticated, fetchOpenRouterModels]);

  // Update available models list
  useEffect(() => {
    // 1. Start with cloud models that have keys
    const filteredCloud = modelsList.filter(model => {
      if (model.provider === "Ollama") return false; // Handle Ollama separately
      
      switch (model.provider.toLowerCase()) {
        case 'openai': return !!apiKeys.openai;
        case 'anthropic': return !!apiKeys.anthropic;
        case 'huggingface': return !!apiKeys.huggingface;
        case 'openrouter': return !!apiKeys.openrouter;
        case 'mistral ai': return !!apiKeys.mistral;
        case 'google': return !!apiKeys.google;
        case 'nvidia nim': return !!apiKeys.nvidia;
        case 'meta': return false; // Llama is handled via Ollama/HF/NIM
        default: return false; // Hide unknown providers by default
      }
    });

    // 2. Map discovered Ollama models to model objects
    const dynamicOllamaModels = ollamaModels.map(name => ({
      id: `ollama-${name}`,
      name: name,
      provider: 'Ollama',
      description: `Locally running model: ${name}`,
      parameterSize: 'local',
      capabilities: ['text', 'code'],
      contextWindow: 8192
    }));

    // 3. Prefer dynamically discovered NIM models when available, else static list
    const nimModelsToShow = nimModels.length > 0
      ? nimModels
      : filteredCloud.filter(m => m.provider === 'NVIDIA NIM');

    const openRouterModelsToShow = openRouterModels.length > 0
      ? openRouterModels
      : filteredCloud.filter(m => m.provider === 'OpenRouter');

    const otherCloud = filteredCloud.filter(m => m.provider !== 'NVIDIA NIM' && m.provider !== 'OpenRouter');

    setAvailableModels([...dynamicOllamaModels, ...nimModelsToShow, ...openRouterModelsToShow, ...otherCloud]);
  }, [ollamaModels, nimModels, openRouterModels, apiKeys]);

  // Default model selection
  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      const savedModel = localStorage.getItem('thoughtweb-selected-model');
      if (savedModel) {
        try {
          const parsed = JSON.parse(savedModel);
          const found = availableModels.find(m => m.id === parsed.id);
          if (found) { setSelectedModel(found); return; }
        } catch (e) {}
      }
      const ollamaDefault = availableModels.find(m => m.id === 'ollama-llama3');
      setSelectedModel(ollamaDefault || availableModels[0]);
    }
  }, [availableModels, selectedModel]);

  // Persistence
  useEffect(() => { localStorage.setItem('thoughtweb-sources', JSON.stringify(sources)); }, [sources]);
  useEffect(() => { if (selectedModel) localStorage.setItem('thoughtweb-selected-model', JSON.stringify(selectedModel)); }, [selectedModel]);
  useEffect(() => { localStorage.setItem('thoughtweb-api-keys', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { localStorage.setItem('thoughtweb-temperature', temperature.toString()); }, [temperature]);
  useEffect(() => { localStorage.setItem('thoughtweb-storage', selectedStorage); }, [selectedStorage]);
  useEffect(() => { localStorage.setItem('thoughtweb-search-internet', searchInternet.toString()); }, [searchInternet]);

  // 4. Actions

  const setApiKey = (provider: keyof APIKeys, value: string | {url: string, key: string}) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const setSearchInternet = async (value: boolean) => {
    setSearchInternetState(value);
    try {
      await apiFetch('/users/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search_internet: value }),
      });
    } catch {
      // Backend sync failed, local state still updated
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await apiFetch('/conversations');
      setConversations(data);
    } catch (e) {
      console.error("Failed to fetch conversations:", e);
    }
  };

  const createConversation = async () => {
    try {
      const data = await apiFetch('/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setConversations(prev => [data, ...prev]);
      setCurrentConversationId(data.id);
      setCurrentMessages([]);
      setQueryResult(null);
    } catch (e) {
      console.error("Failed to create conversation:", e);
    }
  };

  const loadConversation = async (id: number) => {
    try {
      const data = await apiFetch(`/conversations/${id}`);
      setCurrentConversationId(id);
      setCurrentMessages(data.messages || []);
      setQueryResult(null);
    } catch (e) {
      console.error("Failed to load conversation:", e);
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      await apiFetch(`/conversations/${id}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setCurrentMessages([]);
      }
    } catch {
      // Failed to delete conversation
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiFetch('/sources/upload', { method: 'POST', body: formData });
      toast({ title: "Success", description: `${file.name} has been uploaded and is being processed.` });
      await fetchSources();
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const addSource = (source: Omit<Source, 'id' | 'dateAdded'>) => {
    setSources([...sources, { ...source, id: Date.now().toString(), dateAdded: new Date() }]);
  };

  const removeSource = async (id: string) => {
    const source = sources.find(s => s.id === id);
    if (source?.type === 'file') {
      try {
        await apiFetch(`/sources/${id}`, { method: 'DELETE' });
      } catch (error: any) {
        toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        return;
      }
    }
    setSources(sources.filter(source => source.id !== id));
  };

  const clearSources = async () => {
    try {
      await apiFetch('/sources/', { method: 'DELETE' });
      setSources([]);
      toast({ title: "Cleared", description: "All sources have been removed." });
    } catch (error: any) {
      toast({ title: "Clear Failed", description: error.message, variant: "destructive" });
    }
  };

  const submitQuery = async () => {
    if (!query.trim() || !selectedModel) {
      toast({ title: "Query Error", description: "Please enter a query and select a model", variant: "destructive" });
      return;
    }
    setIsQuerying(true);
    setQueryResult(null);
    
    // Create user message for immediate display
    const userMessage: ChatMessage = {
      id: Date.now(),
      conversation_id: currentConversationId || 0,
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };
    setCurrentMessages(prev => [...prev, userMessage]);
    
    const currentQuery = query;
    setQuery("");
    
    try {
      let data;
      if (selectedModel.provider === "NVIDIA NIM" && !apiKeys.nvidia) {
        toast({ title: "API Key Missing", description: "Add your NVIDIA NIM API key in Settings.", variant: "destructive" });
        return;
      }
      if (selectedModel.provider === "NVIDIA NIM") {
        data = await apiFetch('/chat/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: currentQuery,
            model: selectedModel.apiEndpoint,
            provider: 'nvidia',
            api_key: apiKeys.nvidia,
            search_internet: searchInternet,
            conversation_id: currentConversationId,
          }),
        });
      } else if (selectedModel.provider === "Ollama") {
        data = await apiFetch('/chat/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: currentQuery,
            model: selectedModel.name,
            search_internet: searchInternet,
            conversation_id: currentConversationId,
          }),
        });
      } else if (selectedModel.provider === "Meta" || selectedModel.provider === "Google" || selectedModel.provider === "Mistral AI") {
        data = await apiFetch('/chat/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: currentQuery, model: null, search_internet: searchInternet, conversation_id: currentConversationId }),
        });
      } else {
        data = { response: "This provider is not yet connected to the RAG backend." };
      }
      
      setQueryResult(data.response);

      // Add assistant message directly — keeps messages in sync regardless of component mount state
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        conversation_id: currentConversationId || data.conversation_id || 0,
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
        sources: data.sources || [],
      };
      setCurrentMessages(prev => [...prev, assistantMessage]);

      // Update conversation ID if a new conversation was created
      if (!currentConversationId && data.conversation_id) {
        setCurrentConversationId(data.conversation_id);
      }
      fetchConversations();
    } catch (error: any) {
      toast({ title: "Query Failed", description: error.message || "Failed to process your query", variant: "destructive" });
    } finally {
      setIsQuerying(false);
    }
  };

  const contextValue: AppContextType = {
    sources, fetchSources, fetchOllamaModels, fetchNimModels, addSource, uploadFile, removeSource, clearSources,
    availableModels, selectedModel, setSelectedModel, query, setQuery,
    queryResult, isQuerying, submitQuery, apiKeys, setApiKey,
    temperature, setTemperature, selectedStorage, setSelectedStorage,
    searchInternet, setSearchInternet,
    conversations, currentConversationId, currentMessages,
    fetchConversations, createConversation, loadConversation, deleteConversation,
    setCurrentConversationId, setCurrentMessages
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
