
import React from 'react';
import { Card } from '@/components/ui/card';
import { BookmarkIcon, Lock } from 'lucide-react';

const BookmarkImporter = () => {
  return (
    <Card className="p-6 opacity-60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <BookmarkIcon size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Import Bookmarks</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Import bookmarks from your browser
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
          <Lock size={12} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Coming Soon</span>
        </div>
      </div>
    </Card>
  );
};

export default BookmarkImporter;
