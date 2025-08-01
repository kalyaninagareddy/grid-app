import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LargeTextEditorProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  maxLength?: number;
  rows?: number;
  cols?: number;
}

export function LargeTextEditor({
  value,
  onSave,
  onCancel,
  maxLength = 200,
  rows = 10,
  cols = 60
}: LargeTextEditorProps) {
  const [text, setText] = useState(value);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
    }
  }, []);

  const handleSave = () => {
    onSave(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const remainingChars = maxLength - text.length;

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent 
        className={`large-text-editor-dialog ${isFullscreen ? 'w-[90vw] h-[90vh] max-w-none' : 'w-[600px] max-w-[90vw]'}`}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">Edit Description</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter description..."
              className={`large-text-editor-textarea resize-none font-mono text-sm ${
                isFullscreen ? 'h-[calc(90vh-200px)]' : 'h-[300px]'
              }`}
              style={{
                width: isFullscreen ? '100%' : `${cols * 8}px`,
                minHeight: `${rows * 20}px`
              }}
              maxLength={maxLength}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {remainingChars >= 0 ? (
                <span className={remainingChars < 20 ? 'text-orange-500' : ''}>
                  {remainingChars} characters remaining
                </span>
              ) : (
                <span className="text-red-500">
                  {Math.abs(remainingChars)} characters over limit
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={text.length > maxLength}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 