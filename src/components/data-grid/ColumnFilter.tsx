import React, { useState, useEffect, useMemo } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataGridColumn } from './types';

interface ColumnFilterProps {
  column: DataGridColumn;
  value: any;
  data: any[];
  onFilterChange: (value: any) => void;
  onClear: () => void;
}

interface FilterState {
  operator: string;
  value: any;
  secondValue?: any; // For range filters
}

const numberOperators = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not equals' },
  { value: 'gt', label: 'Greater than' },
  { value: 'gte', label: 'Greater than or equal' },
  { value: 'lt', label: 'Less than' },
  { value: 'lte', label: 'Less than or equal' },
  { value: 'between', label: 'Between' },
];

const textOperators = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not equals' },
];

const dateOperators = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not equals' },
  { value: 'gt', label: 'After' },
  { value: 'gte', label: 'On or after' },
  { value: 'lt', label: 'Before' },
  { value: 'lte', label: 'On or before' },
  { value: 'between', label: 'Between' },
];

export function ColumnFilter({ column, value, data, onFilterChange, onClear }: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    operator: '',
    value: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique values for text columns
  const uniqueValues = useMemo(() => {
    if (column.type === 'text') {
      const values = data
        .map(row => row[column.accessorKey as string])
        .filter(val => val !== null && val !== undefined && val !== '')
        .map(val => val.toString());
      return [...new Set(values)].sort();
    }
    return [];
  }, [data, column]);

  // Filter unique values based on search term
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    return uniqueValues.filter(val => 
      val.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  useEffect(() => {
    if (value) {
      setFilterState(value);
    }
  }, [value]);

  const getOperators = () => {
    switch (column.type) {
      case 'number':
        return numberOperators;
      case 'date':
        return dateOperators;
      case 'text':
      case 'largeText':
      default:
        return textOperators;
    }
  };

  const handleApply = () => {
    // For largeText, just check if value exists
    if (column.type === 'largeText') {
      if (filterState.value && filterState.value.trim() !== '') {
        onFilterChange({ operator: 'contains', value: filterState.value });
      }
    }
    // For text columns with checkboxes, check if any values are selected
    else if (column.type === 'text') {
      if (Array.isArray(filterState.value) && filterState.value.length > 0) {
        onFilterChange({ operator: 'in', value: filterState.value });
      }
    }
    // For number columns, check if operator exists and value is not empty string
    else if (column.type === 'number') {
      if (filterState.operator && filterState.value !== '') {
        onFilterChange(filterState);
      }
    }
    // For date columns, check if operator exists and value is not empty string
    else if (column.type === 'date') {
      if (filterState.operator && filterState.value !== '') {
        onFilterChange(filterState);
      }
    }
    // For other types, check if operator and value exist
    else if (filterState.operator && filterState.value !== '') {
      onFilterChange(filterState);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilterState({ operator: '', value: '' });
    onClear();
    setIsOpen(false);
  };

  const renderFilterInput = () => {
    const { operator, value, secondValue } = filterState;

    switch (column.type) {
      case 'number':
        return (
          <div className="space-y-2">
            <Select value={operator} onValueChange={(val) => setFilterState(prev => ({ ...prev, operator: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {getOperators().map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              placeholder="Enter value"
              value={value || ''}
              onChange={(e) => setFilterState(prev => ({ ...prev, value: e.target.value }))}
            />
            
            {operator === 'between' && (
              <Input
                type="number"
                placeholder="Enter second value"
                value={secondValue || ''}
                onChange={(e) => setFilterState(prev => ({ ...prev, secondValue: e.target.value }))}
              />
            )}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Select value={operator} onValueChange={(val) => setFilterState(prev => ({ ...prev, operator: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {getOperators().map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {operator === 'between' ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                  <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date) => setFilterState(prev => ({ ...prev, value: date?.toISOString().split('T')[0] }))}
                    className="rounded-md border"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                  <Calendar
                    mode="single"
                    selected={secondValue ? new Date(secondValue) : undefined}
                    onSelect={(date) => setFilterState(prev => ({ ...prev, secondValue: date?.toISOString().split('T')[0] }))}
                    className="rounded-md border"
                  />
                </div>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => setFilterState(prev => ({ ...prev, value: date?.toISOString().split('T')[0] }))}
                className="rounded-md border"
              />
            )}
          </div>
        );

      case 'largeText':
        return (
          <div className="space-y-2">
            <Input
              placeholder="Search in description..."
              value={value || ''}
              onChange={(e) => setFilterState(prev => ({ ...prev, value: e.target.value }))}
            />
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search values..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {filteredValues.map((val) => (
                  <label key={val} className="flex items-center space-x-2 p-1 hover:bg-muted rounded">
                    <Checkbox
                      checked={Array.isArray(value) && value.includes(val)}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(value) ? value : [];
                        const newValues = checked
                          ? [...currentValues, val]
                          : currentValues.filter(v => v !== val);
                        setFilterState(prev => ({ ...prev, value: newValues }));
                      }}
                    />
                    <span className="text-sm truncate">{val}</span>
                  </label>
                ))}
                {filteredValues.length === 0 && (
                  <div className="text-sm text-muted-foreground p-2 text-center">
                    No values found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );

      case 'select':
      case 'badge':
        return (
          <div className="space-y-2">
            <Select value={operator} onValueChange={(val) => setFilterState(prev => ({ ...prev, operator: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eq">Equals</SelectItem>
                <SelectItem value="ne">Not equals</SelectItem>
                <SelectItem value="in">In</SelectItem>
                <SelectItem value="not_in">Not in</SelectItem>
              </SelectContent>
            </Select>
            
            {column.options && (operator === 'in' || operator === 'not_in') ? (
              <div className="space-y-1">
                {column.options.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={Array.isArray(value) && value.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(value) ? value : [];
                        const newValues = checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value);
                        setFilterState(prev => ({ ...prev, value: newValues }));
                      }}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <Select value={value} onValueChange={(val) => setFilterState(prev => ({ ...prev, value: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  {column.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );

      default: // other types
        return (
          <div className="space-y-2">
            <Select value={operator} onValueChange={(val) => setFilterState(prev => ({ ...prev, operator: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {getOperators().map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Enter value"
              value={value || ''}
              onChange={(e) => setFilterState(prev => ({ ...prev, value: e.target.value }))}
            />
          </div>
        );
    }
  };

  const hasActiveFilter = value && (value.operator || value.value);
  
  // Determine popover width based on filter type and operator
  const getPopoverWidth = () => {
    if (column.type === 'date' && filterState.operator === 'between') {
      return 'w-[320px] sm:w-[600px]';
    } else if (column.type === 'date') {
      return 'w-[320px] sm:w-[350px]';
    } else if (column.type === 'text') {
      return 'w-[320px] sm:w-[400px]';
    } else {
      return 'w-[320px] sm:w-[350px]';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${hasActiveFilter ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${getPopoverWidth()} p-4`} align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Filter {column.header}</h4>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {renderFilterInput()}
          
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 