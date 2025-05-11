
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

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
};

type AppContextType = {
  sources: Source[];
  addSource: (source: Omit<Source, 'id' | 'dateAdded'>) => void;
  removeSource: (id: string) => void;
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
    pricing: {
      input: 0.01,
      output: 0.03
    }
  },
  {
    id: 'gpt4o_mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Smaller version of GPT-4o with good performance for most tasks.',
    parameterSize: 'medium',
    contextWindow: 128000,
    capabilities: ['text', 'vision', 'code'],
    pricing: {
      input: 0.005,
      output: 0.015
    }
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
    pricing: {
      input: 0.015,
      output: 0.075
    }
  },
  {
    id: 'claude3sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced Claude model for everyday tasks and queries.',
    parameterSize: 'medium',
    contextWindow: 200000,
    capabilities: ['text', 'vision'],
    pricing: {
      input: 0.003,
      output: 0.015
    }
  },
  {
    id: 'claude3haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fastest and most compact Claude model for simple tasks.',
    parameterSize: 'small',
    contextWindow: 200000,
    capabilities: ['text', 'vision'],
    pricing: {
      input: 0.00025,
      output: 0.00125
    }
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
  }
];

// Sample website sources
const sampleWebsites: Source[] = [
  {
    id: '1',
    type: 'website',
    name: 'Wikipedia - Artificial Intelligence',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    dateAdded: new Date('2023-03-15')
  },
  {
    id: '2',
    type: 'website',
    name: 'Stanford Encyclopedia - Philosophy of AI',
    url: 'https://plato.stanford.edu/entries/artificial-intelligence/',
    dateAdded: new Date('2023-04-10')
  }
];

// Create provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [sources, setSources] = useState<Source[]>(() => {
    const savedSources = localStorage.getItem('thoughtweb-sources');
    return savedSources ? JSON.parse(savedSources) : sampleWebsites;
  });
  
  const [availableModels] = useState<LLMModel[]>(modelsList);
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(() => {
    const savedModel = localStorage.getItem('thoughtweb-selected-model');
    return savedModel ? JSON.parse(savedModel) : modelsList.find(m => m.provider === 'OpenAI' && m.defaultModel) || modelsList[0];
  });
  
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [temperature, setTemperature] = useState<number>(() => {
    const savedTemp = localStorage.getItem('thoughtweb-temperature');
    return savedTemp ? parseFloat(savedTemp) : 0.7;
  });
  
  const [selectedStorage, setSelectedStorage] = useState<string>(() => {
    const savedStorage = localStorage.getItem('thoughtweb-storage');
    return savedStorage || 'local';
  });

  // Initialize API keys
  const [apiKeys, setApiKeys] = useState<APIKeys>(() => {
    const savedKeys = localStorage.getItem('thoughtweb-api-keys');
    return savedKeys ? JSON.parse(savedKeys) : {
      openai: '',
      anthropic: '',
      huggingface: '',
      openrouter: '',
      pinecone: '',
      supabase: { url: '', key: '' },
      mistral: ''
    };
  });

  // Save to localStorage whenever things change
  useEffect(() => {
    localStorage.setItem('thoughtweb-sources', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('thoughtweb-selected-model', JSON.stringify(selectedModel));
    }
  }, [selectedModel]);
  
  useEffect(() => {
    localStorage.setItem('thoughtweb-api-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);
  
  useEffect(() => {
    localStorage.setItem('thoughtweb-temperature', temperature.toString());
  }, [temperature]);
  
  useEffect(() => {
    localStorage.setItem('thoughtweb-storage', selectedStorage);
  }, [selectedStorage]);

  // Set API key for a provider
  const setApiKey = (provider: keyof APIKeys, value: string | {url: string, key: string}) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  // Add a new source
  const addSource = (source: Omit<Source, 'id' | 'dateAdded'>) => {
    const newSource: Source = {
      ...source,
      id: Date.now().toString(),
      dateAdded: new Date()
    };
    setSources([...sources, newSource]);
  };

  // Remove a source
  const removeSource = (id: string) => {
    setSources(sources.filter(source => source.id !== id));
  };

  // Real API call to Hugging Face
  const callHuggingFaceAPI = async (promptText: string, model: LLMModel) => {
    if (!apiKeys.huggingface) {
      throw new Error("Hugging Face API key not set");
    }
    
    const endpoint = model.apiEndpoint || "mistralai/Mistral-7B-Instruct-v0.2";
    const apiUrl = `https://api-inference.huggingface.co/models/${endpoint}`;
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKeys.huggingface}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: promptText,
          parameters: {
            temperature: temperature,
            max_new_tokens: 500,
            return_full_text: false
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to call Hugging Face API");
      }
      
      const result = await response.json();
      return result[0].generated_text;
    } catch (error: any) {
      console.error("Hugging Face API error:", error);
      throw error;
    }
  }

  // Submit a query to the AI
  const submitQuery = async () => {
    if (!query.trim() || !selectedModel) {
      toast({
        title: "Query Error",
        description: "Please enter a query and select a model",
        variant: "destructive"
      });
      return;
    }
    
    setIsQuerying(true);
    
    try {
      // Check the provider and make the appropriate API call
      if (selectedModel.provider === "Huggingface" && apiKeys.huggingface) {
        // Real Hugging Face API call
        const promptWithContext = `Based on the following sources: ${sources.map(s => s.name).join(", ")}, answer this question: ${query}`;
        const response = await callHuggingFaceAPI(promptWithContext, selectedModel);
        setQueryResult(response);
      } else {
        // Simulated response for other providers or when API key isn't set
        // This would be replaced with actual API calls in a production app
        setTimeout(() => {
          const response = generateSimulatedResponse(query, sources, selectedModel);
          setQueryResult(response);
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: "Query Failed",
        description: error.message || "Failed to process your query",
        variant: "destructive"
      });
      console.error("Query error:", error);
    } finally {
      setIsQuerying(false);
    }
  };

  // Function to generate a simulated response
  const generateSimulatedResponse = (
    query: string, 
    sources: Source[], 
    model: LLMModel
  ): string => {
    // For demo purposes, we'll generate a response that mentions the query, 
    // the model being used, and the number of sources available
    const websiteCount = sources.filter(s => s.type === 'website').length;
    const fileCount = sources.filter(s => s.type === 'file').length;
    const bookmarkCount = sources.filter(s => s.type === 'bookmark').length;
    
    return `Based on your query "${query}", I've analyzed your ${websiteCount} website sources, ${fileCount} document sources, and ${bookmarkCount} bookmark sources using ${model.name} by ${model.provider}.

Here's what I found:

The concept you're asking about appears in multiple sources, with varying perspectives. From the web content, there are several key insights that might be relevant:

1. The fundamental principles relate to information processing and knowledge representation.
2. There are competing methodologies for approaching this problem.
3. Recent developments suggest new directions for research.

If you'd like more specific information, you could refine your query or focus on a particular aspect of the topic.

(Note: This is a simulated response for demonstration purposes. To get real responses, please add API keys for the selected provider in Settings.)`;
  };

  const contextValue: AppContextType = {
    sources,
    addSource,
    removeSource,
    availableModels,
    selectedModel,
    setSelectedModel,
    query,
    setQuery,
    queryResult,
    isQuerying,
    submitQuery,
    apiKeys,
    setApiKey,
    temperature,
    setTemperature,
    selectedStorage,
    setSelectedStorage
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
