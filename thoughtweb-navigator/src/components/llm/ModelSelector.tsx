
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  SlackIcon, 
  Settings,
  Filter,
  Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ModelSelector = () => {
  const { availableModels, selectedModel, setSelectedModel } = useAppContext();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [filterCapability, setFilterCapability] = useState('all');
  const [localModelPath, setLocalModelPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleModelChange = (modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'meta':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'google':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'huggingface':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'ollama':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'openrouter':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'mistral ai':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getParameterSizeBadge = (size: string) => {
    const sizeMap: Record<string, string> = {
      'small': 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      'medium': 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
      'large': 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200',
    };
    return sizeMap[size] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
  };

  // Apply all filters
  const filteredModels = availableModels.filter(model => {
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = model.name.toLowerCase().includes(query);
      const matchesProvider = model.provider.toLowerCase().includes(query);
      const matchesDescription = model.description.toLowerCase().includes(query);
      if (!matchesName && !matchesProvider && !matchesDescription) {
        return false;
      }
    }
    
    // Provider filter
    if (filterProvider !== 'all' && model.provider.toLowerCase() !== filterProvider.toLowerCase()) {
      return false;
    }
    
    // Size filter
    if (filterSize !== 'all') {
      if (filterSize === 'small' && model.parameterSize !== 'small') return false;
      if (filterSize === 'medium' && model.parameterSize !== 'medium') return false;
      if (filterSize === 'large' && model.parameterSize !== 'large') return false;
    }
    
    // Capability filter
    if (filterCapability !== 'all') {
      if (!model.capabilities?.includes(filterCapability)) return false;
    }
    
    return true;
  });

  // Update selected model if it's filtered out
  useEffect(() => {
    if (selectedModel && !filteredModels.some(m => m.id === selectedModel.id) && filteredModels.length > 0) {
      setSelectedModel(filteredModels[0]);
    }
  }, [filteredModels, selectedModel, setSelectedModel]);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select AI Model</h2>
        <div className="flex space-x-2">
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="meta">Meta</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="huggingface">Hugging Face</SelectItem>
              <SelectItem value="ollama">Ollama</SelectItem>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="mistral ai">Mistral AI</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            aria-label="Toggle advanced filters"
          >
            <Filter size={16} />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Search models by name, provider, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {showAdvancedFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6 space-y-4">
          <h3 className="font-medium text-sm mb-2">Advanced Filters</h3>
          
          <div>
            <label htmlFor="parameter-size" className="block text-sm mb-1">Parameter Size</label>
            <Select value={filterSize} onValueChange={setFilterSize}>
              <SelectTrigger id="parameter-size">
                <SelectValue placeholder="Parameter Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="small">Small (&lt; 10B)</SelectItem>
                <SelectItem value="medium">Medium (10B - 70B)</SelectItem>
                <SelectItem value="large">Large (&gt; 70B)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="capabilities" className="block text-sm mb-1">Capabilities</label>
            <Select value={filterCapability} onValueChange={setFilterCapability}>
              <SelectTrigger id="capabilities">
                <SelectValue placeholder="Capabilities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Capabilities</SelectItem>
                <SelectItem value="text">Text Only</SelectItem>
                <SelectItem value="vision">Vision Enabled</SelectItem>
                <SelectItem value="code">Code Specialized</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ollama">
              <AccordionTrigger className="text-sm font-medium py-2">Ollama Settings</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div>
                    <label htmlFor="ollama-path" className="block text-sm mb-1">
                      Ollama Local Path
                    </label>
                    <Input
                      id="ollama-path"
                      placeholder="http://localhost:11434"
                      value={localModelPath}
                      onChange={(e) => setLocalModelPath(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      The URL where your Ollama server is running
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      
      <RadioGroup 
        value={selectedModel?.id || ''}
        onValueChange={handleModelChange}
        className="space-y-3"
      >
        {filteredModels.length > 0 ? (
          filteredModels.map(model => (
            <div 
              key={model.id}
              className={`flex items-start space-x-3 p-3 rounded-md transition-colors ${
                selectedModel?.id === model.id 
                  ? 'bg-thoughtweb-purple/10 border border-thoughtweb-purple/30 dark:bg-thoughtweb-purple/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Label htmlFor={model.id} className="text-base font-medium cursor-pointer">
                    {model.name}
                  </Label>
                  <Badge className={`${getProviderColor(model.provider)} font-normal`}>
                    {model.provider}
                  </Badge>
                  {model.parameterSize && (
                    <Badge className={`${getParameterSizeBadge(model.parameterSize)} font-normal text-xs`}>
                      {model.parameterSize}
                    </Badge>
                  )}
                  {model.capabilities?.map(capability => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{model.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No models found matching your filters</p>
            <Button 
              variant="link" 
              onClick={() => {
                setFilterProvider('all');
                setFilterSize('all');
                setFilterCapability('all');
              }}
              className="mt-2"
            >
              Reset filters
            </Button>
          </div>
        )}
      </RadioGroup>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" className="w-full" onClick={() => window.location.href = '/settings'}>
          <Settings size={16} className="mr-2" />
          Configure API Keys
        </Button>
      </div>
    </Card>
  );
};

export default ModelSelector;
