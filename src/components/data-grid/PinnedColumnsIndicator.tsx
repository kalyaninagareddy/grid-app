import React from 'react';
import { Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PinnedColumnsIndicatorProps {
  pinnedColumns: {
    left: string[];
    right: string[];
  };
  columns: Array<{ id: string; header: string }>;
  onUnpinColumn: (columnId: string) => void;
}

export function PinnedColumnsIndicator({ 
  pinnedColumns, 
  columns, 
  onUnpinColumn 
}: PinnedColumnsIndicatorProps) {
  const allPinnedColumns = [...pinnedColumns.left, ...pinnedColumns.right];
  
  if (allPinnedColumns.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border">
      <div className="flex items-center gap-1">
        <Pin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Pinned:</span>
      </div>
      
      <div className="flex items-center gap-1 flex-wrap">
        {pinnedColumns.left.map((columnId) => {
          const column = columns.find(col => col.id === columnId);
          return (
            <Badge
              key={columnId}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <Pin className="h-3 w-3 text-blue-500" />
              {column?.header || columnId}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onUnpinColumn(columnId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
        
        {pinnedColumns.right.map((columnId) => {
          const column = columns.find(col => col.id === columnId);
          return (
            <Badge
              key={columnId}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <Pin className="h-3 w-3 text-green-500" />
              {column?.header || columnId}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onUnpinColumn(columnId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
} 