import React, { useState } from 'react';
import { Settings, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataGridColumn } from './types';

interface ColumnVisibilityProps {
  columns: DataGridColumn[];
  visibleColumns: string[];
  onVisibilityChange: (columnId: string, visible: boolean) => void;
  onColumnOrderChange?: (newOrder: string[]) => void;
  currentColumnOrder?: string[];
}

export function ColumnVisibility({ 
  columns, 
  visibleColumns, 
  onVisibilityChange,
  onColumnOrderChange,
  currentColumnOrder
}: ColumnVisibilityProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleToggleAll = () => {
    const allVisible = columns.length === visibleColumns.length;
    columns.forEach(column => {
      onVisibilityChange(column.id, !allVisible);
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex || !onColumnOrderChange || !currentColumnOrder) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...currentColumnOrder];
    const draggedItem = newOrder[dragIndex];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    
    onColumnOrderChange(newOrder);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const allVisible = columns.length === visibleColumns.length;
  const someVisible = visibleColumns.length > 0 && visibleColumns.length < columns.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Column Visibility</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleAll}
              className="text-xs"
            >
              {allVisible ? 'Hide All' : 'Show All'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Checkbox
              id="toggle-all"
              checked={allVisible}
              onCheckedChange={handleToggleAll}
              className="data-[state=indeterminate]:bg-primary"
              {...(someVisible && { 'data-state': 'indeterminate' })}
            />
            <label htmlFor="toggle-all" className="text-sm font-medium">
              All Columns
            </label>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {(currentColumnOrder || columns.map(col => col.id)).map((columnId, index) => {
                const column = columns.find(col => col.id === columnId);
                if (!column) return null;
                
                const isVisible = visibleColumns.includes(column.id);
                const isDragging = dragIndex === index;
                const isDragOver = dragOverIndex === index;
                
                return (
                  <div
                    key={column.id}
                    className={`column-visibility-item flex items-center space-x-2 p-2 rounded-md ${
                      isDragging ? 'dragging' : ''
                    } ${
                      isDragOver ? 'drag-over' : ''
                    }`}
                    draggable={!!onColumnOrderChange}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {onColumnOrderChange && (
                      <div className="column-visibility-drag-handle flex-shrink-0">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <Checkbox
                      id={column.id}
                      checked={isVisible}
                      onCheckedChange={(checked) => 
                        onVisibilityChange(column.id, !!checked)
                      }
                    />
                    <label
                      htmlFor={column.id}
                      className="text-sm cursor-pointer flex items-center gap-2 flex-1"
                    >
                      {isVisible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-muted-foreground" />
                      )}
                      {column.header}
                    </label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}