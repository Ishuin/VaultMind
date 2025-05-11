
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
      <div className="container max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-thoughtweb-blue/10 rounded-full">
              <Database size={48} className="text-thoughtweb-purple" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Knowledge Sources</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage your knowledge sources by adding websites, uploading documents, and importing bookmarks.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <WebsiteSourceInput />
          <BookmarkImporter />
          <FileUploader />
          <SourcesList />
        </div>
      </div>
    </MainLayout>
  );
};

export default Sources;
