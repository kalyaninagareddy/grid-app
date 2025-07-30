import React from 'react';
import { Trash2, Download, Copy, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BulkAction } from './types';
import { Row } from '@tanstack/react-table';

interface BulkActionsProps {
  selectedRows: Row<any>[];
  actions?: BulkAction[];
  onDelete?: (rows: Row<any>[]) => void;
  className?: string;
}

const defaultActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'Delete Selected',
    icon: Trash2,
    variant: 'destructive',
    action: () => {}
  },
  {
    id: 'export',
    label: 'Export Selected',
    icon: Download,
    action: () => {}
  },
  {
    id: 'duplicate',
    label: 'Duplicate Selected',
    icon: Copy,
    action: () => {}
  }
];

export function BulkActions({ 
  selectedRows, 
  actions = defaultActions, 
  onDelete,
  className = ""
}: BulkActionsProps) {
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) {
    return null;
  }

  const handleAction = (action: BulkAction) => {
    if (action.id === 'delete' && onDelete) {
      onDelete(selectedRows);
    } else {
      action.action(selectedRows);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">
        {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
      </span>

      {actions.length <= 3 ? (
        // Show buttons directly if few actions
        actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant || "outline"}
              size="sm"
              onClick={() => handleAction(action)}
              className="flex items-center gap-2"
            >
              {Icon && <Icon className="w-4 h-4" />}
              {action.label}
            </Button>
          );
        })
      ) : (
        // Use dropdown for many actions
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <MoreHorizontal className="w-4 h-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className={`flex items-center gap-2 ${
                    action.variant === 'destructive' ? 'text-destructive' : ''
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}