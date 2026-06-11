
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import WebsiteSourceInput from '@/components/sources/WebsiteSourceInput';
import FileUploader from '@/components/sources/FileUploader';
import BookmarkImporter from '@/components/sources/BookmarkImporter';
import SourcesList from '@/components/sources/SourcesList';
import { Database } from 'lucide-react';

const Sources = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4"> {/* Adjusted container for consistency */}
        <div className="mb-8 text-center">
          <div className="inline-block relative mb-4">
            {/* Conditional gradient glow for dark mode only */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00f6ff] via-[#ff00e5] to-[#3300ff] blur-xl opacity-0 dark:opacity-30 animate-pulse"></div>
            <div className="relative flex items-center justify-center h-16 w-16 mx-auto">
              <Database size={32} className="text-primary dark:text-[#00f6ff] dark:glow-text" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary dark:text-[#00f6ff] dark:glow-text mb-2">Knowledge Sources</h1>
          <p className="text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Manage your knowledge sources by adding websites, uploading documents, and importing bookmarks.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <div className="glass-panel p-6 rounded-3xl"> {/* Added glass-panel styling */}
            <WebsiteSourceInput />
          </div>
          <div className="glass-panel p-6 rounded-3xl"> {/* Added glass-panel styling */}
            <BookmarkImporter />
          </div>
          <div className="glass-panel p-6 rounded-3xl"> {/* Added glass-panel styling */}
            <FileUploader />
          </div>
          <div className="glass-panel p-6 rounded-3xl"> {/* Added glass-panel styling */}
            <SourcesList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Sources;
