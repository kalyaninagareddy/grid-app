import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, FileText, Eye } from 'lucide-react';
import { CellRendererProps } from './types';
import { LargeTextEditor } from './LargeTextEditor';
import { ResizablePopup } from './ResizablePopup';

// Text Cell Renderer
export function TextCell({ value, row, column, isEditing, onSave, onCancel }: CellRendererProps) {
  const [editValue, setEditValue] = useState(value || '');

  useEffect(() => {
    setEditValue(value || '');
  }, [value, isEditing]);

  if (isEditing && column.editable) {
    return (
      <div className="flex items-center gap-1 w-full">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 h-6 text-xs border-0 bg-transparent p-0 focus:ring-0 focus:border-0 focus:outline-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave?.(editValue);
            } else if (e.key === 'Escape') {
              onCancel?.();
            }
          }}
        />
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-5 w-5 p-0 hover:bg-green-100 hover:text-green-600 transition-colors" 
          onClick={() => onSave?.(editValue)}
          title="Save changes"
        >
          <Check className="w-2.5 h-2.5" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600 transition-colors" 
          onClick={() => onCancel?.()}
          title="Cancel editing"
        >
          <X className="w-2.5 h-2.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group">
      <span className="truncate">{value}</span>
      {column.editable && (
        <Edit className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 cursor-pointer text-muted-foreground hover:text-foreground transition-all" />
      )}
    </div>
  );
}

// Number Cell Renderer
export function NumberCell({ value, row, column, isEditing, onSave, onCancel }: CellRendererProps) {
  const [editValue, setEditValue] = useState(value || 0);

  useEffect(() => {
    setEditValue(value || 0);
  }, [value, isEditing]);

  if (isEditing && column.editable) {
    return (
      <div className="flex items-center gap-1 w-full">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
          className="flex-1 h-6 text-xs border-0 bg-transparent p-0 focus:ring-0 focus:border-0 focus:outline-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave?.(editValue);
            } else if (e.key === 'Escape') {
              onCancel?.();
            }
          }}
        />
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-5 w-5 p-0 hover:bg-green-100 hover:text-green-600 transition-colors" 
          onClick={() => onSave?.(editValue)}
          title="Save changes"
        >
          <Check className="w-2.5 h-2.5" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600 transition-colors" 
          onClick={() => onCancel?.()}
          title="Cancel editing"
        >
          <X className="w-2.5 h-2.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group">
      <span className="font-mono">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      {column.editable && (
        <Edit className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 cursor-pointer text-muted-foreground hover:text-foreground transition-all" />
      )}
    </div>
  );
}

// Select Cell Renderer
export function SelectCell({ value, row, column, isEditing, onSave, onCancel }: CellRendererProps) {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value, isEditing]);

  if (isEditing && column.editable && column.options) {
    return (
      <div className="flex items-center gap-1 w-full">
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="flex-1 h-6 text-xs border-0 bg-transparent p-0 focus:ring-0 focus:border-0 focus:outline-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {column.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-5 w-5 p-0 hover:bg-green-100 hover:text-green-600 transition-colors" 
          onClick={() => onSave?.(editValue)}
          title="Save changes"
        >
          <Check className="w-2.5 h-2.5" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600 transition-colors" 
          onClick={() => onCancel?.()}
          title="Cancel editing"
        >
          <X className="w-2.5 h-2.5" />
        </Button>
      </div>
    );
  }

  const selectedOption = column.options?.find(opt => opt.value === value);
  return (
    <div className="flex items-center justify-between group">
      <span>{selectedOption?.label || value}</span>
      {column.editable && (
        <Edit className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 cursor-pointer text-muted-foreground hover:text-foreground transition-all" />
      )}
    </div>
  );
}

// Badge Cell Renderer
export function BadgeCell({ value, row, column }: CellRendererProps) {
  const getBadgeVariant = (val: string) => {
    switch (val?.toLowerCase()) {
      case 'active':
      case 'success':
      case 'completed':
        return 'default';
      case 'inactive':
      case 'error':
      case 'failed':
        return 'destructive';
      case 'pending':
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getBadgeVariant(value)} className="capitalize">
      {value}
    </Badge>
  );
}

// Image Cell Renderer
export function ImageCell({ value, row, column }: CellRendererProps) {
  return (
    <div className="flex items-center">
      {value ? (
        <img
          src={value}
          alt="Cell image"
          className="w-8 h-8 rounded object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      ) : (
        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">N/A</span>
        </div>
      )}
    </div>
  );
}

// Chart Cell Renderer (Simple bar chart)
export function ChartCell({ value, row, column }: CellRendererProps) {
  const numValue = parseFloat(value) || 0;
  const maxValue = 100; // Could be passed as a prop
  const percentage = Math.min((numValue / maxValue) * 100, 100);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">
        {numValue}
      </span>
    </div>
  );
}

// Large Text Cell Renderer
export function LargeTextCell({ value, row, column, isEditing, onSave, onCancel }: CellRendererProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    if (column.editable) {
      setShowEditor(true);
    }
  };

  const handleSave = (newValue: string) => {
    onSave?.(newValue);
    setShowEditor(false);
  };

  const handleCancel = () => {
    setShowEditor(false);
    onCancel?.();
  };

  const handleCellDoubleClick = () => {
    if (column.editable) {
      handleEdit();
    }
  };



  const handlePopupClose = () => {
    setShowPopup(false);
  };

  // Show editor in popup
  if (showEditor) {
    return (
      <LargeTextEditor
        value={value || ''}
        onSave={handleSave}
        onCancel={handleCancel}
        maxLength={500}
        rows={15}
        cols={80}
      />
    );
  }

  // Display text based on column width
  const displayText = value || '';
  const isLongText = displayText.length > 50;
  const truncatedText = isLongText ? displayText.substring(0, 50) + '...' : displayText;

  return (
    <>
      <div 
        ref={cellRef}
        className="flex items-center justify-between group large-text-cell cursor-pointer"
        onDoubleClick={handleCellDoubleClick}
      >
        <div className="flex items-center flex-1 min-w-0">
          <span className="text-sm truncate">
            {truncatedText}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isLongText && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(true);
              }}
              title="View full description"
            >
              <Eye className="w-3 h-3" />
            </Button>
          )}
          {column.editable && (
            <Edit className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 cursor-pointer text-muted-foreground hover:text-foreground transition-all" />
          )}
        </div>
      </div>

      {/* Content Popup */}
      {showPopup && (
        <ResizablePopup
          content={displayText}
          onClose={handlePopupClose}
          onSave={handleSave}
          anchorElement={cellRef.current}
          isEditable={column.editable}
        />
      )}
    </>
  );
}

// Main Cell Renderer Factory
export function CellRenderer(props: CellRendererProps) {
  const { column } = props;

  switch (column.type) {
    case 'number':
      return <NumberCell {...props} />;
    case 'select':
      return <SelectCell {...props} />;
    case 'badge':
      return <BadgeCell {...props} />;
    case 'image':
      return <ImageCell {...props} />;
    case 'chart':
      return <ChartCell {...props} />;
    case 'largeText':
      return <LargeTextCell {...props} />;
    case 'text':
    default:
      return <TextCell {...props} />;
  }
}