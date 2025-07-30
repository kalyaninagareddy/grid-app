import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Palette, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { GridTheme } from './types';

interface ThemePickerProps {
  theme: GridTheme;
  onThemeChange: (theme: GridTheme) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

export function ThemePicker({ theme, onThemeChange }: ThemePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(theme.primaryColor || '#3B82F6');

  const handleColorChange = (color: string) => {
    setCustomColor(color);
  };

  const applyColor = (color: string) => {
    const hsl = hexToHsl(color);
    document.documentElement.style.setProperty('--primary', hsl);
    document.documentElement.style.setProperty('--primary-hover', `${hsl.split(' ')[0]} ${hsl.split(' ')[1]} ${Math.max(parseInt(hsl.split(' ')[2]) - 5, 5)}%`);
    document.documentElement.style.setProperty('--primary-light', `${hsl.split(' ')[0]} ${hsl.split(' ')[1]} 85%`);
    
    onThemeChange({ ...theme, primaryColor: color });
    setIsOpen(false);
  };

  const toggleMode = () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', newMode === 'dark');
    onThemeChange({ ...theme, mode: newMode });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMode}
        className="flex items-center gap-2"
      >
        {theme.mode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        {theme.mode === 'light' ? 'Light' : 'Dark'}
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Choose Primary Color</h4>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => applyColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Custom Color</h4>
                <div className="space-y-3">
                  <HexColorPicker
                    color={customColor}
                    onChange={handleColorChange}
                    style={{ width: '100%', height: '150px' }}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded bg-background"
                      placeholder="#3B82F6"
                    />
                    <Button size="sm" onClick={() => applyColor(customColor)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}