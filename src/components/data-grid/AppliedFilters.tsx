import React from 'react';
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataGridColumn } from './types';

interface AppliedFiltersProps {
  filters: Array<{ id: string; value: any }>;
  columns: DataGridColumn[];
  onClearFilter: (columnId: string) => void;
  onClearAll: () => void;
}

export function AppliedFilters({ filters, columns, onClearFilter, onClearAll }: AppliedFiltersProps) {
  if (filters.length === 0) return null;

  const getFilterDisplayText = (filter: { id: string; value: any }) => {
    const column = columns.find(col => col.id === filter.id);
    if (!column || !filter.value) return '';

    const { operator, value, secondValue } = filter.value;

    switch (column.type) {
      case 'number':
        switch (operator) {
          case 'eq': return `${column.header} = ${value}`;
          case 'ne': return `${column.header} ≠ ${value}`;
          case 'gt': return `${column.header} > ${value}`;
          case 'gte': return `${column.header} ≥ ${value}`;
          case 'lt': return `${column.header} < ${value}`;
          case 'lte': return `${column.header} ≤ ${value}`;
          case 'between': return `${column.header} between ${value} and ${secondValue}`;
          default: return `${column.header}: ${value}`;
        }

      case 'date':
        switch (operator) {
          case 'eq': return `${column.header} = ${new Date(value).toLocaleDateString()}`;
          case 'ne': return `${column.header} ≠ ${new Date(value).toLocaleDateString()}`;
          case 'gt': return `${column.header} after ${new Date(value).toLocaleDateString()}`;
          case 'gte': return `${column.header} on or after ${new Date(value).toLocaleDateString()}`;
          case 'lt': return `${column.header} before ${new Date(value).toLocaleDateString()}`;
          case 'lte': return `${column.header} on or before ${new Date(value).toLocaleDateString()}`;
          case 'between': return `${column.header} between ${new Date(value).toLocaleDateString()} and ${new Date(secondValue).toLocaleDateString()}`;
          default: return `${column.header}: ${new Date(value).toLocaleDateString()}`;
        }

      case 'largeText':
        return `${column.header} contains "${value}"`;

      case 'text':
        if (Array.isArray(value)) {
          return `${column.header} in (${value.join(', ')})`;
        }
        return `${column.header}: ${value}`;

      case 'select':
      case 'badge':
        switch (operator) {
          case 'eq': return `${column.header} = ${value}`;
          case 'ne': return `${column.header} ≠ ${value}`;
          case 'in': return `${column.header} in (${Array.isArray(value) ? value.join(', ') : value})`;
          case 'not_in': return `${column.header} not in (${Array.isArray(value) ? value.join(', ') : value})`;
          default: return `${column.header}: ${value}`;
        }

      default:
        switch (operator) {
          case 'contains': return `${column.header} contains "${value}"`;
          case 'not_contains': return `${column.header} does not contain "${value}"`;
          case 'starts_with': return `${column.header} starts with "${value}"`;
          case 'ends_with': return `${column.header} ends with "${value}"`;
          case 'eq': return `${column.header} = "${value}"`;
          case 'ne': return `${column.header} ≠ "${value}"`;
          default: return `${column.header}: ${value}`;
        }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-md border">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
      </div>
      
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1"
        >
          <span className="text-xs">{getFilterDisplayText(filter)}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onClearFilter(filter.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  );
} 