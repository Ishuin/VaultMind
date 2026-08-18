
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const QueryInterface = () => {
  const { 
    query, 
    setQuery, 
    submitQuery, 
    isQuerying,
    queryResult,
    selectedModel,
    apiKeyStatus
  } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery();
  };

  // Check if API key is set for the selected model's provider
  const isApiKeySet = () => {
    if (!selectedModel) return false;
    
    switch (selectedModel.provider.toLowerCase()) {
      case 'openai':
        return !!apiKeyStatus.openai;
      case 'anthropic':
        return !!apiKeyStatus.anthropic;
      case 'huggingface':
        return !!apiKeyStatus.huggingface;
      case 'openrouter':
        return !!apiKeyStatus.openrouter;
      case 'mistral ai':
        return !!apiKeyStatus.mistral;
      case 'ollama':
        return true; // Ollama is local, no API key needed
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Ask Your Second Brain</h2>
          
          <div className="mb-4">
            <Textarea
              placeholder="What would you like to know about your sources?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedModel ? (
                <div className="flex items-center">
                  <Sparkles size={16} className="mr-2 text-thoughtweb-purple" />
                  Using {selectedModel.name}
                  {!isApiKeySet() && (
                    <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">
                      <AlertTriangle size={12} className="mr-1" />
                      API Key Missing
                    </Badge>
                  )}
                </div>
              ) : (
                'Select a model to continue'
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={!query.trim() || isQuerying || !selectedModel}
              className="bg-thoughtweb-purple hover:bg-thoughtweb-purple/90"
            >
              {isQuerying ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Ask
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
      
      {queryResult && (
        <Card className="p-6 bg-thoughtweb-blue/5 border-thoughtweb-blue/10">
          <div className="flex items-center mb-4">
            <Sparkles size={20} className="mr-2 text-thoughtweb-purple" />
            <h2 className="text-xl font-semibold">AI Response</h2>
            {selectedModel && (
              <Badge className="ml-2" variant="outline">
                {selectedModel.name}
              </Badge>
            )}
          </div>
          
          <div className="prose prose-slate max-w-none dark:prose-invert">
            {queryResult.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default QueryInterface;
