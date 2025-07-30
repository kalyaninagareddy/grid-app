import React, { useState, useEffect } from 'react';
import { Filter, Search, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DataGridColumn, FilterValue } from './types';
import { format } from 'date-fns';

interface ColumnFiltersProps {
  columns: DataGridColumn[];
  filters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
}

export function ColumnFilters({
  columns,
  filters,
  onFiltersChange,
}: ColumnFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: boolean }>({});

  const getFilterValue = (columnId: string): any => {
    return filters.find((f) => f.id === columnId)?.value || '';
  };

  const updateFilter = (columnId: string, value: any, type: FilterValue['type']) => {
    const newFilters = filters.filter((f) => f.id !== columnId);
    if (value !== '' && value !== null && value !== undefined) {
      newFilters.push({ id: columnId, value, type });
    }
    console.log('Applying filter:', columnId, value, type);
    onFiltersChange(newFilters);
  };

  const clearFilter = (columnId: string) => {
    const newFilters = filters.filter((f) => f.id !== columnId);
    onFiltersChange(newFilters);
    setActiveFilters((prev) => ({ ...prev, [columnId]: false }));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
    setActiveFilters({});
  };

  const hasActiveFilters = filters.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filters:</span>
      </div>

      {columns
        .filter((col) => col.filterable)
        .map((column) => {
          const isActive = activeFilters[column.id] || filters.some((f) => f.id === column.id);
          const filterValue = getFilterValue(column.id);

          return (
            <Popover
              key={column.id}
              open={activeFilters[column.id]}
              onOpenChange={(open) => setActiveFilters((prev) => ({ ...prev, [column.id]: open }))}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={isActive && filterValue ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {column.header}
                  {isActive && filterValue && (
                    <X
                      className="w-3 h-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFilter(column.id);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <FilterContent
                  column={column}
                  value={filterValue}
                  onValueChange={(value, type) => updateFilter(column.id, value, type)}
                  onClear={() => clearFilter(column.id)}
                />
              </PopoverContent>
            </Popover>
          );
        })}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      )}
    </div>
  );
}

interface FilterContentProps {
  column: DataGridColumn;
  value: any;
  onValueChange: (value: any, type: FilterValue['type']) => void;
  onClear: () => void;
}

function FilterContent({ column, value, onValueChange, onClear }: FilterContentProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getFilterType = (col: DataGridColumn): FilterValue['type'] => {
    switch (col.type) {
      case 'select':
        return 'select';
      case 'date':
        return 'date';
      default:
        return 'text';
    }
  };

  const handleApply = () => {
    console.log('Filter applied:', localValue);
    onValueChange(localValue, getFilterType(column));
  };

  if (column.type === 'select' && column.options) {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Filter by {column.header}</h4>
        <Select
          value={localValue}
          onValueChange={(val) => {
            setLocalValue(val);
            onValueChange(val, 'select'); // Apply immediately on selection
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value..." />
          </SelectTrigger>
          <SelectContent>
            {column.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button onClick={onClear} variant="outline" size="sm">
            Clear
          </Button>
        </div>
      </div>
    );
  }

  if (column.type === 'date') {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Filter by {column.header}</h4>
        <CalendarComponent
          mode="single"
          selected={localValue ? new Date(localValue) : undefined}
          onSelect={(date) => {
            const formatted = date ? format(date, 'yyyy-MM-dd') : '';
            setLocalValue(formatted);
            if (formatted) {
              onValueChange(formatted, 'date'); // Apply immediately
            }
          }}
          className="rounded-md border"
        />
        <div className="flex gap-2">
          <Button onClick={onClear} variant="outline" size="sm">
            Clear
          </Button>
        </div>
      </div>
    );
  }

  // Default text filter
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Filter by {column.header}</h4>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={`Search ${column.header.toLowerCase()}...`}
          className="pl-10"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleApply();
            }
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleApply} size="sm" className="flex-1">
          Apply
        </Button>
        <Button onClick={onClear} variant="outline" size="sm">
          Clear
        </Button>
      </div>
    </div>
  );
}
