import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DensityOption {
  label: string;
  value: 'compact' | 'comfortable' | 'spacious';
  row: string;
  cell: string;
  header: string;
}

interface DensitySelectorProps {
  value: 'compact' | 'comfortable' | 'spacious';
  onChange: (value: 'compact' | 'comfortable' | 'spacious') => void;
  options: DensityOption[];
}

export function DensitySelector({ value, onChange, options }: DensitySelectorProps) {
  const currentOption = options.find(opt => opt.value === value);

  console.log('DensitySelector - Current value:', value, 'Current option:', currentOption);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-medium bg-background text-foreground border-input hover:bg-muted/50 hover:border-primary/50 transition-colors"
        >
          <span className="mr-2">{currentOption?.label || 'Density'}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-32 bg-background border-input"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              console.log('DensitySelector - Changing to:', option.value);
              onChange(option.value);
            }}
            className={`text-xs cursor-pointer ${
              value === option.value
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-muted/50'
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 