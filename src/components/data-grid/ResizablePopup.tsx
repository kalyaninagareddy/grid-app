import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Maximize2, Minimize2, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ResizablePopupProps {
  content: string;
  onClose: () => void;
  onSave?: (value: string) => void;
  anchorElement: HTMLElement | null;
  isEditable?: boolean;
}

interface Position {
  top: number;
  left: number;
}

interface Size {
  width: number;
  height: number;
}

export function ResizablePopup({ 
  content, 
  onClose, 
  onSave, 
  anchorElement, 
  isEditable = false 
}: ResizablePopupProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [size, setSize] = useState<Size>({ width: 400, height: 300 });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  
  const popupRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isResizing = useRef(false);
  const resizeDirection = useRef<string>('');
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 });

  // Calculate optimal position to keep popup within viewport
  const calculatePosition = useCallback((anchorRect: DOMRect): Position => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = size.width;
    const popupHeight = size.height;
    
    let left = anchorRect.left;
    let top = anchorRect.bottom + 5;

    // Adjust horizontal position if popup would go off-screen
    if (left + popupWidth > viewportWidth - 20) {
      left = Math.max(20, viewportWidth - popupWidth - 20);
    }
    
    // If popup would go off the right edge, try positioning it to the left of the anchor
    if (left < 20) {
      left = Math.max(20, anchorRect.right - popupWidth);
    }

    // Adjust vertical position if popup would go off-screen
    if (top + popupHeight > viewportHeight - 20) {
      // Try positioning above the anchor
      if (anchorRect.top > popupHeight + 20) {
        top = anchorRect.top - popupHeight - 5;
      } else {
        // If still doesn't fit, position at the top of viewport
        top = 20;
      }
    }

    return { top, left };
  }, [size]);

  useEffect(() => {
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      const newPosition = calculatePosition(rect);
      setPosition(newPosition);
    }
  }, [anchorElement, calculatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    isResizing.current = true;
    resizeDirection.current = direction;
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      left: position.left,
      top: position.top
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    const direction = resizeDirection.current;

    let newWidth = startPos.current.width;
    let newHeight = startPos.current.height;
    let newLeft = startPos.current.left;
    let newTop = startPos.current.top;

    // Handle different resize directions
    if (direction.includes('e')) {
      newWidth = Math.max(300, startPos.current.width + deltaX);
    }
    if (direction.includes('w')) {
      const widthChange = Math.min(deltaX, startPos.current.width - 300);
      newWidth = startPos.current.width - widthChange;
      newLeft = startPos.current.left + widthChange;
    }
    if (direction.includes('s')) {
      newHeight = Math.max(200, startPos.current.height + deltaY);
    }
    if (direction.includes('n')) {
      const heightChange = Math.min(deltaY, startPos.current.height - 200);
      newHeight = startPos.current.height - heightChange;
      newTop = startPos.current.top + heightChange;
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ left: newLeft, top: newTop });
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleEdit = () => {
    if (isEditable) {
      setIsEditing(true);
      setEditValue(content);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div 
          ref={popupRef}
          className="large-text-popup bg-background border rounded-lg shadow-lg w-[90vw] h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Description</h3>
            <div className="flex items-center gap-2">
              {isEditable && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {isEditing ? (
              <Textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-full resize-none border-0 focus:ring-0 focus:border-0 focus:outline-none text-sm leading-relaxed"
                onKeyDown={handleKeyDown}
                placeholder="Enter description..."
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {content}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={popupRef}
      className="large-text-popup fixed z-50 bg-background border rounded-lg shadow-lg flex flex-col"
      style={{
        top: position.top,
        left: position.left,
        width: size.width,
        height: size.height
      }}
    >
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold">Description</h3>
        <div className="flex items-center gap-1">
          {isEditable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-6 w-6 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-6 w-6 p-0"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-3 overflow-auto">
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full h-full resize-none border-0 focus:ring-0 focus:border-0 focus:outline-none text-sm leading-relaxed"
            onKeyDown={handleKeyDown}
            placeholder="Enter description..."
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </div>
        )}
      </div>
      
      {/* Resize handles */}
      <div className="resize-handle-n absolute top-0 left-0 right-0 h-1 cursor-n-resize" onMouseDown={(e) => handleMouseDown(e, 'n')} />
      <div className="resize-handle-s absolute bottom-0 left-0 right-0 h-1 cursor-s-resize" onMouseDown={(e) => handleMouseDown(e, 's')} />
      <div className="resize-handle-e absolute top-0 right-0 bottom-0 w-1 cursor-e-resize" onMouseDown={(e) => handleMouseDown(e, 'e')} />
      <div className="resize-handle-w absolute top-0 left-0 bottom-0 w-1 cursor-w-resize" onMouseDown={(e) => handleMouseDown(e, 'w')} />
      
      {/* Corner resize handles */}
      <div className="resize-handle-ne absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onMouseDown={(e) => handleMouseDown(e, 'ne')} />
      <div className="resize-handle-nw absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onMouseDown={(e) => handleMouseDown(e, 'nw')} />
      <div className="resize-handle-se absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onMouseDown={(e) => handleMouseDown(e, 'se')} />
      <div className="resize-handle-sw absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onMouseDown={(e) => handleMouseDown(e, 'sw')} />
    </div>
  );
} 