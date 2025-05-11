
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Globe, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WebsiteSourceInput = () => {
  const { addSource } = useAppContext();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !name) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and URL.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive"
      });
      return;
    }

    addSource({
      type: 'website',
      name,
      url
    });

    toast({
      title: "Website added",
      description: `${name} has been added to your sources.`
    });

    // Reset form
    setUrl('');
    setName('');
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Add Website Source</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="websiteName" className="block text-sm font-medium mb-1">
            Website Name
          </label>
          <Input
            id="websiteName"
            placeholder="e.g., Research Paper on AI Ethics"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium mb-1">
            Website URL
          </label>
          <div className="flex space-x-2">
            <Input
              id="websiteUrl"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Plus size={16} className="mr-2" />
              Add
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default WebsiteSourceInput;
