import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  columns?: { id: string; header: string }[];
  selectedColumns?: string[];
  onSelectedColumnsChange?: (cols: string[]) => void;
}

export function GlobalSearch({ value, onChange, placeholder }: GlobalSearchProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          className="theme-input pl-8 pr-8 rounded px-3 py-2 text-sm w-64"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}