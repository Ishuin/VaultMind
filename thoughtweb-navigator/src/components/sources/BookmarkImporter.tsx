
import React, { useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BookmarkIcon, Upload, FileText, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BookmarkImporter = () => {
  const { addSource } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to handle the bookmark file import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    // Check if the file is an HTML file (bookmarks are exported as HTML)
    if (file.type !== 'text/html') {
      toast({
        title: 'Invalid file format',
        description: 'Please upload an HTML file containing bookmarks.',
        variant: 'destructive'
      });
      setIsProcessing(false);
      return;
    }
    
    // Read the file contents
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Parse the HTML to extract bookmarks
        // This is a simple implementation and might need to be enhanced for different bookmark formats
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const links = doc.querySelectorAll('a');
        
        if (links.length === 0) {
          toast({
            title: 'No bookmarks found',
            description: 'The file does not contain any bookmarks.',
            variant: 'destructive'
          });
          setIsProcessing(false);
          return;
        }
        
        // Process each bookmark and add it as a source
        let addedCount = 0;
        links.forEach((link) => {
          const url = link.getAttribute('href');
          const name = link.textContent;
          
          if (url && name && url.startsWith('http')) {
            addSource({
              type: 'bookmark',
              name,
              url,
              fileType: 'bookmark'
            });
            addedCount++;
          }
        });
        
        toast({
          title: 'Bookmarks imported',
          description: `Successfully imported ${addedCount} bookmarks.`
        });
      } catch (error) {
        console.error('Error parsing bookmarks:', error);
        toast({
          title: 'Error importing bookmarks',
          description: 'There was an error processing your bookmarks file.',
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Error reading file',
        description: 'There was an error reading your bookmarks file.',
        variant: 'destructive'
      });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookmarkIcon className="h-5 w-5 text-thoughtweb-purple" />
          <h3 className="text-lg font-medium">Import Bookmarks</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Import your bookmarks from an HTML file exported from your browser.
        </p>
        
        <div className="flex flex-col gap-4">
          <Input
            type="file"
            accept=".html"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
            id="bookmark-file"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <FileText className="mr-2 h-4 w-4 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Bookmarks File
              </>
            )}
          </Button>
          
          <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Info className="h-4 w-4 mt-0.5" />
            <p>
              You can export bookmarks from Chrome, Firefox, or Edge. Usually found under Bookmarks &gt; Manage/Export Bookmarks.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookmarkImporter;
