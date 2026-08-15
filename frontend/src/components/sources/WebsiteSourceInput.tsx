
import React from 'react';
import { Card } from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';

const WebsiteSourceInput = () => {
  return (
    <Card className="p-6 mb-8 opacity-60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Globe size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Add Website Source</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Import content from any webpage
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

export default WebsiteSourceInput;
