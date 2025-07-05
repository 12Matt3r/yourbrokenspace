
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Palette, Sun, Moon, Sparkles, Sprout, Gamepad2, CircuitBoard } from 'lucide-react';

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Switch Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('default')}>
          <Sparkles className="mr-2 h-4 w-4" />
          <span>Default Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('zen-garden')}>
           <Sprout className="mr-2 h-4 w-4" />
          <span>Zen Garden</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('arcade-retro')}>
           <Gamepad2 className="mr-2 h-4 w-4" />
          <span>Arcade Retro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('cyberpunk')}>
           <CircuitBoard className="mr-2 h-4 w-4" />
          <span>Cyberpunk</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
