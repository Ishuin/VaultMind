
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, File, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SourcesList = () => {
  const { sources, removeSource } = useAppContext();

  const websiteSources = sources.filter(source => source.type === 'website');
  const fileSources = sources.filter(source => source.type === 'file');

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <File size={16} className="text-red-500" />;
      case 'doc':
        return <File size={16} className="text-blue-500" />;
      case 'txt':
        return <File size={16} className="text-gray-500" />;
      default:
        return <File size={16} />;
    }
  };

  const formatDate = (date: Date) => {
    // Parse the date if it's a string (which it might be after JSON serialization)
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Knowledge Sources</h2>
      
      <Tabs defaultValue="websites" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="websites" className="flex items-center">
            <Globe size={16} className="mr-2" />
            Websites ({websiteSources.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center">
            <File size={16} className="mr-2" />
            Files ({fileSources.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="websites">
          {websiteSources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe size={48} className="mx-auto mb-4 opacity-20" />
              <p>No website sources added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {websiteSources.map(source => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe size={20} className="text-thoughtweb-purple" />
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline flex items-center"
                        >
                          {source.url}
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Added {formatDate(source.dateAdded)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeSource(source.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="files">
          {fileSources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <File size={48} className="mx-auto mb-4 opacity-20" />
              <p>No file sources added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fileSources.map(source => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(source.fileType)}
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        {source.filePath && (
                          <a 
                            href={source.filePath} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline flex items-center"
                          >
                            View file
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Added {formatDate(source.dateAdded)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeSource(source.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SourcesList;
