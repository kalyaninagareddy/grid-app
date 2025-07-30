import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThemeAwareSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ThemeAwareSearch({ 
  value, 
  onChange, 
  placeholder = "Search...",
  className = ""
}: ThemeAwareSearchProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        className="theme-input pl-9 pr-9 rounded-md px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20"
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
  );
} 